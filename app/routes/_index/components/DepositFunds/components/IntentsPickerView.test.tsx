import { BigNumber } from "bignumber.js";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { IntentsDepositController } from "~/hooks/useIntentsDeposit";
import {
  fixtureCatalog,
  fixtureOption,
  fixtureSolanaOption,
} from "~/lib/intents/intents.fixtures";
import {
  createFakeWalletAdapter,
  fakeIntentWalletsContext,
} from "~/lib/intents/wallets/intentWallet.fixtures";
import { IntentsPickerView, type IntentsPickerKind } from "./IntentsPickerView";

const walletsContext = vi.hoisted(() => ({ value: null as unknown }));
vi.mock("~/providers/IntentWalletsProvider/IntentWalletsProvider", () => ({
  useIntentWalletsContext: () => walletsContext.value,
}));
vi.mock("~/providers/EthereumProvider/hooks/useIntentSourceBalance", () => ({
  useIntentSourceBalance: () => ({
    balance: new BigNumber("125.123456"),
    status: "ready",
  }),
}));

walletsContext.value = fakeIntentWalletsContext();

const controller = (selected = fixtureOption) =>
  ({
    catalog: {
      status: "ready",
      options: fixtureCatalog.options,
      refetch: vi.fn(),
    },
    selected,
    network: selected.network,
    // The sending wallet for EVM assets in these tests; none for Solana.
    sourceWallet:
      selected.network.family === "evm"
        ? "0x1111111111111111111111111111111111111111"
        : undefined,
    selectAsset: vi.fn(),
  }) as unknown as IntentsDepositController;

const render = (kind: IntentsPickerKind, selected = fixtureOption) =>
  renderToString(
    <IntentsPickerView
      deposit={controller(selected)}
      kind={kind}
      onClose={vi.fn()}
      onDone={vi.fn()}
    />
  ).replace(/<!-- -->/g, "");

describe("IntentsPickerView", () => {
  it("lists EVM and other networks with their assets", () => {
    const html = render("network");
    expect(html).toContain("Select network");
    expect(html).toContain("Search network");
    expect(html).toContain("EVM networks");
    expect(html).toContain("Other networks");
    for (const name of [
      "Ethereum",
      "Base",
      "Solana",
      "NEAR",
      "Aptos",
      "Bitcoin",
    ])
      expect(html).toContain(name);
    expect(html).toContain("NEAR, ZEC");
    expect(html).toMatch(/aria-selected="true"[^>]*>.*Base/s);
  });

  it("lists the network's wallets, installed first", () => {
    const adapter = createFakeWalletAdapter("solana", {
      address: "EKpQ",
      walletName: "Phantom",
    });
    adapter.getWallets = () => [
      { id: "phantom", name: "Phantom", isInstalled: true },
      {
        id: "solflare",
        name: "Solflare",
        isInstalled: false,
        installUrl: "https://solflare.com",
      },
    ];
    walletsContext.value = fakeIntentWalletsContext({}, { solana: adapter });
    const html = render("wallet", fixtureSolanaOption);
    expect(html).toContain("Connect a Solana wallet");
    expect(html).toContain("Detected in this browser");
    expect(html).toContain("Phantom");
    expect(html).toContain("Not installed");
    expect(html).toContain("Solflare");
    walletsContext.value = fakeIntentWalletsContext();
  });

  it("shows balances of the sending wallet only", () => {
    expect(render("token")).toContain("125.1234");
    const solana = render("token", fixtureSolanaOption);
    expect(solana).toContain("On Solana");
    expect(solana).toContain("SOL");
    expect(solana).not.toContain("125.1234");
  });
});
