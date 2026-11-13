import { describe, expect, it } from "vitest";

import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import { memoryStorage, operation } from "~/lib/intents/intents.fixtures";
import { createIntentRecord } from "~/lib/intents/intentOperation";
import { IntentOperations } from "./intentOperations";

const account = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
const source = "0x1111111111111111111111111111111111111111";

const record = (localId = "local-1", target = account) =>
  createIntentRecord({
    localId,
    account: target,
    env: "mock",
    route: mockIntentRoutes[0],
    amountIn: "2000000000000000000",
    sourceAddress: source,
    now: Date.now(),
  });

describe("intent operation store", () => {
  it("persists synchronously under an account/environment-scoped key", () => {
    const storage = memoryStorage();
    const store = new IntentOperations(
      account,
      "https://a.test",
      () => storage
    );
    store.upsert({ ...record(), env: "https://a.test" });
    expect(store.key).toBe(
      `equiteez:intents:v1:${encodeURIComponent("https://a.test")}:${account}`
    );
    expect(JSON.parse(storage.data.get(store.key)!).records).toHaveLength(1);
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

  it("merges backend snapshots monotonically and keeps local funding state", () => {
    const store = new IntentOperations(account, "mock", () => memoryStorage());
    store.upsert({ ...record(), fundingState: "broadcast", sequence: 1 });
    const hash = `0x${"a".repeat(64)}` as const;
    store.applyBackend(
      "local-1",
      operation({
        version: 2,
        updatedAt: "2026-11-13T10:02:00.000Z",
        status: "swapping",
        sourceTxHash: hash,
      })
    );
    expect(
      store.applyBackend(
        "local-1",
        operation({
          version: 1,
          updatedAt: "2026-11-13T10:03:00.000Z",
          status: "deposit_detected",
        })
      )
    ).toBe(false);
    expect(
      store.applyBackend("local-1", operation({ id: "op-2", version: 9 }))
    ).toBe(false);
    const current = store.get("local-1")!;
    expect(current).toMatchObject({
      operationId: "op-1",
      fundingState: "broadcast",
      sourceHashes: [hash],
    });
    expect(current.backend?.status).toBe("swapping");
    // A later local write with an older backend copy cannot regress it.
    store.upsert({
      ...current,
      backend: operation(),
      sequence: current.sequence + 1,
    });
    expect(store.get("local-1")?.backend?.status).toBe("swapping");
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
