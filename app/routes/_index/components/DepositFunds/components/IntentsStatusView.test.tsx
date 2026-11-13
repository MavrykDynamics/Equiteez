import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { IntentStatus } from "~/lib/apis/intents";
import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import {
  createIntentRecord,
  type IntentRecord,
} from "~/lib/intents/intentOperation";
import {
  fixtureRecipient,
  fixtureSource,
  operation,
} from "~/lib/intents/intents.fixtures";
import { toIntentWidget } from "~/providers/TransactionsProvider/intentWidget";
import { IntentsStatusView } from "./IntentsStatusView";

vi.mock("~/lib/atoms/RIcon", () => ({ RIcon: () => null }));
vi.mock("~/lib/molecules/HashChip", () => ({
  HashChip: ({ hash }: { hash: string }) => <span>{hash}</span>,
}));

const funding = `0x${"a".repeat(64)}` as const;
const delivery = `0x${"d".repeat(64)}` as const;
const forward = `0x${"f".repeat(64)}` as const;

function record(status: IntentStatus): IntentRecord {
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
    fundingState: "confirmed",
    sourceHashes: [funding],
    backend: operation({
      status,
      deliveryTxHash: delivery,
      forwardTxHash: status === "wrapped" ? forward : undefined,
      forwardLogIndex: status === "wrapped" ? 2 : undefined,
    }),
  };
}
const render = (status: IntentStatus) => {
  const item = record(status);
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
    const html = render("wrapped");
    expect(html).toContain("Bridge To Mavryk");
    expect(html).toContain("op-1");
    expect(html).toContain(`sepolia.arbiscan.io/tx/${funding}`);
    expect(html).toContain(delivery);
    expect(html).toContain(`${forward}:2`);
    expect(html).toContain("arrival is not confirmed yet");
    expect(html).not.toContain("Arrived in your Mavryk account");
  });

  it("offers minimize while the operation is moving", () => {
    const html = render("swapping");
    expect(html).toContain("Minimize And Continue Browsing");
    expect(html).not.toContain("Start New Deposit");
  });

  it("offers a new deposit once finished", () => {
    const html = render("refunded");
    expect(html).toContain("Deposit refunded");
    expect(html).toContain("Start New Deposit");
  });
});
