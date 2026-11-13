import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { INTENTS_POLL_INTERVALS } from "~/consts/intents";
import {
  IntentsApiError,
  type IntentOperation,
  type IntentsApi,
} from "~/lib/apis/intents";
import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import {
  createIntentRecord,
  type IntentFundingState,
} from "~/lib/intents/intentOperation";
import {
  fixtureRecipient,
  fixtureSource,
  memoryStorage,
  operation,
} from "~/lib/intents/intents.fixtures";
import { IntentOperations } from "./intentOperations";
import {
  IntentOperationsTracker,
  isIntentTrackable,
} from "./intentOperationsTracker";

let store: IntentOperations;
let getOperation: ReturnType<typeof vi.fn>;
let sendHint: ReturnType<typeof vi.fn>;
let current = true;

function seed(
  localId: string,
  fundingState: IntentFundingState,
  hintState = "sent"
) {
  const record = createIntentRecord({
    localId,
    account: fixtureRecipient,
    env: "mock",
    route: mockIntentRoutes[0],
    amountIn: "1",
    sourceAddress: fixtureSource,
  });
  store.upsert({
    ...record,
    operationId: `op-${localId}`,
    fundingState,
    sourceHashes: [`0x${"a".repeat(64)}`],
    hintState: hintState as never,
  });
}
const snapshot = (
  localId: string,
  version: number,
  status: IntentOperation["status"]
) =>
  operation({
    id: `op-${localId}`,
    version,
    status,
    updatedAt: new Date(
      Date.parse("2026-11-13T10:00:00.000Z") + version * 1000
    ).toISOString(),
  });

const tracker = () =>
  new IntentOperationsTracker(
    store,
    { env: "mock", getOperation } as unknown as IntentsApi,
    () => current,
    Date.now,
    sendHint as never
  );

beforeEach(() => {
  vi.useFakeTimers();
  current = true;
  store = new IntentOperations(fixtureRecipient, "mock", () => memoryStorage());
  getOperation = vi.fn();
  sendHint = vi.fn(async () => undefined);
});
afterEach(() => vi.useRealTimers());

describe("intent tracker", () => {
  it("polls only operations the user committed to", () => {
    seed("funded", "broadcast");
    seed("declined", "rejected");
    seed("idle", "not_started");
    seed("dropped", "abandoned");
    const ids = [...store.getSnapshot().records.values()]
      .filter(isIntentTrackable)
      .map((record) => record.localId);
    expect(ids).toEqual(["funded"]);
  });

  it("backs off while nothing changes, resets on progress, and stops at a terminal status", async () => {
    seed("a", "confirmed");
    const replies = [
      snapshot("a", 0, "awaiting_deposit"),
      snapshot("a", 0, "awaiting_deposit"),
      snapshot("a", 1, "deposit_detected"),
      snapshot("a", 5, "wrapped"),
    ];
    getOperation.mockImplementation(async () => replies.shift());
    const instance = tracker();
    instance.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(getOperation).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(INTENTS_POLL_INTERVALS.initialMs);
    expect(getOperation).toHaveBeenCalledTimes(2);
    // Same version → doubled delay.
    await vi.advanceTimersByTimeAsync(INTENTS_POLL_INTERVALS.initialMs);
    expect(getOperation).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(INTENTS_POLL_INTERVALS.initialMs);
    expect(getOperation).toHaveBeenCalledTimes(3);
    expect(store.get("a")?.backend?.status).toBe("deposit_detected");
    await vi.advanceTimersByTimeAsync(INTENTS_POLL_INTERVALS.initialMs);
    expect(store.get("a")?.backend?.status).toBe("wrapped");
    await vi.advanceTimersByTimeAsync(INTENTS_POLL_INTERVALS.maxMs * 4);
    expect(getOperation).toHaveBeenCalledTimes(4);
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

  it("drops responses after the session ended and stops on stop()", async () => {
    seed("a", "confirmed");
    let resolve!: (value: IntentOperation) => void;
    getOperation.mockImplementation(
      () => new Promise<IntentOperation>((res) => (resolve = res))
    );
    const instance = tracker();
    instance.start();
    await vi.advanceTimersByTimeAsync(0);
    current = false;
    resolve(snapshot("a", 3, "delivered"));
    await vi.advanceTimersByTimeAsync(0);
    expect(store.get("a")?.backend).toBeUndefined();
    instance.stop();
    expect(getOperation.mock.calls[0][1].signal.aborted).toBe(true);
  });

  it("retries failed deposit hints without touching funding", async () => {
    seed("a", "unknown", "failed");
    getOperation.mockResolvedValue(snapshot("a", 0, "awaiting_deposit"));
    const instance = tracker();
    instance.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(sendHint).toHaveBeenCalledWith(expect.anything(), store, "a");
    expect(store.get("a")?.fundingState).toBe("unknown");
    instance.stop();
  });

  it("slows down for unknown operations instead of giving up", async () => {
    seed("a", "confirmed");
    getOperation.mockRejectedValue(new IntentsApiError("not_found", ""));
    const instance = tracker();
    instance.start();
    await vi.advanceTimersByTimeAsync(INTENTS_POLL_INTERVALS.maxMs * 2);
    expect(getOperation).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(INTENTS_POLL_INTERVALS.maxMs * 3);
    expect(getOperation).toHaveBeenCalledTimes(2);
    instance.stop();
  });
});
