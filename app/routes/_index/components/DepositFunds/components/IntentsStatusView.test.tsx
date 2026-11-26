import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { IntentOperation } from "~/lib/apis/intents";
import type { IntentRecord } from "~/lib/intents/intentOperation";
import {
  fixtureOperationId,
  fixtureWrapHash,
  operation,
  record as fixtureRecord,
  wrappedOperation,
} from "~/lib/intents/intents.fixtures";
import { toIntentWidget } from "~/providers/TransactionsProvider/intentWidget";
import { IntentsStatusView } from "./IntentsStatusView";

vi.mock("~/lib/atoms/RIcon", () => ({ RIcon: () => null }));
vi.mock("~/lib/atoms/CopyButton", () => ({
  CopyButton: ({ text }: { text: string }) => <button>{text}</button>,
}));
vi.mock("~/lib/molecules/HashChip", () => ({
  HashChip: ({ hash }: { hash: string }) => <span>{hash}</span>,
}));

const funding = `0x${"a".repeat(64)}` as const;
const delivery = `0x${"d".repeat(64)}` as const;

function record(backend: IntentOperation): IntentRecord {
  return fixtureRecord({
    operationId: fixtureOperationId,
    fundingState: "confirmed",
    sourceHashes: [funding],
    backend,
  });
}
const render = (backend: IntentOperation) => {
  const item = record(backend);
  return renderToString(
    <IntentsStatusView
      record={item}
      model={toIntentWidget(item)}
      onClose={vi.fn()}
      onStartNew={vi.fn()}
    />
  ).replace(/<!-- -->/g, "");
};

describe("IntentsStatusView", () => {
  it("shows the shared progress and keeps every identifier separate", () => {
    const html = render(wrappedOperation("NOT_TRACKED"));
    expect(html).toContain("Bridge To Mavryk");
    expect(html).toContain(fixtureOperationId);
    expect(html).toContain(`basescan.org/tx/${funding}`);
    expect(html).toContain(delivery);
    expect(html).toContain("Sponsored forward");
    expect(html).toContain(`${fixtureWrapHash}:3`);
    expect(html).toContain("arrival is not confirmed yet");
    expect(html).not.toContain("arrived in your Mavryk account");
  });

  it("shows the confirmed amount and the Mavryk mint", () => {
    const html = render(wrappedOperation("CONFIRMED"));
    expect(html).toContain("24.921 wUSDT arrived in your Mavryk account.");
    expect(html).toContain("Received 24.921 wUSDT");
    expect(html).toContain("Mavryk mint");
    expect(html).toContain("ooMint");
    expect(html).toContain("View on explorer");
    expect(html).toContain(">Done<");
    expect(html).not.toContain("New deposit");
  });

  it("offers a new deposit while the operation keeps moving", () => {
    const html = render(
      operation({ phase: "SWAP_IN_PROGRESS", fundingStatus: "OBSERVED" })
    );
    expect(html).toContain("New deposit");
    expect(html).toContain("your deposit continues");
    expect(html).toContain('aria-current="step"');
    expect(html).not.toContain(">Done<");
  });

  it("shows a reported refund as an alert and finishes with Done", () => {
    const html = render(
      operation({
        fundingStatus: "OBSERVED",
        providerStatus: "REFUNDED",
        refund: {
          status: "REPORTED",
          amount: "25000000",
          asset:
            "nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near",
          recipient: "0x1111111111111111111111111111111111111111",
        },
      })
    );
    expect(html).toContain("Refund reported");
    expect(html).toContain('role="alert"');
    expect(html).toContain(">Done<");
  });
});
