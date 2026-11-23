import { BigNumber } from "bignumber.js";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { IntentsDepositController } from "~/hooks/useIntentsDeposit";
import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import { fixtureOption, resolveOption } from "~/lib/intents/intents.fixtures";
import { IntentsPickerView, type IntentsPickerKind } from "./IntentsPickerView";

vi.mock("~/providers/EthereumProvider/hooks/useIntentSourceBalance", () => ({
  useIntentSourceBalance: () => ({
    balance: new BigNumber("125.123456"),
    status: "ready",
  }),
}));

const eth = resolveOption(mockIntentRoutes[1]);
const usdc = resolveOption(mockIntentRoutes[2]);

const deposit = {
  catalog: {
    status: "ready",
    options: [fixtureOption, eth, usdc],
    refetch: vi.fn(),
  },
  selected: fixtureOption,
  sourceAddress: "0x1111111111111111111111111111111111111111",
  selectRoute: vi.fn(),
} as unknown as IntentsDepositController;

const render = (kind: IntentsPickerKind) =>
  renderToString(
    <IntentsPickerView
      deposit={deposit}
      kind={kind}
      onClose={vi.fn()}
      onDone={vi.fn()}
      walletLabel="MetaMask 0x1111…1111"
    />
  ).replace(/<!-- -->/g, "");

describe("IntentsPickerView", () => {
  it("lists supported networks and explains unavailable ones", () => {
    const html = render("network");
    expect(html).toContain("Select network");
    expect(html).toContain("Search network");
    expect(html).toContain("Supported by your wallet · MetaMask 0x1111…1111");
    expect(html).toContain("Arbitrum Sepolia");
    expect(html).toContain("Not available");
    expect(html).toContain("Quotes for this route are not available");
    expect(html).toMatch(/aria-selected="true"[^>]*>.*Arbitrum Sepolia/s);
  });

  it("lists the selected network's tokens with wallet balances", () => {
    const html = render("token");
    expect(html).toContain("Select token");
    expect(html).toContain("On Arbitrum Sepolia · MetaMask 0x1111…1111");
    expect(html).toContain(fixtureOption.source!.symbol);
    expect(html).toContain("125.1234");
    expect(html).not.toContain("Sepolia ETH");
  });
});
