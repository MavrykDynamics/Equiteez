import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  INTENTS_LATE_DEPOSIT_POLL_MS,
  INTENTS_POLL_INTERVALS,
  INTENTS_UNTRACKED_SETTLEMENT_POLL_MS,
} from "~/consts/intents";
import {
  IntentsApiError,
  type IntentOperation,
  type IntentsApi,
} from "~/lib/apis/intents";
import type { IntentFundingState } from "~/lib/intents/intentOperation";
import {
  fixtureCapability,
  fixtureRecipient,
  memoryStorage,
  operation,
  record,
  wrappedOperation,
} from "~/lib/intents/intents.fixtures";
import { IntentOperations } from "./intentOperations";
import {
  IntentOperationsTracker,
  isIntentTrackable,
} from "./intentOperationsTracker";

let store: IntentOperations;
let getOperation: ReturnType<typeof vi.fn>;
let current = true;
const idFor = (localId: string) =>
  `00000000-0000-4000-8000-${localId
    .padStart(12, "0")
    .slice(-12)
    .replace(/[^0-9a-f]/g, "a")}`;

function seed(
  localId: string,
  fundingState: IntentFundingState,
  backend?: Partial<IntentOperation> | IntentOperation
) {
  const id = idFor(localId);
  store.upsert({
    ...record({ localId }),
    operationId: id,
    fundingState,
    sourceHashes: [`0x${"a".repeat(64)}`],
  });
  if (backend) store.applyBackend(localId, operation({ ...backend, id }));
}
const reply = (localId: string, patch: Partial<IntentOperation> = {}) =>
  operation({ ...patch, id: idFor(localId) });

const tracker = () =>
  new IntentOperationsTracker(
    store,
    { env: "mock", getOperation } as unknown as IntentsApi,
    () => current,
    Date.now,
    (ms) => ms // no jitter
  );

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.parse("2026-11-13T10:00:02Z"));
  current = true;
  store = new IntentOperations(fixtureRecipient, "mock", () => memoryStorage());
  getOperation = vi.fn();
});
afterEach(() => vi.useRealTimers());

describe("isIntentTrackable", () => {
  it("polls committed and quote-pending operations, not dropped or closed ones", () => {
    seed("funded", "broadcast");
    seed("pending", "not_started", { phase: "PREPARING_QUOTE" });
    seed("dropped", "abandoned", {
      phase: "PREPARING_QUOTE",
      fundingStatus: "NOT_READY",
      fundingInstructions: null,
    });
    seed("dropped2", "abandoned", { fundingStatus: "OBSERVED" });
    seed("done", "confirmed", wrappedOperation("CONFIRMED"));
    seed("rejected", "not_started", { closure: "QUOTE_REJECTED" });
    const ids = [...store.getSnapshot().records.values()]
      .filter((item) => isIntentTrackable(item))
      .map((item) => item.localId)
      .sort();
    expect(ids).toEqual(["dropped2", "funded", "pending"]);
  });

  it("stops polling an untracked settlement after its window", () => {
    seed("a", "confirmed", wrappedOperation("NOT_TRACKED"));
    const item = store.get("a")!;
    const updated = Date.parse(item.backend!.updatedAt);
    expect(isIntentTrackable(item, updated + 1_000)).toBe(true);
    expect(
      isIntentTrackable(
        item,
        updated + INTENTS_UNTRACKED_SETTLEMENT_POLL_MS + 1
      )
    ).toBe(false);
  });

  it("keeps watching a shown deposit address for a late payment", () => {
    // The user may pay the address from an exchange after leaving.
    seed("left", "abandoned", {});
    seed("external", "external", {
      fundingStatus: "EXPIRED",
      fundingInstructions: null,
    });
    const expiresAt = Date.parse(
      store.get("left")!.lastInstructions!.fundingExpiresAt
    );
    store.upsert({
      ...store.get("external")!,
      lastInstructions: store.get("left")!.lastInstructions,
      sequence: store.get("external")!.sequence + 1,
    });
    for (const id of ["left", "external"]) {
      expect(isIntentTrackable(store.get(id)!, expiresAt - 1_000)).toBe(true);
      expect(
        isIntentTrackable(
          store.get(id)!,
          expiresAt + INTENTS_LATE_DEPOSIT_POLL_MS + 1
        )
      ).toBe(false);
    }
  });

  it("does not poll operations whose capability was lost", () => {
    seed("a", "confirmed");
    store.patch("a", { access: "lost" });
    expect(isIntentTrackable(store.get("a")!)).toBe(false);
  });
});

