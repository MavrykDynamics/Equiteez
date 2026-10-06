// @vitest-environment jsdom
import { act, forwardRef, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BigNumber } from "bignumber.js";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { OrderbookExecutionConfig } from "~/lib/orderbook/orderbookConfig.types";
import { BUY, SELL } from "../consts";

const mocks = vi.hoisted(() => ({
  buy: vi.fn(),
  sell: vi.fn(),
  estimateBuy: vi.fn(),
  estimateSell: vi.fn(),
  balances: {} as Record<string, string>,
  toolkit: {},
}));
vi.mock("~/contracts/orderbook.contract", () => ({
  orderbookBuy: mocks.buy,
  orderbookSell: mocks.sell,
  orderbookBuyEstimation: mocks.estimateBuy,
  orderbookSellEstimation: mocks.estimateSell,
}));
vi.mock("~/contracts/hooks/useContractAction", () => ({
  useContractAction: (action: (props: unknown) => void, props: unknown) => ({
    invokeAction: () => action(props),
    status: "idle",
  }),
}));
vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({ dapp: { tezos: () => mocks.toolkit } }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({
    hasOrders: true,
    isKyced: true,
    userTokensBalances: mocks.balances,
  }),
}));
vi.mock("~/lib/apis/rwa", () => {
  const result = {
    loading: false,
    orderbookDepth: {
      token_address: "base",
      orderbook_address: "book",
      quote_token: { address: "quote", token_id: 0, decimals: 6 },
      best_ask: 30,
      best_bid: 30,
    },
  };
  return { MAX_ORDERBOOK_DEPTH_LIMIT: 100, useOrderbookDepth: () => result };
});
vi.mock("../hooks/useOrderbookTokenMetadata", () => ({
  useOrderbookTokenMetadata: () => ({
    isMetadataLoaded: true,
    baseTokenSlug: "base",
    quoteTokenSlug: "quote",
    baseTokenDecimals: 6,
    quoteTokenDecimals: 6,
    baseTokenMetadata: { decimals: 6, symbol: "RWA" },
    quoteTokenMetadata: { decimals: 6, symbol: "USD" },
  }),
}));
vi.mock("~/templates/BalanceInput", () => ({
  BalanceInputWithTotal: forwardRef<
    HTMLInputElement,
    {
      label: string;
      amount?: BigNumber;
      onChange: (value?: BigNumber) => void;
    }
  >(function Input({ label, amount, onChange }, ref) {
    return (
      <input
        ref={ref}
        aria-label={label}
        value={amount?.toFixed() ?? ""}
        onInput={(event) => onChange(new BigNumber(event.currentTarget.value))}
        readOnly
      />
    );
  }),
}));
vi.mock("~/lib/atoms/Button", () => ({
  Button: ({
    children,
    disabled,
    onClick,
  }: {
    children: ReactNode;
    disabled: boolean;
    onClick: () => void;
  }) => (
    <button data-submit disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));
vi.mock("~/templates/ESnakeBlock/ESnakeblock", () => ({
  ESnakeblock: ({
    setSelectedOption,
  }: {
    setSelectedOption: (value: number) => void;
  }) => (
    <>
      {[50, 100].map((value) => (
        <button key={value} onClick={() => setSelectedOption(value)}>
          {value}%
        </button>
      ))}
    </>
  ),
}));
vi.mock("../components/FeesCard/FeesCard", () => ({
  FeesCard: ({
    totalAmount,
    gasFee,
  }: {
    totalAmount: BigNumber;
    gasFee: BigNumber;
  }) => (
    <>
      <output data-total>{totalAmount.toFixed()}</output>
      <output data-gas-fee>{gasFee.toFixed()}</output>
    </>
  ),
}));
vi.mock("~/lib/atoms/Money", () => ({ default: () => null }));
vi.mock("~/templates/Alert/RAlert", () => ({
  RAlert: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));
vi.mock("~/lib/organisms/RCustomDropdown/RCustomDropdown", () => ({
  RCustomDropdown: ({ children }: { children: ReactNode }) => <>{children}</>,
  RDropdownBodyContent: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  RDropdownBodyContentItem: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  RDropdownFaceContent: () => null,
}));
vi.mock("~/lib/organisms/TabSwitcherV2/TabSwitcherV2", () => ({
  TabSwitcherV2: () => null,
}));
vi.mock("~/templates/PopupWIthIcon/PopupWithIcon", () => ({
  PopupWithIcon: () => null,
}));
vi.mock("~/lib/organisms/OrderBookPopup/OrderBookTable", () => ({
  OrderBookTable: () => null,
}));
vi.mock("~/lib/atoms/RIcon/RIcon", () => ({ RIcon: () => null }));
vi.mock("../components/OrderExpiryBlock/OrderExpiryBlock", () => ({
  getOrderExpiryTimestamp: vi.fn(),
  OrderExpiryBlock: () => null,
}));
vi.mock("../components/TradeConfirmationPopup", () => ({
  TradeConfirmationPopup: () => null,
}));
vi.mock("app/utils/gtags.client", () => ({ event: vi.fn() }));

import { BuySellContent } from "./index";

let root: Root;
let container: HTMLDivElement;
const config: OrderbookExecutionConfig = {
  address: "book",
  baseTokenAddress: "base",
  rwaTokenId: "0",
  quoteTokenAddress: "quote",
  quoteTokenId: "0",
  currencyKey: "USD",
  tickSize: "100000",
  quantityTickSize: "10000",
  minBuyOrderAmount: "1",
  minSellOrderAmount: "1",
  minBuyOrderValue: "1",
  minSellOrderValue: "1",
};
const asset = {
  address: "base",
  metadata: { symbol: "RWA" },
  orderbook: {},
} as AssetType;

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mocks.balances = { base: "0.966666", quote: "29" };
  mocks.estimateBuy.mockResolvedValue({ actionSuccess: false });
  mocks.estimateSell.mockResolvedValue({ actionSuccess: false });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});
function render(
  side: typeof BUY | typeof SELL,
  overrides: Partial<OrderbookExecutionConfig> = {}
) {
  act(() =>
    root.render(
      <BuySellContent
        asset={asset}
        orderbookConfig={{ ...config, ...overrides }}
        orderType={side}
        setOrderType={vi.fn()}
        isOrderBookOpen={false}
        setIsOrderBookOpen={vi.fn()}
        onRetryConfig={vi.fn()}
      />
    )
  );
}
function input(label: string) {
  return container.querySelector<HTMLInputElement>(`[aria-label="${label}"]`)!;
}
function change(label: string, value: string) {
  act(() => {
    input(label).value = value;
    input(label).dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function estimate() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(500);
  });
}
function submit() {
  const button = container.querySelector<HTMLButtonElement>("[data-submit]")!;
  act(() => button.click());
  return button;
}

describe.each([BUY, SELL] as const)("Market %s form", (side) => {
  it("uses the suggested gas fee and clears it after a failed estimate", async () => {
    const estimateMock = side === BUY ? mocks.estimateBuy : mocks.estimateSell;
    estimateMock.mockResolvedValueOnce({
      actionSuccess: true,
      data: { totalSuggestedFeeMutez: 444, totalCost: 1154 },
    });
    render(side);
    change(side === BUY ? "Budget" : "Pay with", side === BUY ? "29" : "0.96");
    await estimate();
    expect(container.querySelector("[data-gas-fee]")?.textContent).toBe(
      "0.000444"
    );
    change(side === BUY ? "Budget" : "Pay with", side === BUY ? "28" : "0.95");
    await estimate();
    expect(container.querySelector("[data-gas-fee]")?.textContent).toBe("0");
  });
  it.each([
    ["10000", "960000", "0.96", "28.8"],
    ["100", "966600", "0.9666", "28.998"],
  ])(
    "shares quantity for direct-input preview, estimate and submission at tick %s",
    async (tick, atoms, quantity, consideration) => {
      render(side, { quantityTickSize: tick });
      change(
        side === BUY ? "Budget" : "Pay with",
        side === BUY ? "29" : "0.966666"
      );
      expect(input("Receive").value).toBe(
        side === BUY ? quantity : consideration
      );
      expect(container.querySelector("[data-total]")?.textContent).toBe(
        consideration
      );
      await estimate();
      expect(
        side === BUY ? mocks.estimateBuy : mocks.estimateSell
      ).toHaveBeenLastCalledWith(
        expect.objectContaining({
          rwaTokenAmount: atoms,
          quantityTickSizeAtoms: tick,
        })
      );
      expect(submit().disabled).toBe(false);
      expect(side === BUY ? mocks.buy : mocks.sell).toHaveBeenLastCalledWith(
        expect.objectContaining({
          rwaTokenAmount: atoms,
          quantityTickSizeAtoms: tick,
        })
      );
      // The Buy input remains the budget, while the summary uses estimated spend.
      if (side === BUY) expect(input("Budget").value).toBe("29");
    }
  );
  it("aligns editable receive input", async () => {
    render(side);
    change("Receive", side === BUY ? "0.966666" : "29");
    await estimate();
    submit();
    expect(side === BUY ? mocks.buy : mocks.sell).toHaveBeenCalledWith(
      expect.objectContaining({ rwaTokenAmount: "960000" })
    );
  });
  it.each([50, 100])(
    "aligns %s%% of the available balance downward",
    async (percent) => {
      render(side);
      act(() =>
        Array.from(container.querySelectorAll("button"))
          .find((button) => button.textContent === `${percent}%`)!
          .click()
      );
      await estimate();
      submit();
      expect(side === BUY ? mocks.buy : mocks.sell).toHaveBeenCalledWith(
        expect.objectContaining({
          rwaTokenAmount: percent === 100 ? "960000" : "480000",
        })
      );
    }
  );
  it.each([
    ["below one tick", {}, "0.001"],
    [
      "post-rounding amount minimum",
      { minBuyOrderAmount: "965000", minSellOrderAmount: "965000" },
      undefined,
    ],
    [
      "post-rounding value minimum",
      { minBuyOrderValue: "28900000", minSellOrderValue: "28900000" },
      undefined,
    ],
    ["invalid quantity tick", { quantityTickSize: "0" }, undefined],
    ["unavailable quantity tick", { quantityTickSize: undefined }, undefined],
    ["exceeds balance", {}, "100"],
  ] as const)(
    "blocks estimation and submission: %s",
    async (_label, overrides, amount) => {
      render(side, overrides);
      change(
        side === BUY ? "Budget" : "Pay with",
        amount ?? (side === BUY ? "29" : "0.966666")
      );
      await estimate();
      expect(submit().disabled).toBe(true);
      expect(mocks.estimateBuy).not.toHaveBeenCalled();
      expect(mocks.estimateSell).not.toHaveBeenCalled();
      expect(mocks.buy).not.toHaveBeenCalled();
      expect(mocks.sell).not.toHaveBeenCalled();
    }
  );
});

describe.each([BUY, SELL] as const)("Limit %s form", (side) => {
  function renderLimit(overrides: Partial<OrderbookExecutionConfig> = {}) {
    render(side, overrides);
    act(() =>
      Array.from(container.querySelectorAll("button"))
        .find((button) => button.textContent === "Limit")!
        .click()
    );
    change("Limit Price", "30");
  }
  it.each([
    ["10000", "0.966666", "960000", "28.8"],
    ["100", "0.966666", "966600", "28.998"],
    ["10000", "0.95", "950000", "28.5"],
    ["100", "0.95", "950000", "28.5"],
  ])(
    "aligns direct quantities at tick %s: %s",
    async (tick, amount, atoms, total) => {
      renderLimit({ quantityTickSize: tick });
      change("Amount", amount);
      expect(input("Total").value).toBe(total);
      expect(container.querySelector("[data-total]")?.textContent).toBe(total);
      await estimate();
      expect(
        side === BUY ? mocks.estimateBuy : mocks.estimateSell
      ).toHaveBeenLastCalledWith(
        expect.objectContaining({
          rwaTokenAmount: atoms,
          isMarketOrder: false,
          pricePerRwaToken: "30000000",
        })
      );
      expect(submit().disabled).toBe(false);
      expect(side === BUY ? mocks.buy : mocks.sell).toHaveBeenLastCalledWith(
        expect.objectContaining({ rwaTokenAmount: atoms, isMarketOrder: false })
      );
    }
  );
  it.each([50, 100])("aligns %s%% balance selection", async (percent) => {
    renderLimit();
    act(() =>
      Array.from(container.querySelectorAll("button"))
        .find((button) => button.textContent === `${percent}%`)!
        .click()
    );
    await estimate();
    expect(submit().disabled).toBe(false);
    expect(side === BUY ? mocks.buy : mocks.sell).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rwaTokenAmount: percent === 100 ? "960000" : "480000",
      })
    );
  });
  it.each([
    ["below tick", {}, "0.001"],
    [
      "amount minimum",
      { minBuyOrderAmount: "965000", minSellOrderAmount: "965000" },
      "0.966666",
    ],
    [
      "value minimum",
      { minBuyOrderValue: "28900000", minSellOrderValue: "28900000" },
      "0.966666",
    ],
    ["missing tick", { quantityTickSize: undefined }, "0.966666"],
    ["invalid tick", { quantityTickSize: "0" }, "0.966666"],
    ["balance exceeded", {}, "2"],
  ] as const)(
    "blocks estimation and submission: %s",
    async (_label, overrides, amount) => {
      renderLimit(overrides);
      change("Amount", amount);
      await estimate();
      expect(submit().disabled).toBe(true);
      expect(mocks.estimateBuy).not.toHaveBeenCalled();
      expect(mocks.estimateSell).not.toHaveBeenCalled();
      expect(mocks.buy).not.toHaveBeenCalled();
      expect(mocks.sell).not.toHaveBeenCalled();
    }
  );
  it("preserves price tick rejection", async () => {
    renderLimit();
    change("Amount", "0.96");
    change("Limit Price", "30.01");
    await estimate();
    expect(submit().disabled).toBe(true);
    expect(mocks.estimateBuy).not.toHaveBeenCalled();
    expect(mocks.estimateSell).not.toHaveBeenCalled();
  });
});
