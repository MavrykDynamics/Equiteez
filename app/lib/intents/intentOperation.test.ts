import { describe, expect, it } from "vitest";

import {
  fixtureOperationId,
  fixtureSolanaRefund,
  instructions,
  operation,
  record,
  wrappedOperation,
} from "./intents.fixtures";
import {
  getInstructionsMismatch,
  getIntentSettlementReceipt,
  getOperationMismatch,
  hasIntentArrived,
  hasIntentFundsObserved,
  intentRecordSchema,
  isIntentClosed,
  mergeIntentSnapshot,
} from "./intentOperation";

describe("mergeIntentSnapshot", () => {
  it("ignores older revisions and accepts same-revision evidence", () => {
    const current = operation({ revision: 3 });
    expect(mergeIntentSnapshot(current, operation({ revision: 2 }))).toBe(
      current
    );
    const evidence = operation({
      revision: 3,
      settlement: { ...current.settlement, status: "PENDING" },
    });
    expect(mergeIntentSnapshot(current, evidence)).toEqual(evidence);
  });

  it("returns the previous object when nothing changed", () => {
    const current = operation();
    expect(mergeIntentSnapshot(current, operation())).toBe(current);
  });

  it("never moves the phase back within a revision", () => {
    const current = operation({ phase: "FORWARDING", revision: 5 });
    expect(
      mergeIntentSnapshot(
        current,
        operation({ phase: "SWAP_IN_PROGRESS", revision: 5 })
      )
    ).toBe(current);
  });

  it("never undoes a confirmed settlement", () => {
    const confirmed = wrappedOperation("CONFIRMED");
    const merged = mergeIntentSnapshot(
      confirmed,
      wrappedOperation("PENDING", { revision: 9 })
    );
    expect(merged.revision).toBe(9);
    expect(merged.settlement.status).toBe("CONFIRMED");
  });

  it("ignores other operations", () => {
    const current = operation();
    expect(
      mergeIntentSnapshot(
        current,
        operation({ id: "00000000-0000-4000-8000-000000000000" })
      )
    ).toBe(current);
  });
});

describe("lifecycle rules", () => {
  it("treats only provider/chain activity as observed funds", () => {
    expect(hasIntentFundsObserved(operation())).toBe(false);
    expect(
      hasIntentFundsObserved(operation({ fundingStatus: "OBSERVED" }))
    ).toBe(true);
    expect(
      hasIntentFundsObserved(operation({ providerStatus: "KNOWN_DEPOSIT_TX" }))
    ).toBe(true);
    expect(
      hasIntentFundsObserved(operation({ phase: "SWAP_IN_PROGRESS" }))
    ).toBe(true);
  });

  it("confirms receipt only for the expected destination token", () => {
    expect(
      getIntentSettlementReceipt(
        record({ backend: wrappedOperation("CONFIRMED") })
      )
    ).toBe("confirmed");
    const wrong = wrappedOperation("CONFIRMED");
    wrong.settlement = { ...wrong.settlement, tokenAddress: "KT1Other" };
    expect(getIntentSettlementReceipt(record({ backend: wrong }))).toBe(
      "mismatch"
    );
    const empty = wrappedOperation("CONFIRMED");
    empty.settlement = { ...empty.settlement, mints: [] };
    expect(getIntentSettlementReceipt(record({ backend: empty }))).toBe(
      "mismatch"
    );
    // WRAPPED and 1Click SUCCESS are not receipt.
    expect(
      hasIntentArrived(record({ backend: wrappedOperation("PENDING") }))
    ).toBe(false);
  });

  it.each([
    ["confirmed settlement", { backend: wrappedOperation("CONFIRMED") }, true],
    [
      "quote rejection",
      {
        backend: operation({
          closure: "QUOTE_REJECTED",
          fundingInstructions: null,
        }),
      },
      true,
    ],
    [
      "reported refund",
      {
        backend: operation({
          refund: {
            status: "REPORTED",
            amount: "1",
            asset: "a",
            recipient: "0x1111111111111111111111111111111111111111",
          },
        }),
      },
      true,
    ],
    ["lost access", { access: "lost" as const }, true],
    [
      "unfunded expiry",
      {
        backend: operation({
          fundingStatus: "EXPIRED",
          fundingInstructions: null,
        }),
      },
      true,
    ],
    [
      "expiry after the wallet sent funds",
      {
        fundingState: "broadcast" as const,
        backend: operation({
          fundingStatus: "EXPIRED",
          fundingInstructions: null,
        }),
      },
      false,
    ],
    [
      "wrapped, settlement pending",
      { backend: wrappedOperation("PENDING") },
      false,
    ],
  ])("closed after %s: %s", (_, patch, closed) => {
    expect(isIntentClosed(record(patch))).toBe(closed);
  });
});

