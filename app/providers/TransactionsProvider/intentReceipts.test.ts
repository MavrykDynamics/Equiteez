import { describe, expect, it } from "vitest";

import type { IntentOperation } from "~/lib/apis/intents";
import type { IntentRecord } from "~/lib/intents/intentOperation";
import {
  fixtureOperationId,
  fixtureWrapHash as forward,
  memoryStorage,
  operation,
  record,
  wrappedOperation,
} from "~/lib/intents/intents.fixtures";
import { BridgeTransactions, bridgeNetwork } from "./bridgeTransactions";
import { deposit, signerEventSequence } from "./bridgeTransactions.fixtures";
import {
  findCorrelatedIntentReceipts,
  getIntentForwardIdMap,
  getIntentForwardIds,
  isIntentOwnedBridgeRecord,
} from "./intentReceipts";

const funding = `0x${"a".repeat(64)}` as const;
const delivery = `0x${"d".repeat(64)}` as const;

function intent(
  backend: IntentOperation = wrappedOperation("PENDING")
): IntentRecord {
  return record({
    operationId: fixtureOperationId,
    fundingState: "confirmed",
    sourceHashes: [funding],
    backend,
  });
}
const bridge = () =>
  new BridgeTransactions("wallet-a", bridgeNetwork, () => memoryStorage());
const signer = (index: number, hash: string = forward, logIndex = 3) => ({
  ...signerEventSequence[index],
  initial_tx_hash: hash,
  initial_log_index: logIndex,
});
const records = (store: BridgeTransactions) =>
  store.getSnapshot().transactions.values();

describe("forward identities", () => {
  it("come only from ERC20WrapAsked events and mint wrap identities", () => {
    expect([...getIntentForwardIds(intent())]).toEqual([`${forward}:3`]);
    expect([...getIntentForwardIds(intent(operation()))]).toEqual([]);
    // The funding and delivery hashes are never identities.
    const ids = getIntentForwardIds(intent());
    expect([...ids].some((id) => id.startsWith(funding))).toBe(false);
    expect([...ids].some((id) => id.startsWith(delivery))).toBe(false);
  });
});

describe("receipt correlation (fallback without backend settlement)", () => {
  it("matches an executed wallet-API row for the wrap hash and log index", () => {
    const store = bridge();
    store.reconcile([
      deposit({ evm_tx_hash: forward, log_index: 3, status: "executed" }),
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

  it("requires every wrap allocation to be verified", () => {
    const base = wrappedOperation("PENDING");
    const second = `0x${"9".repeat(64)}` as const;
    const split = {
      ...base,
      forwarding: {
        ...base.forwarding,
        bridgeEvents: [
          ...base.forwarding.bridgeEvents,
          { transactionHash: second, logIndex: 0, amount: "1" },
        ],
      },
    };
    const store = bridge();
    store.reconcile([
      deposit({ evm_tx_hash: forward, log_index: 3, status: "executed" }),
    ]);
    expect(
      findCorrelatedIntentReceipts([intent(split)], records(store))
    ).toEqual([]);
    store.reconcile([
      deposit({ evm_tx_hash: forward, log_index: 3, status: "executed" }),
      deposit({ evm_tx_hash: second, log_index: 0, status: "executed" }),
    ]);
    expect(
      findCorrelatedIntentReceipts([intent(split)], records(store))
    ).toEqual(["local-1"]);
  });

  it.each([
    ["another deposit", signer(5, `0x${"e".repeat(64)}`)],
    ["the same hash with another log", signer(5, forward, 5)],
    ["the 1Click funding hash", signer(5, funding)],
    ["the 1Click delivery hash", signer(5, delivery)],
  ])("ignores %s", (_name, completion) => {
    const store = bridge();
    store.observeEvent({ ...signer(4), ...completion, signatory: "signer-b" });
    store.observeEvent(completion);
    expect(findCorrelatedIntentReceipts([intent()], records(store))).toEqual(
      []
    );
  });

  it("ignores operations not WRAPPED, already settled or under reconciliation", () => {
    const store = bridge();
    store.reconcile([
      deposit({ evm_tx_hash: forward, log_index: 3, status: "executed" }),
    ]);
    const forwarding = wrappedOperation("PENDING", { phase: "FORWARDING" });
    expect(
      findCorrelatedIntentReceipts(
        [
          intent(forwarding),
          intent(wrappedOperation("CONFIRMED")),
          intent(wrappedOperation("RECONCILE_REQUIRED")),
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
    const ids = getIntentForwardIdMap([intent()]);
    const owned = [...records(store)].map((item) =>
      isIntentOwnedBridgeRecord(item, ids)
    );
    expect(owned.sort()).toEqual([false, true]);
  });
});
