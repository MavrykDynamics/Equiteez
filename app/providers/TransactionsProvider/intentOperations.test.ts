import { describe, expect, it } from "vitest";

import {
  fixtureCapability,
  fixtureOperationId,
  fixtureRecipient as account,
  instructions,
  memoryStorage,
  operation,
  record as fixtureRecord,
} from "~/lib/intents/intents.fixtures";
import { IntentOperations } from "./intentOperations";

const record = (localId = "local-1", target = account) =>
  fixtureRecord({ localId, account: target, createdAt: Date.now() });

describe("intent operation store", () => {
  it("persists synchronously under an account/environment-scoped v2 key", () => {
    const storage = memoryStorage();
    const store = new IntentOperations(
      account,
      "https://a.test",
      () => storage
    );
    store.upsert({ ...record(), env: "https://a.test" });
    expect(store.key).toBe(
      `equiteez:intents:v2:${encodeURIComponent("https://a.test")}:${account}`
    );
    const saved = JSON.parse(storage.data.get(store.key)!);
    expect(saved.version).toBe(2);
    // The capability is persisted with the request before any POST.
    expect(saved.records[0]).toMatchObject({
      capability: fixtureCapability,
      idempotencyKey: "idem-key-1",
      request: { amountIn: "2000000000000000000" },
    });
  });

  it("ignores draft-contract v1 data", () => {
    const storage = memoryStorage();
    const store = new IntentOperations(account, "mock", () => storage);
    storage.data.set(
      `equiteez:intents:v1:mock:${account}`,
      JSON.stringify({ version: 1, records: [{ kind: "intent" }] })
    );
    store.restore();
    expect(store.getSnapshot()).toMatchObject({ storageError: null });
    expect(store.getSnapshot().records.size).toBe(0);
  });

  it("restores only its own scope and never another account's records", () => {
    const storage = memoryStorage();
    const mine = new IntentOperations(account, "mock", () => storage);
    mine.upsert(record());
    const other = new IntentOperations("mv1other", "mock", () => storage);
    other.restore();
    expect(other.getSnapshot().records.size).toBe(0);
    expect(other.upsert(record("local-2"))).toBe(false); // wrong account
    const reloaded = new IntentOperations(account, "mock", () => storage);
    reloaded.restore();
    expect([...reloaded.getSnapshot().records.keys()]).toEqual(["local-1"]);
  });

  it("ignores stale local writes", () => {
    const store = new IntentOperations(account, "mock", () => memoryStorage());
    store.upsert({ ...record(), sequence: 2, fundingState: "broadcast" });
    expect(store.upsert({ ...record(), sequence: 1 })).toBe(false);
    expect(store.get("local-1")?.fundingState).toBe("broadcast");
  });

  it("merges backend snapshots by revision and keeps local funding state", () => {
    const store = new IntentOperations(account, "mock", () => memoryStorage());
    store.upsert({ ...record(), fundingState: "broadcast", sequence: 1 });
    store.applyBackend(
      "local-1",
      operation({ revision: 4, phase: "SWAP_IN_PROGRESS" })
    );
    expect(store.applyBackend("local-1", operation({ revision: 3 }))).toBe(
      false
    );
    expect(
      store.applyBackend(
        "local-1",
        operation({ id: "00000000-0000-4000-8000-000000000000", revision: 9 })
      )
    ).toBe(false);
    const current = store.get("local-1")!;
    expect(current).toMatchObject({
      operationId: fixtureOperationId,
      fundingState: "broadcast",
    });
    expect(current.backend?.phase).toBe("SWAP_IN_PROGRESS");
    // A later local write with an older backend copy cannot regress it.
    store.upsert({
      ...current,
      backend: operation({ revision: 2 }),
      sequence: current.sequence + 1,
    });
    expect(store.get("local-1")?.backend?.phase).toBe("SWAP_IN_PROGRESS");
  });

  it("keeps the last published instructions after the API hides them", () => {
    const store = new IntentOperations(account, "mock", () => memoryStorage());
    store.upsert(record());
    store.applyBackend("local-1", operation());
    store.applyBackend(
      "local-1",
      operation({
        revision: 3,
        fundingStatus: "OBSERVED",
        fundingInstructions: null,
      })
    );
    expect(store.get("local-1")?.lastInstructions).toEqual(instructions());
    expect(store.get("local-1")?.backend?.fundingInstructions).toBeNull();
  });

  it("clears the 404 counter on a successful read", () => {
    const store = new IntentOperations(account, "mock", () => memoryStorage());
    store.upsert(record());
    store.applyBackend("local-1", operation());
    store.patch("local-1", { notFoundCount: 2 });
    expect(store.applyBackend("local-1", operation())).toBe(true);
    expect(store.get("local-1")?.notFoundCount).toBeUndefined();
  });

  it("preserves unreadable recovery data instead of overwriting it", () => {
    const storage = memoryStorage();
    const store = new IntentOperations(account, "mock", () => storage);
    storage.data.set(store.key, "{broken");
    store.restore();
    expect(store.getSnapshot().storageError).toMatch(/could not be read/);
    store.upsert(record());
    expect(storage.data.get(store.key)).toBe("{broken");
    expect(store.get("local-1")).toBeDefined();
  });

  it("keeps records another tab saved", () => {
    const storage = memoryStorage();
    const first = new IntentOperations(account, "mock", () => storage);
    const second = new IntentOperations(account, "mock", () => storage);
    first.restore();
    second.upsert(record("local-2"));
    first.upsert(record("local-1"));
    expect(
      JSON.parse(storage.data.get(first.key)!).records.map(
        (item: { localId: string }) => item.localId
      )
    ).toEqual(["local-1", "local-2"]);
  });

  it("drops settled records after the retention period", () => {
    let now = Date.parse("2026-11-01T00:00:00.000Z");
    const storage = memoryStorage();
    const store = new IntentOperations(
      account,
      "mock",
      () => storage,
      () => now
    );
    store.upsert({
      ...record("old"),
      createdAt: now,
      fundingState: "abandoned",
    });
    store.upsert({
      ...record("open"),
      createdAt: now,
      fundingState: "unknown",
    });
    now += 15 * 24 * 60 * 60 * 1000;
    store.upsert(record("new"));
    expect([...store.getSnapshot().records.keys()].sort()).toEqual([
      "new",
      "open",
    ]);
  });

  it("reports save failures", () => {
    const store = new IntentOperations(account, "mock", () => ({
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    }));
    store.upsert(record());
    expect(store.getSnapshot().storageError).toMatch(/could not be saved/);
  });
});
