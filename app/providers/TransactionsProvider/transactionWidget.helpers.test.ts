import { describe, expect, it } from "vitest";
import { USDT_BRIDGE } from "~/consts/usdtBridge";
import { deposit, localRecord } from "./bridgeTransactions.fixtures";
import type { BridgeTransaction } from "./bridgeTransactions";
import {
  createWidgetPresentation,
  reconcileWidgetPresentation,
  toTransactionWidget,
} from "./transactionWidget.helpers";

const model = (overrides: Partial<BridgeTransaction> = {}) =>
  toTransactionWidget({ ...localRecord(), ...overrides })!;
describe("authoritative display", () => {
  it("omits approval-only attempts", () => {
    expect(
      toTransactionWidget({ ...localRecord(), sourceHashes: [] })
    ).toBeNull();
  });
  for (const status of [
    "confirming",
    "signing",
    "executed",
    "stalled",
  ] as const) {
    for (const verification of [
      "local",
      "unverified",
      "unknown",
      "verified",
      "stale",
    ] as const) {
      it(`${status}/${verification} respects evidence and never invents stages`, () => {
        const state = model({
          backend: deposit({ status }),
          settlement: status,
          verification,
          executionError: "Receipt timeout",
        }).state;
        const expected =
          verification !== "verified"
            ? "warning"
            : status === "executed"
              ? "success"
              : status === "stalled"
                ? "warning"
                : "progress";
        expect(state.status).toBe(expected);
        if (state.status === "progress")
          expect(state.step).toBe(status === "signing" ? 2 : 1);
      });
    }
  }
  it("distinguishes source progress, source confirmation, and settlement", () => {
    expect(
      model({ progress: { step: "lock", status: "confirming" } }).state
    ).toEqual({ status: "progress", step: 1 });
    expect(
      model({ progress: { step: "lock", status: "confirmed" } }).state.status
    ).toBe("warning");
    expect(
      model({
        progress: { step: "lock", status: "confirming" },
        executionError: "Timeout",
      }).state.status
    ).toBe("warning");
    expect(
      model({
        backend: deposit({ status: "stalled", reason: "   " }),
        verification: "verified",
      }).state
    ).toMatchObject({ status: "warning", title: "Deposit delayed" });
    expect(
      model({
        backend: deposit({ status: "executed" }),
        verification: "verified",
      }).state.status
    ).toBe("success");
  });
  it("keeps exact backend decimals and raw quantities; ignores untrusted ticker strings", () => {
    expect(
      model({
        backend: deposit({
          amount: "99999999999999999999.123456789012345678",
          token: "USD",
        }),
      })
    ).toMatchObject({
      amount: "99999999999999999999.123456789012345678",
      symbol: "Token amount",
    });
    expect(
      model({
        backend: deposit({
          amount_raw: "123456789012345678901234567890",
          decimals: 18,
        }),
      }).amount
    ).toBe("123456789012.34567890123456789");
    expect(
      model({ backend: deposit({ amount_raw: "123", decimals: null }) }).amount
    ).toBeNull();
    expect(model().amount).toBeNull();
  });
  it("uses matching local source metadata without labeling quantities as USD", () => {
    const sourceToken = USDT_BRIDGE.sourceToken;
    expect(model({ sourceToken })).toMatchObject({
      amount: "1",
      symbol: "USDT",
    });
    expect(
      model({
        sourceToken,
        backend: deposit({ token_evm: `0x${"2".repeat(40)}` }),
      })
    ).toMatchObject({ amount: null, symbol: "Token amount" });
  });
});
describe("session presentation", () => {
  it("suppresses history, retains active completion, and does not reopen dismissed updates", () => {
    const session = {};
    const history = model({
      operationId: "history",
      backend: deposit({ status: "executed" }),
      settlement: "executed",
      verification: "verified",
    });
    let state = reconcileWidgetPresentation(
      createWidgetPresentation(session),
      session,
      [history]
    );
    expect(state.isOpen).toBe(false);
    const active = model();
    state = reconcileWidgetPresentation(state, session, [history, active]);
    expect(state.isOpen).toBe(true);
    state = {
      ...state,
      dismissed: new Set([active.operationId]),
      isOpen: false,
    };
    const completed = {
      ...active,
      isHistorical: true,
      state: { status: "success" } as const,
    };
    expect(
      reconcileWidgetPresentation(state, session, [history, completed])
    ).toBe(state);
    expect(state.discovered.get(active.operationId)?.visible).toBe(true);
    expect(
      reconcileWidgetPresentation(state, {}, [history]).dismissed.size
    ).toBe(0);
  });
  it("migrates exact backend dismissal without collapsing multiple logs", () => {
    const session = {};
    const early = model({ operationId: "deposit:early", backend: deposit() });
    const other = model({
      operationId: "deposit:other",
      backend: deposit({ log_index: 2 }),
    });
    let state = reconcileWidgetPresentation(
      createWidgetPresentation(session),
      session,
      [early, other]
    );
    state = {
      ...state,
      dismissed: new Set([early.operationId]),
      isOpen: false,
    };
    const adopted = { ...early, operationId: "local" };
    state = reconcileWidgetPresentation(state, session, [adopted, other]);
    expect(state.dismissed.has("local")).toBe(true);
    expect(state.dismissed.has(other.operationId)).toBe(false);
    expect(state.discovered.get("local")?.order).toBe(0);
    expect(state.isOpen).toBe(false);
  });
});
