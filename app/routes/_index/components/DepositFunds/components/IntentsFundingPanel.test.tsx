import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { IntentFundingState } from "~/lib/intents/intentOperation";
import {
  fixtureOperationId,
  instructions,
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
      onFund={vi.fn()}
      onMarkSent={vi.fn()}
      {...props}
    />
  ).replace(/<!-- -->/g, "");

describe("IntentsFundingPanel", () => {
  it("offers the wallet send and the manual option before funding", () => {
    const html = render("not_started", { isWrongNetwork: true });
    expect(html).toContain('aria-label="Send 25 USDC from your wallet"');
    expect(html).toContain("I&#x27;ve sent the deposit");
    expect(html).toContain("switch to Base");
    expect(html).toContain("Transfers are irreversible.");
    expect(html).not.toContain("Simulate");
  });

  it("offers only the manual option without a reviewed wallet or with a memo", () => {
    for (const item of [
      fixtureRecord({
        operationId: fixtureOperationId,
        backend: operation(),
        sourceWallet: undefined,
      }),
      fixtureRecord({
        operationId: fixtureOperationId,
        backend: operation({
          fundingInstructions: instructions({ depositMemo: "42" }),
        }),
      }),
    ]) {
      const html = renderToString(
        <IntentsFundingPanel
          record={item}
          isFunding={false}
          error={null}
          isWrongNetwork={false}
          onFund={vi.fn()}
          onMarkSent={vi.fn()}
        />
      );
      expect(html).not.toContain("Send from wallet");
      expect(html).toContain("sent the deposit");
      expect(html).toContain("Send it from any Base wallet or exchange.");
    }
  });

  it("replaces the wallet send with the simulation in mock mode", () => {
    const html = render("not_started", { onSimulate: vi.fn() });
    expect(html).toContain("Simulate Deposit (mock API)");
    expect(html).not.toContain("Send from wallet");
  });

  it.each([
    ["prompted", "already requested. Do not send it again"],
    ["broadcast", "Waiting for Base confirmation"],
    ["confirmed", "confirmed on Base"],
    ["unknown", "outcome is unknown"],
    ["reverted", "failed"],
  ] as const)("never offers to resend in %s", (state, text) => {
    const html = render(state);
    expect(html).toContain(text);
    expect(html).not.toContain('from your wallet"');
    expect(html).not.toContain("sent the deposit");
    expect(html).toContain(`https://basescan.org/tx/${hash}`);
  });

  it("asks the user to confirm in the wallet while prompting", () => {
    const html = render("prompted", { isFunding: true });
    expect(html).toContain("Confirm in your wallet");
    expect(html).toContain("Approve the 25 USDC transfer in your wallet.");
  });
});
