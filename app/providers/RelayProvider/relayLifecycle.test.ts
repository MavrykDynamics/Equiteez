import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import type {
  RelayOperation,
  RelaySubmitRequest,
} from "~/lib/apis/rwa/relay/relay.types";
import { RelayApiError } from "~/lib/relay/relay.errors";
import {
  assertNoStoredRelayLock,
  readRelayRecords,
  type RelayStorage,
} from "~/lib/relay/relay.storage";
import { isStillProcessing, mergeRelayRow } from "~/lib/relay/relay.state";
import { RelayLifecycle } from "./relayLifecycle";
vi.mock("~/lib/apis/rwa/client", () => ({ rwaApi: {} }));
const id = "11111111-1111-4111-8111-111111111111";
const id2 = "22222222-2222-4222-8222-222222222222";
const intent = {
  kind: "process_refund",
  orderbookAddress: "book",
  orderId: "1",
  orderType: "BUY",
} as const;
const payload: RelaySubmitRequest = {
  intent,
  idempotencyKey: "click-one",
  operation: {
    to: "book",
    parameter: {
      entrypoint: "permitAndExecute",
      value: [{ prim: "Pair", args: [{ string: "signed-secret" }] }],
    },
  },
};
const row = (overrides: Partial<RelayOperation> = {}): RelayOperation => ({
  operationId: id,
  gasStationOperationId: null,
  status: "pending",
  intentKind: intent.kind,
  intent,
  contractAddress: "book",
  permitVariant: "permitProcessRefund",
  opHash: null,
  feeChargedUnits: null,
  error: null,
  createdAt: "2026-10-22T00:00:00Z",
  updatedAt: "2026-10-22T00:00:01Z",
  settledAt: null,
  ...overrides,
});
function memory(): RelayStorage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    key: (i) => [...values.keys()][i] ?? null,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}
const owners: RelayLifecycle[] = [];
function setup(storage = memory(), scope = "scope") {
  let current = true;
  const transport = {
    submitRelayOperation: vi.fn().mockResolvedValue({
      operationId: id,
      gasStationOperationId: "station",
      status: "pending",
    }),
    fetchRelayOperation: vi.fn().mockResolvedValue({ operation: row() }),
    checkRelayOperationNow: vi.fn().mockResolvedValue({ operation: row() }),
    fetchRelayOperations: vi
      .fn()
      .mockResolvedValue({ items: [], nextCursor: null }),
  };
  const notify = vi.fn(),
    outcome = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const owner = new RelayLifecycle({
    scope,
    wallet: "wallet",
    storage,
    queryClient,
    isCurrent: () => current,
    changed: vi.fn(),
    notify,
    outcome,
    api: transport,
  });
  owners.push(owner);
  return {
    owner,
    transport,
    notify,
    outcome,
    storage,
    queryClient,
    leave: () => {
      current = false;
    },
  };
}
async function ready(test: ReturnType<typeof setup>) {
  test.owner.start();
  await test.owner.reconcile();
  return test;
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-22T00:01:00Z"));
});
afterEach(() => {
  owners.splice(0).forEach((owner) => owner.stop());
  vi.useRealTimers();
});

