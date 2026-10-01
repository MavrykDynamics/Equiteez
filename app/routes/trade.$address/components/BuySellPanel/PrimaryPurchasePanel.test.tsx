// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BigNumber } from "bignumber.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { PrimaryPurchaseConfig } from "~/contracts/primaryPurchase.types";
import { PrimaryPurchasePanel } from "./PrimaryPurchasePanel";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  refetch: vi.fn(),
  purchase: vi.fn(),
  estimate: vi.fn(),
  refresh: vi.fn(),
  tezos: {},
  isKyced: false,
}));
vi.mock("./usePrimaryPurchase", () => ({ usePrimaryPurchase: mocks.query }));
vi.mock("~/routes/_index/components/DepositFunds/RDepositFundsModal", () => ({
  RDepositFundsModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div role="dialog">Deposit modal</div> : null,
}));
vi.mock("~/contracts/primaryPurchase.contract", () => ({
  primaryPurchase: mocks.purchase,
  estimatePrimaryPurchase: mocks.estimate,
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({ connect: vi.fn(), isKyced: mocks.isKyced }),
}));
vi.mock("~/lib/metadata", () => ({
  createFallbackTokenMetadata: (value: unknown) => value,
}));
vi.mock("~/lib/atoms/Spinner", () => ({ Spinner: () => <div>Loading</div> }));
vi.mock("~/providers/ToasterProvider/toaster.provider.const", () => ({
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA: {},
}));
vi.mock("~/contracts/hooks/useContractAction", () => ({
  useContractAction: (
    action: (value: unknown) => Promise<void>,
    args: object,
    _popup: unknown,
    _toast: unknown,
    options: { onSuccess: (value: unknown) => void }
  ) => ({
    invokeAction: async () => {
      try {
        await action({ ...args, tezos: mocks.tezos });
        options.onSuccess({ confirmation: { level: 42 } });
      } catch {
        // The production hook reports contract failures without rejecting.
      }
    },
    status: "idle",
    isLoading: false,
  }),
}));
vi.mock("~/lib/organisms/PriceSection/screens/BuySellScreen", () => ({
  BuySellScreen: ({
    actionCb,
    amount,
    primaryPurchase,
    validationMessage,
    isOrderDataLoading,
  }: {
    actionCb: () => void;
    amount?: BigNumber;
    isOrderDataLoading: boolean;
    validationMessage?: string;
    primaryPurchase: {
      receiveAmount?: BigNumber;
      onReceiveChange: (value: BigNumber) => void;
    };
  }) => (
    <div>
      <button
        onClick={() => primaryPurchase.onReceiveChange(new BigNumber("1.5"))}
      >
        Enter 1.5
      </button>
      <div>
        Pay {amount?.toFixed()} Receive{" "}
        {primaryPurchase.receiveAmount?.toFixed()}
      </div>
      <div>{validationMessage}</div>
      <button
        disabled={isOrderDataLoading || !!validationMessage}
        onClick={actionCb}
      >
        Buy
      </button>
    </div>
  ),
}));

