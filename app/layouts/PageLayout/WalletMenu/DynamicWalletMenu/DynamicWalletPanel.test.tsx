// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stablecoinContract } from "~/consts/contracts";
import { MVRK_CONTRACT_ADDRESS } from "~/lib/metadata";

const RWA_ADDRESS = "KT1VgrtVgrtVgrtVgrtVgrtVgrtVgrtVgrt1";

const asset = (overrides: Record<string, unknown>) => ({
  symbol: "",
  name: "",
  icon: null,
  category: "",
  asset_class: null,
  balance: 0,
  value: 0,
  share_pct: 0,
  price: null,
  avg_price: null,
  profit: null,
  profit_pct: null,
  yield_pct: null,
  price_change_30d_pct: null,
  ...overrides,
});

const mocks = vi.hoisted(() => ({
  portfolio: undefined as unknown,
  withdrawProps: vi.fn(),
}));

vi.mock("~/providers/PortfolioProvider/portfolio.provider", () => ({
  PortfolioProvider: ({ children }: { children: ReactNode }) => children,
  usePortfolioContext: () => ({
    userAddress: "mv1Owner",
    portfolio: mocks.portfolio,
    wallet: undefined,
    isLoading: false,
    isWalletLoading: false,
    isPortfolioLoading: false,
    portfolioUpdatedAt: 0,
  }),
}));
vi.mock("~/providers/TokensProvider/tokens.provider", () => ({
  useTokensContext: () => ({ tokensMetadata: {} }),
}));
// Money's full-amount tooltip needs AppProvider
vi.mock("~/lib/ui/useTippy", () => ({ default: () => ({ current: null }) }));
vi.mock("~/templates/AssetIcon", () => ({ AssetIcon: () => null }));
vi.mock("~/lib/atoms/RTooltip", () => ({
  RTooltip: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("~/lib/atoms/CopyButton", () => ({
  CopyButton: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));
vi.mock("@remix-run/react", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));
vi.mock(
  "~/routes/_index/components/DepositFunds/components/ReceiveView",
  () => ({
    ReceiveView: ({ mavrykAddress }: { mavrykAddress: string }) => (
      <p>Receive at {mavrykAddress}</p>
    ),
  })
);
vi.mock(
  "~/routes/portfolio/components/WelcomeBlock/WithdrawFunds/WithdrawFlow",
  () => ({
    WithdrawFlow: (props: { initialAssetSlug?: string }) => {
      mocks.withdrawProps(props);
      return <p>Withdraw form</p>;
    },
  })
);

import { DynamicWalletPanel } from "./DynamicWalletPanel";

let container: HTMLDivElement;
let root: Root;
const onSignOut = vi.fn();

const render = () =>
  act(async () =>
    root.render(
      <DynamicWalletPanel
        address="mv1Owner"
        onClose={vi.fn()}
        onSignOut={onSignOut}
      />
    )
  );
const text = () => container.textContent ?? "";
const click = (label: string | RegExp) =>
  act(async () => {
    const button = Array.from(container.querySelectorAll("button")).find(
      (element) =>
        typeof label === "string"
          ? element.textContent?.trim() === label ||
            element.getAttribute("aria-label") === label
          : label.test(element.textContent ?? "")
    );

    if (!button) throw new Error(`No button ${String(label)}`);
    button.click();
  });

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  mocks.portfolio = {
    currency: "USD",
    total_value: 12450,
    est_net_yield_pct: null,
    assets: [
      asset({
        token_address: stablecoinContract,
        symbol: "USDT",
        name: "Tether",
        balance: 2450,
        value: 2450,
        price: 1,
      }),
      asset({
        token_address: RWA_ADDRESS,
        symbol: "VGRT",
        name: "Vanguard REIT",
        balance: 1000,
        value: 10000,
        price: 10,
      }),
      asset({
        token_address: MVRK_CONTRACT_ADDRESS,
        symbol: "MVRK",
        name: "Mavryk",
        balance: 1204.55,
      }),
    ],
  };
  mocks.withdrawProps.mockReset();
  onSignOut.mockReset();
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
});

describe("DynamicWalletPanel", () => {
  it("lists MVRK, then EQTZ assets, then stablecoins with their badges", async () => {
    await render();

    const rows = Array.from(container.querySelectorAll("li")).map(
      (row) => row.textContent ?? ""
    );

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatch(/^MVRK/);
    expect(rows[0]).toContain("No price");
    expect(rows[1]).toMatch(/^VGRTEQTZ asset/);
    expect(rows[2]).toMatch(/^USDTMRC-30/);
  });

  it("hides and shows the portfolio value", async () => {
    await render();
    expect(text()).toContain("12,450");

    await click("Hide portfolio value");
    expect(text()).not.toContain("12,450");
    expect(text()).toContain("$••••••");

    await click("Show portfolio value");
    expect(text()).toContain("12,450");
  });

  it("opens an asset sheet and sends that asset from it", async () => {
    await render();
    await click(/^VGRT/);

    expect(text()).toContain("Asset Contract");
    expect(text()).toContain("$10.00 per token");

    await click("Send");

    expect(text()).toContain("Withdraw form");
    expect(mocks.withdrawProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ initialAssetSlug: `${RWA_ADDRESS}_0` })
    );

    // Back returns to the asset sheet it came from
    await click("Back to wallet");
    expect(text()).toContain("Asset Contract");
  });

  it("shows MVRK as native with the network fee note", async () => {
    await render();
    await click(/^MVRK/);

    expect(text()).toContain("Native, no contract");
    expect(text()).toContain("network fee in MVRK");
    expect(text()).toContain("No price source yet");
  });

  it("opens Deposit with the wallet address and signs out from the footer", async () => {
    await render();
    await click("Deposit");
    expect(text()).toContain("Receive at mv1Owner");

    await click("Back to wallet");
    await click("Sign out of wallet");
    expect(onSignOut).toHaveBeenCalledOnce();
  });
});
