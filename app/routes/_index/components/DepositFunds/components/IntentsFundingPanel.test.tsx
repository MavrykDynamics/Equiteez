import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import {
  createIntentRecord,
  type IntentFundingState,
} from "~/lib/intents/intentOperation";
import {
  fixtureRecipient,
  fixtureSource,
} from "~/lib/intents/intents.fixtures";
import { IntentsFundingPanel } from "./IntentsFundingPanel";

const hash = `0x${"b".repeat(64)}` as const;
const record = (
  fundingState: IntentFundingState,
  hashes: `0x${string}`[] = []
) => ({
  ...createIntentRecord({
    localId: "local-1",
    account: fixtureRecipient,
    env: "mock",
    route: mockIntentRoutes[0],
    amountIn: "2000000000000000000",
    sourceAddress: fixtureSource,
  }),
  operationId: "op-1",
  funding: {
    chainId: 421614,
    depositAddress: "0x2222222222222222222222222222222222222222" as const,
    token: mockIntentRoutes[0].source.token.address,
    amount: "2000000000000000000",
  },
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
    expect(html).toContain("Send 2 USDT");
    expect(html).toContain("switch to Arbitrum Sepolia");
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
    expect(html).not.toContain("Send 2 USDT");
    expect(html).toContain(`https://sepolia.arbiscan.io/tx/${hash}`);
  });

  it("asks the user to confirm in the wallet while prompting", () => {
    expect(render("prompted", { isFunding: true })).toContain(
      "Confirm the 2 USDT transfer in your wallet."
    );
  });
});
