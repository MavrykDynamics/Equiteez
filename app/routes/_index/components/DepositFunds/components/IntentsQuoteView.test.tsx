import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { IntentsReview } from "~/hooks/useIntentsDeposit";
import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import { fixtureRecipient, operation } from "~/lib/intents/intents.fixtures";
import type { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";
import { IntentsQuoteView } from "./IntentsQuoteView";

vi.mock("~/lib/molecules/HashChip", () => ({
  HashChip: ({ hash }: { hash: string }) => <span>{hash}</span>,
}));

const now = Date.parse("2026-11-13T10:00:00.000Z");
const preview = {
  routeId: "arb-sepolia-usdt",
  amountIn: "2000000000000000000",
  amountOut: "1994000",
  minAmountOut: "1974060",
  expiresAt: "2026-11-13T10:01:05.000Z",
  recipient: fixtureRecipient,
};
const base = {
  key: "k",
  session: {} as IntentOperations,
  route: mockIntentRoutes[0],
  amountIn: preview.amountIn,
  sourceAddress: "0x1111111111111111111111111111111111111111" as const,
  preview,
  localId: "local-1",
};

const render = (review: IntentsReview, at = now) =>
  renderToString(
    <IntentsQuoteView
      review={review as Exclude<IntentsReview, { phase: "form" | "quoting" }>}
      now={at}
      error={null}
      onConfirm={vi.fn()}
      onRefresh={vi.fn()}
      onAcceptUpdate={vi.fn()}
      onBack={vi.fn()}
      fundingSlot={<button>Send funds</button>}
    />
  ).replace(/<!-- -->/g, "");

describe("IntentsQuoteView", () => {
  it("shows amounts, minimum output, recipient and expiry", () => {
    const html = render({ ...base, phase: "review" });
    expect(html).toContain("2 USDT on Arbitrum Sepolia");
    expect(html).toContain("1.994 wUSDT");
    expect(html).toContain("1.97406 wUSDT");
    expect(html).toContain(fixtureRecipient);
    expect(html).toContain("1:05");
    expect(html).toContain("Confirm Quote");
  });

  it("asks for a refresh once the preview expired", () => {
    const html = render({ ...base, phase: "review" }, now + 70_000);
    expect(html).toContain("Expired");
    expect(html).toContain("Refresh Quote");
    expect(html).not.toContain("Confirm Quote");
  });

  it("explains a changed executable quote", () => {
    const html = render({
      ...base,
      phase: "reconfirm",
      operation: operation({ amountOut: "1900000", minAmountOut: "1880000" }),
    });
    expect(html).toContain("The final quote changed.");
    expect(html).toContain("1.994 wUSDT → 1.9 wUSDT");
    expect(html).toContain("Accept Updated Quote");
  });

  it("offers funding only once the operation is ready", () => {
    expect(render({ ...base, phase: "review" })).not.toContain("Send funds");
    const html = render({ ...base, phase: "ready", operation: operation() });
    expect(html).toContain("Send funds");
    expect(html).toContain("Send funds within");
  });
});
