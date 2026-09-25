import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import { RTransactionWidgetHost } from "./RTransactionWidgetHost";
import { RTransactionWidget } from "./RTransactionWidget";
import { toTransactionWidget } from "../../transactionWidget.helpers";
import { deposit, localRecord } from "../../bridgeTransactions.fixtures";

const mocks = vi.hoisted(() => ({ context: {} as Record<string, unknown> }));
vi.mock("../../TransactionWidgetProvider", () => ({
  useTransactionWidget: () => mocks.context,
}));
vi.mock("~/lib/atoms/RIcon", () => ({ RIcon: () => null }));
vi.mock("~/lib/molecules/HashChip", () => ({
  HashChip: ({ hash }: { hash: string }) => createElement("button", null, hash),
}));
vi.mock("~/lib/atoms/Money", () => ({
  default: ({ children }: { children: ReactNode }) =>
    createElement("span", null, children),
}));
beforeEach(() => {
  mocks.context = {
    models: [],
    visibleModels: [],
    isOpen: false,
    setIsOpen: vi.fn(),
    showDeposits: vi.fn(),
    dismiss: vi.fn(),
    refresh: vi.fn(),
    storageError: null,
    reconciliationError: null,
  };
});
it("renders no preview or empty panel", () => {
  expect(renderToStaticMarkup(createElement(RTransactionWidgetHost))).toBe("");
});
it("renders concurrent cards, exact non-fiat quantities, recovery text and accessible actions without effects", () => {
  const models = [
    toTransactionWidget({
      ...localRecord(),
      backend: deposit({
        status: "executed",
        amount: "12345678901234567890.123456789012345678",
        token: "USD",
      }),
      verification: "verified",
    })!,
    toTransactionWidget({
      ...localRecord("second"),
      backend: deposit({
        status: "stalled",
        reason: "<script>unsafe()</script>",
      }),
      verification: "verified",
    })!,
  ];
  mocks.context = {
    ...mocks.context,
    models,
    visibleModels: models,
    isOpen: true,
    storageError: "Recovery storage unavailable",
  };
  const html = renderToStaticMarkup(createElement(RTransactionWidgetHost));
  expect(html.match(/aria-label="Bridge transaction"/g)).toHaveLength(2);
  expect(html).toContain("12345678901234567890.123456789012345678");
  expect(html).toContain("Token amount");
  expect(html).toContain("Amount unavailable");
  expect(html).toContain("Successfully transferred");
  expect(html).toContain("Deposit delayed");
  expect(html).toContain("&lt;script&gt;");
  expect(html).not.toContain("<script>");
  expect(html).toContain("Refresh status");
  expect(html).toContain("Show deposits (2)");
  expect(html).toContain("Dismiss deposit operation-1");
  expect(mocks.context.refresh).not.toHaveBeenCalled();
  expect(mocks.context.dismiss).not.toHaveBeenCalled();
});
it("retains status announcements and legacy fiat props", () => {
  const html = renderToStaticMarkup(
    createElement(RTransactionWidget, {
      amount: "10",
      recipient: "wallet-a",
      state: { status: "progress", step: 2 },
    })
  );
  expect(html).toContain('aria-live="polite"');
  expect(html).toContain('aria-current="step"');
  expect(html).toContain("USD");
});

it("renders bridge targets, unknown signer thresholds, raw units and source links through the host", () => {
  const models = [
    toTransactionWidget({
      ...localRecord(),
      verification: "verified",
      backend: deposit({ amount_raw: "12345678901234567890", decimals: null }),
    })!,
    toTransactionWidget({
      ...localRecord("signing"),
      verification: "verified",
      backend: deposit({ status: "signing", signer_count: 1 }),
    })!,
    toTransactionWidget(
      {
        ...localRecord("waiting"),
        progress: { step: "lock", status: "confirmed" },
      },
      { lastCheckedAt: 1 }
    )!,
  ];
  mocks.context = {
    ...mocks.context,
    models,
    visibleModels: models,
    isOpen: true,
  };
  const html = renderToStaticMarkup(createElement(RTransactionWidgetHost));
  expect(html).toContain("12 source confirmations");
  expect(html).toContain("Validators sign 1/?");
  expect(html).toContain("12345678901234567890 raw units");
  expect(html).toContain(
    `href="https://sepolia.etherscan.io/tx/${deposit().evm_tx_hash}"`
  );
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).toContain('data-status="waiting"');
  expect(html).not.toContain("Successfully transferred");
});
