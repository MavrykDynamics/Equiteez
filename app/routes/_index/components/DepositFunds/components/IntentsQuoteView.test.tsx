import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type {
  IntentsOperationView,
  IntentsReview,
} from "~/hooks/useIntentsDeposit";
import {
  fixtureDeposit,
  fixtureOperationId,
  fixtureOption,
  fixtureRecipient,
  fixtureSettlement,
  fixtureSource,
  instructions,
  operation,
  preview,
  record,
  request,
} from "~/lib/intents/intents.fixtures";
import type { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";
import { IntentsQuoteView } from "./IntentsQuoteView";

vi.mock("~/lib/atoms/CopyButton", () => ({
  CopyButton: ({ text }: { text: string }) => <button>{text}</button>,
}));
vi.mock("~/lib/atoms/RTooltip/RTooltip", () => ({
  RTooltip: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("react-qr-code", () => ({
  default: ({ value }: { value: string }) => <svg data-qr={value} />,
}));

const now = Date.parse("2026-11-13T10:08:55.000Z");
const base = {
  key: "k",
  session: {} as IntentOperations,
  option: fixtureOption,
  settlement: fixtureSettlement,
  request: request(),
  preview: preview(),
  localId: "local-1",
};
type QuoteReview = Extract<
  IntentsReview,
  { phase: "review" | "creating" | "operation" }
>;
const saved = record({ operationId: fixtureOperationId, backend: operation() });

const render = (
  review: QuoteReview,
  view: IntentsOperationView | null = null,
  error: string | null = null
) =>
  renderToString(
    <IntentsQuoteView
      review={review}
      record={review.phase === "operation" ? saved : undefined}
      operationView={view}
      now={now}
      error={error}
      onConfirm={vi.fn()}
      onBack={vi.fn()}
      onClose={vi.fn()}
      fundingSlot={<button>Send funds</button>}
    />
  ).replace(/<!-- -->/g, "");

describe("IntentsQuoteView", () => {
  it("reviews the request with the accepted minimum before anything is sent", () => {
    const html = render({ ...base, phase: "review" });
    expect(html).toContain("Review deposit");
    expect(html).toContain("25 USDC");
    expect(html).toContain("on Base");
    expect(html).toContain("Minimum received");
    expect(html).toContain("24.6 wUSDT");
    expect(html).toContain("≈ 24.921 wUSDT");
    expect(html).toContain("0.004 USDT0 included");
    expect(html).toContain("~35 s");
    expect(html).toContain("1%");
    expect(html).toContain(fixtureRecipient);
    expect(html).toContain(fixtureSource);
    expect(html).toContain("Confirm deposit");
    expect(html).toContain("Nothing is sent yet");
    expect(html).not.toContain("data-qr");
    expect(html).not.toContain("Send funds");
  });

  it("waits for the quote without a funding action", () => {
    const html = render(
      { ...base, phase: "operation" },
      { status: "preparing" }
    );
    expect(html).toContain("Preparing your deposit address");
    expect(html).not.toContain("Send funds");
    expect(html).not.toContain("Confirm deposit");
  });

  it.each([
    [{ status: "paused" } as const, "temporarily unavailable. Do not send"],
    [
      { status: "mismatch", detail: "amount" } as const,
      "(amount). Do not send anything.",
    ],
  ])("explains %o without a funding action", (view, text) => {
    const html = render({ ...base, phase: "operation" }, view);
    expect(html).toContain(text);
    expect(html).not.toContain("Send funds");
  });

  it("shows the executable quote, deposit address and countdown with the funding action", () => {
    const html = render({ ...base, phase: "operation" }, { status: "ready" });
    expect(html).toContain("Send your deposit");
    expect(html).toContain("You send exactly");
    expect(html).toContain("Send exactly 25 USDC");
    expect(html).toContain("deducts a withdrawal fee");
    expect(html).toContain("Deposit address");
    expect(html).toContain(fixtureDeposit);
    expect(html).toContain(`data-qr="${fixtureDeposit}"`);
    // The forwarder is informational and never shown as a target.
    expect(html).not.toContain("0x3333333333333333333333333333333333333333");
    expect(html).toContain("≈ 24.921 wUSDT");
    expect(html).toContain("24.671 wUSDT");
    expect(html).toContain("1:05");
    expect(html).toContain(fixtureOperationId);
    expect(html).toContain("Send funds");
    expect(html).not.toContain("Memo");
  });

  it("shows a required memo as prominently as the address", () => {
    const withMemo = record({
      operationId: fixtureOperationId,
      backend: operation({
        fundingInstructions: instructions({ depositMemo: "1029384756" }),
      }),
    });
    const html = renderToString(
      <IntentsQuoteView
        review={{ ...base, phase: "operation" }}
        record={withMemo}
        operationView={{ status: "ready" }}
        now={now}
        error={null}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(html).toContain("Memo (required)");
    expect(html).toContain("1029384756");
    expect(html).toContain("Include the memo below");
  });

  it("shows a price update notice", () => {
    const html = renderToString(
      <IntentsQuoteView
        review={{ ...base, phase: "review" }}
        record={undefined}
        operationView={null}
        now={now}
        error={null}
        notice="The price changed."
        onConfirm={vi.fn()}
        onBack={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(html).toContain("Price updated");
  });

  it("surfaces errors with the support request ID", () => {
    expect(
      render({ ...base, phase: "review" }, null, "Busy (Request ID: req-1)")
    ).toContain("Request ID: req-1");
  });
});