describe("mismatch checks", () => {
  const saved = record({ operationId: fixtureOperationId });

  it("requires the backend to echo the exact request", () => {
    expect(getOperationMismatch(saved, operation())).toBeNull();
    // An EVM refund address is returned lower-cased by the backend.
    expect(
      getOperationMismatch(
        record({
          request: {
            ...saved.request,
            refundAddress: "0x52908400098527886E0F7030069857D2E4169EE7",
          },
        }),
        operation({
          refundAddress: "0x52908400098527886e0f7030069857d2e4169ee7",
        })
      )
    ).toBeNull();
    // Other networks' addresses are compared exactly.
    const solana = record({
      source: { ...saved.source, network: "sol", family: "solana" },
      request: { ...saved.request, refundAddress: fixtureSolanaRefund },
    });
    expect(
      getOperationMismatch(
        solana,
        operation({ refundAddress: fixtureSolanaRefund.toLowerCase() })
      )
    ).toBe("refund");
    expect(
      getOperationMismatch(saved, operation({ sourceAssetId: "nep141:x" }))
    ).toBe("asset");
    expect(
      getOperationMismatch(saved, operation({ settlementTokenVersion: 2 }))
    ).toBe("settlement token");
    expect(
      getOperationMismatch(
        saved,
        operation({
          refundAddress: "0x9999999999999999999999999999999999999999",
        })
      )
    ).toBe("refund");
    expect(getOperationMismatch(saved, operation({ recipient: "mv1x" }))).toBe(
      "recipient"
    );
    expect(getOperationMismatch(saved, operation({ slippageBps: 10 }))).toBe(
      "slippage"
    );
    expect(
      getOperationMismatch(saved, operation({ acceptedMinAmountOut: "1" }))
    ).toBe("minimum output");
  });

  it("checks published instructions against the route and accepted minimum", () => {
    expect(getInstructionsMismatch(saved, instructions())).toBeNull();
    expect(
      getInstructionsMismatch(saved, instructions({ sourceNetwork: "arb" }))
    ).toBe("network");
    expect(
      getInstructionsMismatch(saved, instructions({ originAsset: "x" }))
    ).toBe("asset");
    expect(getInstructionsMismatch(saved, instructions({ amount: "1" }))).toBe(
      "amount"
    );
    // A memo is shown with the address; it no longer blocks the deposit.
    expect(
      getInstructionsMismatch(saved, instructions({ depositMemo: "memo" }))
    ).toBeNull();
    expect(
      getInstructionsMismatch(
        saved,
        instructions({ bridgeableMinAmountOut: "1" })
      )
    ).toBe("minimum output");
  });
});

it("round-trips records through the persisted schema", () => {
  const value = record({
    operationId: fixtureOperationId,
    backend: wrappedOperation("CONFIRMED"),
    lastInstructions: instructions(),
  });
  expect(intentRecordSchema.parse(JSON.parse(JSON.stringify(value)))).toEqual(
    value
  );
});