const config: PrimaryPurchaseConfig = {
  launchName: "live-launch",
  launchpadAddress: "KT1launchpad",
  assetAddress: "KT1asset",
  assetTokenId: "0",
  wallet: "wallet",
  saleStart: Date.parse("2020-01-01"),
  distribution: "AUTO",
  pendingDistribution: "0",
  options: [
    {
      name: "Starter",
      payment: "USDT",
      price: "30000000",
      feeBps: "100",
      discountBps: "0",
      tokenAddress: "KT1payment",
      tokenId: "0",
      minAmount: "1",
      maxAmount: "9000000",
    },
  ],
};
const asset = {
  address: "KT1asset",
  metadata: { name: "Asset", symbol: "RWA", decimals: 6 },
  apy: 0,
} as AssetType;
let container: HTMLDivElement;
let root: Root;
const click = async (text: string) => {
  const button = [...container.querySelectorAll("button")].find(
    (item) => item.textContent === text
  )!;
  expect(button).toBeTruthy();
  await act(async () => {
    button.click();
  });
};
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mocks.isKyced = false;
  mocks.purchase.mockReset().mockResolvedValue(undefined);
  mocks.estimate
    .mockReset()
    .mockResolvedValue({ networkFee: 100n, gasFee: 10n });
  mocks.refresh.mockReset();
  mocks.refetch.mockReset().mockResolvedValue({ data: config });
  mocks.query.mockReturnValue({
    data: config,
    isPending: false,
    isFetching: false,
    error: null,
    refetch: mocks.refetch,
    tezos: mocks.tezos,
    refreshAfterPurchase: mocks.refresh,
  });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("primary purchase panel flow", () => {
  it("uses the cheapest eligible option without a dropdown and rechecks option changes at review", async () => {
    await act(async () => root.render(<PrimaryPurchasePanel asset={asset} />));
    expect(container.querySelector('[aria-label="Sale option"]')).toBeNull();
    expect(container.querySelector('[role="combobox"]')).toBeNull();
    await click("Enter 1.5");
    mocks.refetch.mockResolvedValue({
      data: {
        ...config,
        options: [
          { ...config.options[0], name: "New cheapest" },
          ...config.options,
        ],
      },
    });
    await click("Buy");
    expect(container.textContent).toContain("quote has changed");
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(mocks.purchase).not.toHaveBeenCalled();
  });

  it("purchases directly without a confirmation popup and passes exact raw units", async () => {
    await act(async () => root.render(<PrimaryPurchasePanel asset={asset} />));
    await click("Enter 1.5");
    expect(container.textContent).toContain("Pay 45 Receive 1.5");
    await click("Buy");
    expect(mocks.refetch).toHaveBeenCalledOnce();
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(mocks.purchase).toHaveBeenCalledOnce();
    expect(mocks.purchase.mock.calls[0][0].review).toMatchObject({
      amount: "1500000",
      quote: { totalPayment: "45000000", fee: "450000" },
    });
    expect(mocks.refresh).toHaveBeenCalledWith({ confirmation: { level: 42 } });
    expect(container.textContent).not.toContain("Pay 45 Receive 1.5");
  });
  it("requires another review if the price changes before confirmation", async () => {
    await act(async () => root.render(<PrimaryPurchasePanel asset={asset} />));
    await click("Enter 1.5");
    mocks.refetch.mockResolvedValue({
      data: {
        ...config,
        options: [{ ...config.options[0], price: "31000000" }],
      },
    });
    await click("Buy");
    expect(container.textContent).toContain("quote has changed");
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(mocks.purchase).not.toHaveBeenCalled();
  });
  it("uses the API sale window instead of the contract start for the countdown", async () => {
    mocks.query.mockReturnValue({
      data: {
        ...config,
        countdown: {
          saleStart: new Date(Date.now() + 60_000).toISOString(),
          saleEnd: new Date(Date.now() + 120_000).toISOString(),
        },
      },
      refetch: mocks.refetch,
      tezos: mocks.tezos,
    });
    await act(async () => root.render(<PrimaryPurchasePanel asset={asset} />));
    expect(container.querySelector('[role="timer"]')).not.toBeNull();
  });
  it.each([false, true])(
    "shows the countdown action for Pro=%s",
    async (isKyced) => {
      mocks.isKyced = isKyced;
      const previewAsset = {
        ...asset,
        metadata: { ...asset.metadata, symbol: "ANTH" },
      };
      await act(async () =>
        root.render(<PrimaryPurchasePanel asset={previewAsset} />)
      );
      const button = [...container.querySelectorAll("button")].find(
        (item) => item.textContent === (isKyced ? "Deposit Funds" : "Start KYC")
      );
      expect(button).toBeTruthy();
      expect(button?.disabled).toBe(!isKyced);
      if (isKyced) {
        await click("Deposit Funds");
        expect(container.querySelector('[role="dialog"]')?.textContent).toBe(
          "Deposit modal"
        );
      } else {
        expect(container.textContent).not.toContain("Deposit Funds");
      }
    }
  );
  it("does not fall back to the contract start when API dates are missing", async () => {
    mocks.query.mockReturnValue({
      data: { ...config, saleStart: Date.now() + 60_000 },
      refetch: mocks.refetch,
      tezos: mocks.tezos,
    });
    await act(async () => root.render(<PrimaryPurchasePanel asset={asset} />));
    expect(container.querySelector('[role="timer"]')).toBeNull();
  });
  it("blocks an unavailable launch and never renders sell or limit controls", async () => {
    mocks.query.mockReturnValue({
      data: { ...config, unavailableReason: "The launch is not active." },
      refetch: mocks.refetch,
      tezos: mocks.tezos,
    });
    await act(async () => root.render(<PrimaryPurchasePanel asset={asset} />));
    expect(container.textContent).toContain("The launch is not active.");
    const buy = [...container.querySelectorAll("button")].find(
      (item) => item.textContent === "Buy"
    )!;
    expect(buy.disabled).toBe(true);
    expect(container.textContent).not.toMatch(/Sell|Limit/);
  });
});
