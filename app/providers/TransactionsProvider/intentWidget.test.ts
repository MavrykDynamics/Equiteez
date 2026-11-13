import { describe, expect, it } from "vitest";

import type { IntentStatus } from "~/lib/apis/intents";
import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import {
  createIntentRecord,
  type IntentFundingState,
  type IntentRecord,
} from "~/lib/intents/intentOperation";
import {
  fixtureRecipient,
  fixtureSource,
  operation,
} from "~/lib/intents/intents.fixtures";
import {
  getIntentWidgetId,
  intentWidgetStepLabels,
  toIntentWidget,
} from "./intentWidget";

const hash = `0x${"b".repeat(64)}` as const;
function record(
  fundingState: IntentFundingState,
  status?: IntentStatus,
  extra: Partial<IntentRecord> = {}
): IntentRecord {
  return {
    ...createIntentRecord({
      localId: "local-1",
      account: fixtureRecipient,
      env: "mock",
      route: mockIntentRoutes[0],
      amountIn: "2000000000000000000",
      sourceAddress: fixtureSource,
    }),
    operationId: "op-1",
    fundingState,
    sourceHashes: fundingState === "not_started" ? [] : [hash],
    backend: status ? operation({ status }) : undefined,
    ...extra,
  };
}

describe("intent widget model", () => {
  it.each([
    ["not_started", undefined],
    ["rejected", undefined],
    ["abandoned", undefined],
    ["not_started", "expired"],
    ["abandoned", "awaiting_deposit"],
  ] as const)("hides uncommitted operations: %s/%s", (funding, status) => {
    expect(toIntentWidget(record(funding, status))).toBeNull();
  });

  it("uses a composite identity distinct from bridge hash/log IDs", () => {
    const model = toIntentWidget(record("broadcast"))!;
    expect(model.operationId).toBe("intent:local-1");
    expect(model.backendId).toBe(getIntentWidgetId({ localId: "local-1" }));
    expect(model.backendId).not.toContain(hash);
    expect(model).toMatchObject({
      kind: "intent",
      amount: "2",
      symbol: "USDT",
      recipient: fixtureRecipient,
      steps: intentWidgetStepLabels,
    });
  });

  it.each([
    ["broadcast", undefined, 1],
    ["confirmed", "awaiting_deposit", 1],
    ["confirmed", "deposit_detected", 2],
    ["confirmed", "swapping", 2],
    ["confirmed", "delivered", 3],
    ["confirmed", "forwarding", 3],
  ] as const)("maps %s/%s to step %i", (funding, status, step) => {
    const model = toIntentWidget(record(funding, status))!;
    expect(model.state).toMatchObject({ status: "progress", step });
    expect(model.isTerminal).toBe(false);
  });

  it("shows EVM WRAPPED as neutral bridge processing, never success", () => {
    const model = toIntentWidget(record("confirmed", "wrapped"))!;
    expect(model.state).toMatchObject({ status: "progress", step: 4 });
    expect(model.state.status).not.toBe("success");
    expect(model.isTerminal).toBe(true);
  });

  it("completes only after a correlated receipt", () => {
    expect(
      toIntentWidget(record("confirmed", "wrapped", { receipt: "correlated" }))!
        .state
    ).toEqual({ status: "success" });
  });

  it.each([
    ["refunded", "Deposit refunded"],
    ["expired", "Deposit expired"],
    ["failed", "Deposit failed"],
  ] as const)("shows %s as a dismissible warning", (status, title) => {
    const model = toIntentWidget(record("confirmed", status))!;
    expect(model.state).toMatchObject({ status: "warning", title });
    expect(model.isTerminal).toBe(true);
  });

  it.each([
    ["prompted", "Check your wallet"],
    ["unknown", "Transfer outcome unknown"],
    ["reverted", "Transfer failed"],
  ] as const)(
    "asks the user to check before anything else: %s",
    (funding, title) => {
      expect(toIntentWidget(record(funding))!.state).toMatchObject({
        status: "warning",
        title,
      });
    }
  );

  it("shows backend progress even for an abandoned quote that was funded", () => {
    expect(
      toIntentWidget(record("abandoned", "swapping"))!.state
    ).toMatchObject({
      status: "progress",
      step: 2,
    });
  });
});
