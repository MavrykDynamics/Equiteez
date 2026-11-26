import { describe, expect, it } from "vitest";

import type { IntentOperation } from "~/lib/apis/intents";
import type {
  IntentFundingState,
  IntentRecord,
} from "~/lib/intents/intentOperation";
import {
  fixtureOperationId,
  fixtureRecipient,
  operation,
  record as fixtureRecord,
  wrappedOperation,
} from "~/lib/intents/intents.fixtures";
import {
  getIntentWidgetId,
  getIntentWidgetState,
  intentWidgetStepLabels,
  toIntentWidget,
} from "./intentWidget";

const hash = `0x${"b".repeat(64)}` as const;
function record(
  fundingState: IntentFundingState,
  backend?: Partial<IntentOperation> | IntentOperation,
  extra: Partial<IntentRecord> = {}
): IntentRecord {
  return fixtureRecord({
    operationId: fixtureOperationId,
    fundingState,
    sourceHashes: fundingState === "not_started" ? [] : [hash],
    backend: backend ? operation(backend) : undefined,
    ...extra,
  });
}
const state = (item: IntentRecord) => getIntentWidgetState(item).state;

describe("intent widget model", () => {
  it.each([
    ["not_started", undefined],
    ["rejected", undefined],
    ["abandoned", undefined],
    ["not_started", { fundingStatus: "EXPIRED", fundingInstructions: null }],
    ["abandoned", { phase: "PREPARING_QUOTE" }],
  ] as const)("is hidden for %s / %o", (fundingState, backend) => {
    expect(
      toIntentWidget(record(fundingState, backend as Partial<IntentOperation>))
    ).toBeNull();
  });

  it("appears once the backend saw funds, even for an abandoned quote", () => {
    expect(
      toIntentWidget(record("abandoned", { fundingStatus: "OBSERVED" }))
    ).not.toBeNull();
  });

  it("uses a composite identity, the source amount and its own steps", () => {
    const model = toIntentWidget(record("broadcast"));
    expect(model).toMatchObject({
      kind: "intent",
      operationId: getIntentWidgetId({ localId: "local-1" }),
      backendId: "intent:local-1",
      amount: "25",
      symbol: "USDC",
      recipient: fixtureRecipient,
      sourceExplorerUrl: `https://basescan.org/tx/${hash}`,
      steps: intentWidgetStepLabels,
    });
  });

  it.each([
    ["broadcast", {}, 1],
    ["confirmed", { fundingStatus: "OBSERVED", fundingInstructions: null }, 2],
    [
      "confirmed",
      { phase: "SWAP_IN_PROGRESS", providerStatus: "PROCESSING" },
      2,
    ],
    [
      "confirmed",
      { phase: "VERIFYING_DELIVERY", providerStatus: "SUCCESS" },
      3,
    ],
    ["confirmed", { phase: "DELIVERY_VERIFIED" }, 3],
    ["confirmed", { phase: "FORWARDING" }, 3],
  ] as const)("maps %s / %o to step %i", (fundingState, backend, step) => {
    const item = record(fundingState, backend as Partial<IntentOperation>);
    expect(state(item)).toMatchObject({ status: "progress", step });
    expect(getIntentWidgetState(item).isTerminal).toBe(false);
  });

  it("never shows 1Click SUCCESS or EVM WRAPPED as success", () => {
    const pending = record("confirmed", wrappedOperation("PENDING"));
    expect(state(pending)).toMatchObject({
      status: "progress",
      step: 4,
      description: expect.stringMatching(/Waiting for Mavryk confirmation/),
    });
    expect(getIntentWidgetState(pending).isTerminal).toBe(false);
    const untracked = record("confirmed", wrappedOperation("NOT_TRACKED"));
    expect(state(untracked)).toMatchObject({ status: "progress", step: 4 });
    // Neutral and dismissible: the service does not track this settlement.
    expect(getIntentWidgetState(untracked).isTerminal).toBe(true);
  });

  it("completes on a confirmed settlement for the expected token", () => {
    const done = record("confirmed", wrappedOperation("CONFIRMED"));
    expect(getIntentWidgetState(done)).toEqual({
      state: {
        status: "success",
        description: "24.921 wUSDT arrived in your Mavryk account.",
      },
      isTerminal: true,
    });
  });

  it("completes on a correlated bridge receipt", () => {
    expect(
      state(
        record("confirmed", wrappedOperation("NOT_TRACKED"), {
          receipt: "correlated",
        })
      ).status
    ).toBe("success");
  });

  it("warns, never succeeds, on a mint for an unexpected token", () => {
    const backend = wrappedOperation("CONFIRMED");
    backend.settlement = { ...backend.settlement, tokenAddress: "KT1Other" };
    expect(state(record("confirmed", backend))).toMatchObject({
      status: "warning",
      title: "Check your Mavryk balance",
    });
  });

  it.each([
    [
      "MANUAL_REVIEW",
      { attention: "MANUAL_REVIEW", phase: "DELIVERY_VERIFIED" },
    ],
    [
      "RECONCILE_REQUIRED",
      { attention: "RECONCILE_REQUIRED", phase: "FORWARDING" },
    ],
    [
      "ambiguous delivery",
      {
        phase: "VERIFYING_DELIVERY",
        delivery: { ...operation().delivery, status: "AMBIGUOUS" },
      },
    ],
  ] as const)(
    "shows %s as a review warning with the operation ID",
    (_, backend) => {
      const item = record("confirmed", backend as Partial<IntentOperation>);
      expect(state(item)).toMatchObject({
        status: "warning",
        title: "Deposit under review",
        description: expect.stringContaining(fixtureOperationId),
      });
      expect(state(item)).toMatchObject({
        description: expect.stringMatching(/Do not send another deposit/),
      });
    }
  );

  it("shows an incomplete deposit without inviting a top-up", () => {
    expect(
      state(
        record("confirmed", {
          fundingStatus: "OBSERVED",
          providerStatus: "INCOMPLETE_DEPOSIT",
          attention: "DEPOSIT_INCOMPLETE",
        })
      )
    ).toMatchObject({ status: "warning", title: "Incomplete deposit" });
  });

  it("presents a refund as a provider report", () => {
    const item = record("confirmed", {
      fundingStatus: "OBSERVED",
      providerStatus: "REFUNDED",
      refund: {
        status: "REPORTED",
        amount: "25000000",
        asset:
          "nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near",
        recipient: "0x1111111111111111111111111111111111111111",
      },
    });
    expect(state(item)).toMatchObject({
      status: "warning",
      title: "Refund reported",
      description: expect.stringMatching(/25 USDC.*provider's report/),
    });
    expect(getIntentWidgetState(item).isTerminal).toBe(true);
  });

  it("adds non-blocking attention copy to progress", () => {
    expect(
      state(
        record("confirmed", {
          phase: "SWAP_IN_PROGRESS",
          attention: "PROVIDER_UNAVAILABLE",
        })
      )
    ).toMatchObject({
      status: "progress",
      step: 2,
      description: expect.stringMatching(/1Click is temporarily unavailable/),
    });
  });

  it("falls back to a warning for unknown backend values", () => {
    expect(
      state(
        record("confirmed", { phase: "UNKNOWN", fundingStatus: "OBSERVED" })
      )
    ).toMatchObject({ status: "warning", title: "Status not recognised" });
  });

  it.each([
    ["prompted", "Check your wallet", false],
    ["unknown", "Transfer outcome unknown", false],
    ["reverted", "Transfer failed", true],
  ] as const)(
    "shows %s funding as a warning",
    (fundingState, title, isTerminal) => {
      const item = record(fundingState, {});
      expect(state(item)).toMatchObject({ status: "warning", title });
      expect(getIntentWidgetState(item).isTerminal).toBe(isTerminal);
    }
  );

  it("does not suggest resending when the quote expired after a send", () => {
    expect(
      state(
        record("confirmed", {
          fundingStatus: "EXPIRED",
          fundingInstructions: null,
        })
      )
    ).toMatchObject({
      status: "warning",
      description: expect.stringMatching(/Do not send it again/),
    });
  });

  it("waits for 1Click after a deposit sent from another wallet", () => {
    const item = record("external", {}, { sourceHashes: [] });
    expect(toIntentWidget(item)).not.toBeNull();
    expect(state(item)).toMatchObject({
      status: "progress",
      step: 1,
      description: expect.stringMatching(/detect your deposit on Base/),
    });
    expect(toIntentWidget(item)?.sourceExplorerUrl).toBeUndefined();
  });

  it("explains paused settlement tokens and sources", () => {
    expect(
      state(
        record("confirmed", {
          fundingStatus: "OBSERVED",
          fundingInstructions: null,
          phase: "SWAP_IN_PROGRESS",
          attention: "SOURCE_PAUSED",
        })
      )
    ).toMatchObject({ description: expect.stringMatching(/still tracked/) });
  });

  it("explains lost access and stays dismissible", () => {
    const item = record("confirmed", {}, { access: "lost" });
    expect(state(item)).toMatchObject({ title: "Status unavailable" });
    expect(getIntentWidgetState(item).isTerminal).toBe(true);
  });
});