describe("intent tracker", () => {
  it("reads with the record's capability and follows retryAfterMs until settled", async () => {
    seed("a", "confirmed");
    const replies = [
      reply("a", { retryAfterMs: 2_000 }),
      reply("a", { phase: "SWAP_IN_PROGRESS", revision: 3, retryAfterMs: 0 }),
      wrappedOperation("CONFIRMED", { id: idFor("a") }),
    ];
    getOperation.mockImplementation(async () => replies.shift());
    const instance = tracker();
    instance.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(getOperation).toHaveBeenCalledTimes(1);
    expect(getOperation.mock.calls[0].slice(0, 2)).toEqual([
      fixtureCapability,
      idFor("a"),
    ]);
    await vi.advanceTimersByTimeAsync(1_999);
    expect(getOperation).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(getOperation).toHaveBeenCalledTimes(2);
    // retryAfterMs 0 → default interval.
    await vi.advanceTimersByTimeAsync(INTENTS_POLL_INTERVALS.defaultMs);
    expect(getOperation).toHaveBeenCalledTimes(3);
    expect(store.get("a")?.backend?.settlement.status).toBe("CONFIRMED");
    await vi.advanceTimersByTimeAsync(INTENTS_POLL_INTERVALS.maxMs * 4);
    expect(getOperation).toHaveBeenCalledTimes(3);
    instance.stop();
  });

  it("clamps the backend's interval", async () => {
    seed("a", "confirmed");
    getOperation.mockResolvedValue(reply("a", { retryAfterMs: 10 }));
    const instance = tracker();
    instance.start();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(INTENTS_POLL_INTERVALS.minMs - 1);
    expect(getOperation).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(getOperation).toHaveBeenCalledTimes(2);
    instance.stop();
  });

  it("backs off on errors and honours Retry-After", async () => {
    seed("a", "confirmed");
    getOperation
      .mockRejectedValueOnce(new IntentsApiError("NETWORK", ""))
      .mockRejectedValueOnce(new IntentsApiError("NETWORK", ""))
      .mockRejectedValueOnce(
        new IntentsApiError("RATE_LIMITED", "", 429, "r", 40_000)
      )
      .mockResolvedValue(reply("a"));
    const instance = tracker();
    instance.start();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(INTENTS_POLL_INTERVALS.errorInitialMs);
    expect(getOperation).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(
      INTENTS_POLL_INTERVALS.errorInitialMs * 2
    );
    expect(getOperation).toHaveBeenCalledTimes(3);
    await vi.advanceTimersByTimeAsync(39_999);
    expect(getOperation).toHaveBeenCalledTimes(3);
    await vi.advanceTimersByTimeAsync(1);
    expect(getOperation).toHaveBeenCalledTimes(4);
    instance.stop();
  });

  it("marks access lost after repeated 404s and stops", async () => {
    seed("a", "confirmed");
    getOperation.mockRejectedValue(new IntentsApiError("NOT_FOUND", "", 404));
    const instance = tracker();
    instance.start();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(5_000);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(getOperation).toHaveBeenCalledTimes(3);
    expect(store.get("a")).toMatchObject({ access: "lost", notFoundCount: 3 });
    expect(store.get("a")?.fundingState).toBe("confirmed");
    await vi.advanceTimersByTimeAsync(INTENTS_POLL_INTERVALS.maxMs * 4);
    expect(getOperation).toHaveBeenCalledTimes(3);
    instance.stop();
  });

  it("keeps one request in flight per operation", async () => {
    seed("a", "confirmed");
    getOperation.mockImplementation(() => new Promise(() => {}));
    const instance = tracker();
    instance.start();
    instance.refresh();
    instance.refresh("a");
    await vi.advanceTimersByTimeAsync(60_000);
    expect(getOperation).toHaveBeenCalledOnce();
    instance.stop();
  });

  it("drops responses after the session ended and aborts on stop()", async () => {
    seed("a", "confirmed");
    let resolve!: (value: IntentOperation) => void;
    getOperation.mockImplementation(
      () => new Promise<IntentOperation>((res) => (resolve = res))
    );
    const instance = tracker();
    instance.start();
    await vi.advanceTimersByTimeAsync(0);
    current = false;
    resolve(reply("a", { phase: "FORWARDING", revision: 6 }));
    await vi.advanceTimersByTimeAsync(0);
    expect(store.get("a")?.backend).toBeUndefined();
    instance.stop();
    expect(getOperation.mock.calls[0][2].signal.aborted).toBe(true);
  });
});
