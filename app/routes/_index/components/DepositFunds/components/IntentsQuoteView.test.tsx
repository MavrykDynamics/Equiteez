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
  fixtureSource,
  operation,
  record,
  request,
} from "~/lib/intents/intents.fixtures";
import type { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";
import { IntentsQuoteView } from "./IntentsQuoteView";

vi.mock("~/lib/molecules/HashChip", () => ({
  HashChip: ({ hash }: { hash: string }) => <span>{hash}</span>,
}));

const now = Date.parse("2026-11-13T10:08:55.000Z");
const base = {
  key: "k",
  session: {} as IntentOperations,
  option: fixtureOption,
  request: request(),
  expectedAmountOut: "2000000000000000000",
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
      fundingSlot={<button>Send funds</button>}
    />
  ).replace(/<!-- -->/g, "");

describe("IntentsQuoteView", () => {
  it("reviews the request with the accepted minimum before anything is sent", () => {
    const html = render({ ...base, phase: "review" });
    expect(html).toContain("2 USDT on Arbitrum Sepolia");
    expect(html).toContain("Minimum you accept");
    expect(html).toContain("1.98005 wUSDT");
    expect(html).toContain("0.5%");
    expect(html).toContain(fixtureRecipient);
    expect(html).toContain(fixtureSource);
    expect(html).toContain("Confirm Deposit");
    expect(html).toContain("only after the exact quote is ready");
    expect(html).not.toContain("Send funds");
  });

  it("waits for the quote without a funding action", () => {
    const html = render(
      { ...base, phase: "operation" },
      { status: "preparing" }
    );
    expect(html).toContain("Preparing your quote");
    expect(html).not.toContain("Send funds");
    expect(html).not.toContain("Confirm Deposit");
  });

  it.each([
    [{ status: "paused" } as const, "Funding is paused"],
    [
      { status: "mismatch", detail: "amount" } as const,
      "(amount). Nothing will be sent.",
    ],
  ])("explains %o without a funding action", (view, text) => {
    const html = render({ ...base, phase: "operation" }, view);
    expect(html).toContain(text);
    expect(html).not.toContain("Send funds");
  });

  it("shows the executable quote, deposit address and countdown with the funding action", () => {
    const html = render({ ...base, phase: "operation" }, { status: "ready" });
    expect(html).toContain("You send exactly");
    expect(html).toContain("2 USDT on Arbitrum Sepolia");
    expect(html).toContain("To 1Click deposit address");
    expect(html).toContain(fixtureDeposit);
    // The forwarder is resolved by the backend and never shown as a target.
    expect(html).not.toContain("0x3333333333333333333333333333333333333333");
    expect(html).toContain("Expected to receive");
    expect(html).toContain("1.994 wUSDT");
    expect(html).toContain("1.99003 wUSDT");
    expect(html).toContain("1:05");
    expect(html).toContain(fixtureOperationId);
    expect(html).toContain("Send funds");
  });

  it("surfaces errors with the support request ID", () => {
    expect(
      render({ ...base, phase: "review" }, null, "Busy (Request ID: req-1)")
    ).toContain("Request ID: req-1");
  });
});
