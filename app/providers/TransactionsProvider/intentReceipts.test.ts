import { describe, expect, it } from "vitest";

import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import {
  createIntentRecord,
  type IntentRecord,
} from "~/lib/intents/intentOperation";
import { memoryStorage, operation } from "~/lib/intents/intents.fixtures";
import { BridgeTransactions, bridgeNetwork } from "./bridgeTransactions";
import { deposit, signerEventSequence } from "./bridgeTransactions.fixtures";
import {
  findCorrelatedIntentReceipts,
  getIntentForwardId,
  isIntentOwnedBridgeRecord,
  getIntentForwardIds,
} from "./intentReceipts";

const forward = `0x${"f".repeat(64)}` as const;
const funding = `0x${"a".repeat(64)}` as const;

function intent(
  overrides: Partial<IntentRecord["backend"]> = {}
): IntentRecord {
  return {
    ...createIntentRecord({
      localId: "local-1",
      account: "wallet-a",
      env: "mock",
      route: mockIntentRoutes[0],
      amountIn: "1",
      sourceAddress: "0x1111111111111111111111111111111111111111",
    }),
    operationId: "op-1",
    fundingState: "confirmed",
    sourceHashes: [funding],
    backend: operation({
      recipient: "wallet-a",
      status: "wrapped",
      sourceTxHash: funding,
      forwardTxHash: forward,
      forwardLogIndex: 4,
      ...overrides,
    }),
  };
}
const bridge = () =>
  new BridgeTransactions("wallet-a", bridgeNetwork, () => memoryStorage());
const signer = (index: number, hash = forward, logIndex = 4) => ({
  ...signerEventSequence[index],
  initial_tx_hash: hash,
  initial_log_index: logIndex,
});
const records = (store: BridgeTransactions) =>
  store.getSnapshot().transactions.values();

describe("forward identity", () => {
  it("exists only once the backend reports WRAPPED with hash and log index", () => {
    expect(getIntentForwardId(intent())).toBe(`${forward}:4`);
    expect(
      getIntentForwardId(intent({ status: "forwarding" }))
    ).toBeUndefined();
    expect(
      getIntentForwardId(intent({ forwardLogIndex: undefined }))
    ).toBeUndefined();
  });
});

describe("receipt correlation", () => {
  it("matches an executed wallet-API row for the forward hash and log index", () => {
    const store = bridge();
    store.reconcile([
      deposit({ evm_tx_hash: forward, log_index: 4, status: "executed" }),
    ]);
    expect(findCorrelatedIntentReceipts([intent()], records(store))).toEqual([
      "local-1",
    ]);
  });

  it("matches two distinct completed signers, but not one", () => {
    const store = bridge();
    for (const index of [0, 1, 2, 3, 4]) store.observeEvent(signer(index));
    expect(findCorrelatedIntentReceipts([intent()], records(store))).toEqual(
      []
    );
    store.observeEvent(signer(5));
    expect(findCorrelatedIntentReceipts([intent()], records(store))).toEqual([
      "local-1",
    ]);
  });

  it.each([
    ["another deposit", signer(5, `0x${"e".repeat(64)}`)],
    ["the same hash with another log", signer(5, forward, 5)],
    ["the 1Click funding hash", signer(5, funding)],
  ])("ignores %s", (_name, completion) => {
    const store = bridge();
    store.observeEvent({ ...signer(4), ...completion, signatory: "signer-b" });
    store.observeEvent(completion);
    expect(findCorrelatedIntentReceipts([intent()], records(store))).toEqual(
      []
    );
  });

  it("ignores operations that are not WRAPPED or already correlated", () => {
    const store = bridge();
    store.reconcile([
      deposit({ evm_tx_hash: forward, log_index: 4, status: "executed" }),
    ]);
    expect(
      findCorrelatedIntentReceipts(
        [
          intent({ status: "forwarding" }),
          { ...intent(), receipt: "correlated" },
        ],
        records(store)
      )
    ).toEqual([]);
  });

  it("marks only the forwarded bridge record as owned by the operation", () => {
    const store = bridge();
    store.observeEvent(signer(0));
    store.observeEvent(signer(0, `0x${"e".repeat(64)}`));
    const ids = getIntentForwardIds([intent()]);
    const owned = [...records(store)].map((record) =>
      isIntentOwnedBridgeRecord(record, ids)
    );
    expect(owned.sort()).toEqual([false, true]);
  });
});
