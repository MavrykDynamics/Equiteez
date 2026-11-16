import { describe, expect, it } from "vitest";

import {
  fixtureOperationId,
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
    // Addresses are normalized to lowercase by the backend.
    expect(
      getOperationMismatch(
        record({
          request: {
            ...saved.request,
            sourceAddress: "0xAbCdEf0000000000000000000000000000000001",
          },
        }),
        operation({
          sourceAddress: "0xabcdef0000000000000000000000000000000001",
        })
      )
    ).toBeNull();
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
      getInstructionsMismatch(saved, instructions({ sourceChainId: "1" }))
    ).toBe("network");
    expect(
      getInstructionsMismatch(saved, instructions({ originAsset: "x" }))
    ).toBe("asset");
    expect(getInstructionsMismatch(saved, instructions({ amount: "1" }))).toBe(
      "amount"
    );
    expect(
      getInstructionsMismatch(saved, instructions({ depositMemo: "memo" }))
    ).toBe("memo");
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
