import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { IntentFundingState } from "~/lib/intents/intentOperation";
import {
  fixtureOperationId,
  operation,
  record as fixtureRecord,
} from "~/lib/intents/intents.fixtures";
import { IntentsFundingPanel } from "./IntentsFundingPanel";

const hash = `0x${"b".repeat(64)}` as const;
const record = (
  fundingState: IntentFundingState,
  hashes: `0x${string}`[] = []
) =>
  fixtureRecord({
    operationId: fixtureOperationId,
    backend: operation(),
    fundingState,
    sourceHashes: hashes,
  });

const render = (
  state: IntentFundingState,
  props: Partial<Parameters<typeof IntentsFundingPanel>[0]> = {}
) =>
  renderToString(
    <IntentsFundingPanel
      record={record(state, state === "not_started" ? [] : [hash])}
      isFunding={false}
      error={null}
      isWrongNetwork={false}
      explorerUrl="https://sepolia.arbiscan.io"
      onFund={vi.fn()}
      {...props}
    />
  ).replace(/<!-- -->/g, "");

describe("IntentsFundingPanel", () => {
  it("offers exactly one send action before funding", () => {
    const html = render("not_started", { isWrongNetwork: true });
    expect(html).toContain('aria-label="Send 2 Mock USDT"');
    expect(html).toContain("switch to Arbitrum Sepolia");
    expect(html).toContain("Transfers are irreversible.");
    expect(html).not.toContain("Simulate");
  });

  it("shows the mock-only simulation when provided", () => {
    expect(render("not_started", { onSimulate: vi.fn() })).toContain(
      "Simulate Funding (mock API)"
    );
  });

  it.each([
    ["prompted", "already requested. Do not send it again"],
    ["broadcast", "Waiting for Arbitrum Sepolia confirmation"],
    ["confirmed", "confirmed on Arbitrum Sepolia"],
    ["unknown", "outcome is unknown"],
    ["reverted", "failed"],
  ] as const)("never offers to resend in %s", (state, text) => {
    const html = render(state);
    expect(html).toContain(text);
    expect(html).not.toContain("Send 2 Mock USDT");
    expect(html).toContain(`https://sepolia.arbiscan.io/tx/${hash}`);
  });

  it("asks the user to confirm in the wallet while prompting", () => {
    const html = render("prompted", { isFunding: true });
    expect(html).toContain("Confirm in your wallet");
    expect(html).toContain("Approve the 2 Mock USDT transfer in your wallet.");
  });
});