describe("durable relay lifecycle", () => {
  it("persists exact signed payload before POST; acceptance seeds partial cache and immediately fetches our ID", async () => {
    const t = await ready(setup());
    let resolve!: (value: { operation: RelayOperation }) => void;
    t.transport.fetchRelayOperation.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        })
    );
    t.transport.submitRelayOperation.mockImplementation(async () => {
      expect(readRelayRecords(t.storage, "scope")[0].payload).toEqual(payload);
      return {
        operationId: id,
        gasStationOperationId: "station",
        status: "pending",
      };
    });
    const submission = t.owner.submit(payload, async () => {});
    await vi.advanceTimersByTimeAsync(0);
    expect(t.owner.row(id)).toMatchObject({ status: "pending", intent });
    expect(t.owner.row(id)?.updatedAt).toBeUndefined();
    expect(t.notify).not.toHaveBeenCalled();
    expect(t.transport.fetchRelayOperation.mock.calls[0].slice(0, 2)).toEqual([
      "wallet",
      id,
    ]);
    resolve({ operation: row() });
    await submission;
  });
  it("does not POST when durable storage fails", async () => {
    const t = await ready(setup());
    t.storage.setItem = () => {
      throw new Error("quota");
    };
    await expect(t.owner.submit(payload, async () => {})).rejects.toThrow();
    expect(t.transport.submitRelayOperation).not.toHaveBeenCalled();
    expect(t.owner.locked("book")).toBe(true);
  });
  it("does not POST when initial scope validation fails or changes during validation", async () => {
    const t = await ready(setup());
    await expect(
      t.owner.submit(payload, async () => {
        t.leave();
      })
    ).rejects.toThrow("scope changed");
    expect(t.transport.submitRelayOperation).not.toHaveBeenCalled();
  });
  it("keeps timeout locks over reload, reconciles all statuses, and retries exact payload/key only on explicit request", async () => {
    const t = await ready(setup());
    t.transport.submitRelayOperation.mockRejectedValue(
      new RelayApiError(undefined, "NETWORK_UNKNOWN", "retry")
    );
    await expect(t.owner.submit(payload, async () => {})).rejects.toThrow();
    expect(() => assertNoStoredRelayLock(t.storage, "scope", ["book"])).toThrow(
      "pending"
    );
    t.owner.stop();
    const restored = await ready(setup(t.storage));
    expect(
      restored.transport.fetchRelayOperations.mock.calls[0][1].status
    ).toBeUndefined();
    expect(restored.transport.submitRelayOperation).not.toHaveBeenCalled();
    expect(restored.owner.locked("book")).toBe(true);
    await vi.advanceTimersByTimeAsync(1000);
    await restored.owner.retry("click-one");
    expect(restored.transport.submitRelayOperation.mock.calls[0][1]).toEqual(
      payload
    );
  });
  it("treats malformed acknowledgment as unknown and allows bounded exact retries", async () => {
    const t = await ready(setup());
    t.transport.submitRelayOperation.mockRejectedValue(
      new RelayApiError(undefined, "INVALID_RESPONSE", "give-up")
    );
    await expect(t.owner.submit(payload, async () => {})).rejects.toThrow();
    for (const delay of [1000, 2000, 4000]) {
      await vi.advanceTimersByTimeAsync(delay);
      await expect(t.owner.retry("click-one")).rejects.toThrow();
    }
    await expect(t.owner.retry("click-one")).rejects.toThrow(
      "cannot be retried"
    );
    expect(t.transport.submitRelayOperation).toHaveBeenCalledTimes(4);
    expect(t.owner.locked("book")).toBe(true);
  });
  it("honors Retry-After and never automatically re-signs", async () => {
    const t = await ready(setup());
    t.transport.submitRelayOperation.mockRejectedValue(
      new RelayApiError(429, "QUOTA_EXCEEDED", "retry", undefined, 60_000)
    );
    const validate = vi.fn();
    await expect(t.owner.submit(payload, validate)).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(4000);
    await expect(t.owner.retry("click-one")).rejects.toThrow(
      "cannot be retried"
    );
    expect(validate).toHaveBeenCalledTimes(1);
    expect(t.transport.submitRelayOperation).toHaveBeenCalledTimes(1);
  });
  it("releases conclusive first refusals but preserves locks when a retry gets a refusal after timeout", async () => {
    const t = await ready(setup());
    t.transport.submitRelayOperation.mockRejectedValue(
      new RelayApiError(402, "FEE_CREDIT_REQUIRED", "give-up")
    );
    await expect(t.owner.submit(payload, async () => {})).rejects.toThrow();
    expect(t.owner.locked("book")).toBe(false);
    expect(t.owner.records[0].payload).toBeUndefined();
    const u = await ready(setup());
    u.transport.submitRelayOperation
      .mockRejectedValueOnce(
        new RelayApiError(undefined, "NETWORK_UNKNOWN", "retry")
      )
      .mockRejectedValue(new RelayApiError(400, "PERMIT_EXPIRED", "re-sign"));
    await expect(u.owner.submit(payload, async () => {})).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(1000);
    await expect(u.owner.retry("click-one")).rejects.toThrow();
    expect(u.owner.locked("book")).toBe(true);
  });
  it("polls at 3 seconds, 30 only with authenticated notifier, resumes at 3 and stops terminal polling", async () => {
    const t = await ready(setup());
    await t.owner.submit(payload, async () => {});
    t.transport.fetchRelayOperation.mockClear();
    await vi.advanceTimersByTimeAsync(2999);
    expect(t.transport.fetchRelayOperation).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(t.transport.fetchRelayOperation).toHaveBeenCalledTimes(1);
    t.owner.setNotifier(true);
    t.transport.fetchRelayOperation.mockClear();
    await vi.advanceTimersByTimeAsync(29999);
    expect(t.transport.fetchRelayOperation).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(t.transport.fetchRelayOperation).toHaveBeenCalledTimes(1);
    t.owner.setNotifier(false);
    t.transport.fetchRelayOperation.mockClear();
    await vi.advanceTimersByTimeAsync(3000);
    expect(t.transport.fetchRelayOperation).toHaveBeenCalledTimes(1);
    t.transport.fetchRelayOperation.mockResolvedValue({
      operation: row({
        status: "confirmed",
        updatedAt: "2026-10-22T00:02:00Z",
      }),
    });
    await t.owner.refresh(id);
    t.transport.fetchRelayOperation.mockClear();
    await vi.advanceTimersByTimeAsync(6000);
    expect(t.transport.fetchRelayOperation).not.toHaveBeenCalled();
  });
  it("follows sparse cursor pages and reconciles once on authenticated reconnect", async () => {
    const t = setup();
    t.transport.fetchRelayOperations
      .mockResolvedValueOnce({ items: [], nextCursor: "next" })
      .mockResolvedValueOnce({ items: [row()], nextCursor: "last" })
      .mockResolvedValueOnce({
        items: [
          row({
            operationId: id2,
            contractAddress: "token",
            intentKind: "fee_top_up",
          }),
        ],
        nextCursor: null,
      });
    await ready(t);
    expect(t.owner.locked("book")).toBe(true);
    expect(t.owner.locked("token")).toBe(true);
    expect(t.transport.fetchRelayOperations).toHaveBeenCalledTimes(3);
    t.owner.setNotifier(true);
    await t.owner.reconcile();
    expect(t.transport.fetchRelayOperations).toHaveBeenCalledTimes(4);
    t.owner.setNotifier(true);
    expect(t.transport.fetchRelayOperations).toHaveBeenCalledTimes(4);
  });
  it("rejects repeated cursors instead of reporting complete recovery", async () => {
    const t = setup();
    t.transport.fetchRelayOperations.mockResolvedValue({
      items: [],
      nextCursor: "cycle",
    });
    await ready(t);
    expect(t.owner.isReconciled).toBe(false);
    expect(t.owner.error).toContain("cursor repeated");
  });
  it("merges frame-before-GET without losing intent and ignores duplicate, old, foreign and unknown frames", async () => {
    const t = await ready(setup());
    await t.owner.submit(payload, async () => {});
    const event = {
      operationId: id,
      status: "submitted",
      updatedAt: "2026-10-22T00:02:00Z",
      walletAddress: "wallet",
      opHash: "real-hash",
    };
    t.owner.event("unknown", "wallet", { ...event, operationId: id2 });
    expect(t.owner.row(id2)).toBeUndefined();
    t.owner.event("foreign", "other", event);
    expect(t.owner.row(id)?.status).toBe("pending");
    t.owner.event("one", "wallet", event);
    await t.owner.refresh(id);
    expect(t.owner.row(id)).toMatchObject({
      status: "submitted",
      intent,
      opHash: "real-hash",
    });
    t.owner.event("one", "wallet", { ...event, status: "failed" });
    t.owner.event("old", "wallet", {
      ...event,
      status: "pending",
      updatedAt: "2026-10-22T00:00:00Z",
    });
    expect(t.owner.row(id)?.status).toBe("submitted");
  });
  it("merges same-status terminal fee amendments, clears payload and notifies once over reload", async () => {
    const t = await ready(setup());
    await t.owner.submit(payload, async () => {});
    t.owner.event("terminal", "wallet", {
      operationId: id,
      status: "confirmed",
      feeChargedUnits: "5",
      updatedAt: "2026-10-22T00:02:00Z",
      walletAddress: "wallet",
    });
    t.owner.event("amendment", "wallet", {
      operationId: id,
      status: "confirmed",
      feeChargedUnits: null,
      updatedAt: "2026-10-22T00:03:00Z",
      walletAddress: "wallet",
    });
    expect(t.outcome).toHaveBeenCalledTimes(2);
    expect(t.notify).toHaveBeenCalledTimes(1);
    expect(readRelayRecords(t.storage, "scope")[0].payload).toBeUndefined();
    expect(t.owner.locked("book")).toBe(false);
    t.owner.stop();
    const restored = await ready(setup(t.storage));
    expect(restored.notify).not.toHaveBeenCalled();
    expect(restored.owner.row(id)?.feeChargedUnits).toBeNull();
  });
  it("adopts 409 only after matching full intent and tracks unrelated collision without claiming requested completion", async () => {
    const t = await ready(setup());
    t.transport.submitRelayOperation.mockRejectedValue(
      new RelayApiError(409, "PERMIT_IN_FLIGHT", "retry", { operationId: id })
    );
    expect(await t.owner.submit(payload, async () => {})).toBe(id);
    const u = await ready(setup());
    u.transport.submitRelayOperation.mockRejectedValue(
      new RelayApiError(409, "PERMIT_IN_FLIGHT", "retry", { operationId: id })
    );
    u.transport.fetchRelayOperation.mockResolvedValue({
      operation: row({ intent: { ...intent, orderId: "999" } }),
    });
    await expect(u.owner.submit(payload, async () => {})).rejects.toThrow();
    expect(
      u.owner.records.find((r) => r.id === "click-one")?.operationId
    ).toBeUndefined();
    expect(u.owner.locked("book")).toBe(true);
  });
  it("cross-tab restore blocks colliding submissions and direct execution, scoped storage never leaks", async () => {
    const t = await ready(setup());
    const second = await ready(setup(t.storage));
    await t.owner.submit(payload, async () => {});
    second.owner.restore();
    await expect(
      second.owner.submit(
        { ...payload, idempotencyKey: "click-two" },
        async () => {}
      )
    ).rejects.toThrow("recovery");
    expect(() =>
      assertNoStoredRelayLock(t.storage, "scope", ["book"])
    ).toThrow();
    expect(() =>
      assertNoStoredRelayLock(t.storage, "other-network-api-wallet", ["book"])
    ).not.toThrow();
    expect(
      (await ready(setup(t.storage, "other-network-api-wallet"))).owner.records
    ).toEqual([]);
  });
  it("ignores late GET after account/network/API change, even if original scope returns", async () => {
    const t = await ready(setup());
    await t.owner.submit(payload, async () => {});
    let resolve!: (value: { operation: RelayOperation }) => void;
    t.transport.fetchRelayOperation.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        })
    );
    const work = t.owner.refresh(id);
    t.leave();
    resolve({
      operation: row({
        status: "confirmed",
        updatedAt: "2026-10-22T00:04:00Z",
      }),
    });
    await work;
    expect(t.notify).not.toHaveBeenCalled();
    expect(t.owner.row(id)?.status).toBe("pending");
  });
  it("minimize persists and does not interrupt polling; ten minutes is still processing, not failure", async () => {
    const t = await ready(setup());
    await t.owner.submit(payload, async () => {});
    t.owner.present("click-one", true);
    await vi.advanceTimersByTimeAsync(600_000);
    expect(t.owner.records[0].minimized).toBe(true);
    expect(t.owner.row(id)?.status).toBe("pending");
    expect(isStillProcessing(t.owner.records[0].createdAt, Date.now())).toBe(
      true
    );
    expect(readRelayRecords(t.storage, "scope")[0].minimized).toBe(true);
    expect(t.transport.fetchRelayOperation.mock.calls.length).toBeGreaterThan(
      2
    );
  });
  it("corrupt storage fails closed even after successful empty reconciliation", async () => {
    const storage = memory();
    storage.setItem("relay-attempt:scope:bad", "{}");
    const t = await ready(setup(storage));
    expect(t.owner.locked("book")).toBe(true);
    await expect(t.owner.submit(payload, async () => {})).rejects.toThrow();
    expect(t.transport.submitRelayOperation).not.toHaveBeenCalled();
  });
  it("older and equal rows cannot reverse terminal state or overwrite fee amendments", () => {
    const confirmed = row({
      status: "confirmed",
      feeChargedUnits: "5",
      updatedAt: "2026-10-22T00:04:00Z",
    });
    expect(mergeRelayRow(confirmed, row()).status).toBe("confirmed");
    expect(
      mergeRelayRow(confirmed, { ...confirmed, feeChargedUnits: null })
        .feeChargedUnits
    ).toBe("5");
  });
  it("a terminal acceptance alone cannot settle or notify when its GET is unavailable", async () => {
    const t = await ready(setup());
    t.transport.submitRelayOperation.mockResolvedValue({
      operationId: id,
      gasStationOperationId: "",
      status: "confirmed",
    });
    t.transport.fetchRelayOperation.mockRejectedValue(
      new RelayApiError(undefined, "NETWORK_UNKNOWN", "retry")
    );
    await t.owner.submit(payload, async () => {});
    expect(t.owner.locked("book")).toBe(true);
    expect(t.notify).not.toHaveBeenCalled();
    expect(readRelayRecords(t.storage, "scope")[0].payload).toEqual(payload);
  });
  it("storage failure after server acceptance retains the pre-POST marker for reload", async () => {
    const t = await ready(setup());
    const setItem = t.storage.setItem;
    t.transport.submitRelayOperation.mockImplementation(async () => {
      t.storage.setItem = () => {
        throw new Error("quota");
      };
      return {
        operationId: id,
        gasStationOperationId: "station",
        status: "pending",
      };
    });
    await expect(t.owner.submit(payload, async () => {})).rejects.toThrow();
    t.storage.setItem = setItem;
    const stored = readRelayRecords(t.storage, "scope")[0];
    expect(stored.payload).toEqual(payload);
    expect(stored.operationId).toBeUndefined();
    const restored = await ready(setup(t.storage));
    expect(restored.owner.locked("book")).toBe(true);
    expect(restored.transport.submitRelayOperation).not.toHaveBeenCalled();
  });
  it("a conclusive 401 retains the exact payload for explicit retry after sign-in", async () => {
    const t = await ready(setup());
    t.transport.submitRelayOperation.mockRejectedValueOnce(
      new RelayApiError(401, "unauthorized", "give-up")
    );
    await expect(t.owner.submit(payload, async () => {})).rejects.toThrow();
    expect(readRelayRecords(t.storage, "scope")[0]).toMatchObject({
      payload,
      remedy: "sign-in",
      state: "unknown",
    });
    await t.owner.retry("click-one");
    expect(t.transport.submitRelayOperation.mock.calls[1][1]).toEqual(payload);
  });
  it("a mismatched authoritative row cannot complete the saved action", async () => {
    const t = await ready(setup());
    t.transport.fetchRelayOperation.mockResolvedValue({
      operation: row({
        status: "confirmed",
        intent: { ...intent, orderId: "2" },
      }),
    });
    await t.owner.submit(payload, async () => {});
    expect(t.owner.locked("book")).toBe(true);
    expect(t.notify).not.toHaveBeenCalled();
    expect(t.owner.error).toContain("does not match");
  });
  it("storage validation failure remains blocking when other valid open rows are recovered", async () => {
    const storage = memory();
    storage.setItem("relay-attempt:scope:bad", "{}");
    const t = setup(storage);
    t.transport.fetchRelayOperations.mockResolvedValue({
      items: [row()],
      nextCursor: null,
    });
    await ready(t);
    expect(t.owner.locked("unrelated-contract")).toBe(true);
  });
});
