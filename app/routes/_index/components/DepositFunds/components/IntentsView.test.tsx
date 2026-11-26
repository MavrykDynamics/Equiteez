import { BigNumber } from "bignumber.js";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { IntentsDepositController } from "~/hooks/useIntentsDeposit";
import {
  fixtureCatalog,
  fixtureOption,
  fixtureSolanaOption,
  preview,
} from "~/lib/intents/intents.fixtures";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";
import { IntentsView, type IntentsFormStep } from "./IntentsView";

vi.mock("~/lib/organisms/REthereumWalletDropdown", () => ({
  REthereumWalletDropdown: () => <button>Connect Wallet</button>,
}));
vi.mock("~/lib/atoms/RTooltip/RTooltip", () => ({
  RTooltip: ({ children }: { children: ReactNode }) => children,
}));

const recipient = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
const sourceAddress = "0x1111111111111111111111111111111111111111";

function controller(
  overrides: Partial<IntentsDepositController> = {}
): IntentsDepositController {
  return {
    catalog: {
      status: "ready",
      error: null,
      options: fixtureCatalog.options,
      settlement: fixtureCatalog.settlement,
      refetch: vi.fn(),
    },
    catalogError: null,
    selected: fixtureOption,
    network: fixtureOption.network,
    recipient,
    walletAddress: sourceAddress,
    canWalletSend: true,
    sourceBalance: {
      balance: new BigNumber(100),
      rawBalance: "100000000",
      status: "ready",
      refetch: vi.fn(),
    },
    amount: new BigNumber(25),
    setAmount: vi.fn(),
    amountError: null,
    slippageBps: 100,
    setSlippageBps: vi.fn(),
    slippageError: null,
    refundAddress: sourceAddress,
    refundInput: "",
    setRefundInput: vi.fn(),
    refundError: null,
    isRefundFromWallet: true,
    isRefundConfirmed: false,
    setIsRefundConfirmed: vi.fn(),
    preview: preview(),
    previewStatus: "ready",
    previewError: null,
    refetchPreview: vi.fn(),
    canReview: true,
    isPreparingReview: false,
    isWrongNetwork: false,
    isSwitching: false,
    networkError: null,
    selectAsset: vi.fn(),
    switchToSource: vi.fn(),
    resetForm: vi.fn(),
    ...overrides,
  } as unknown as IntentsDepositController;
}

const wallet = {
  userAddress: sourceAddress,
  isConnected: true,
  isConnecting: false,
  isReconnecting: false,
  error: null,
  connect: vi.fn(),
  signOut: vi.fn(),
} as unknown as EthereumContext;

const render = ({
  deposit = controller(),
  ethereumWallet = wallet,
  reviewError,
  step = "details",
}: {
  deposit?: IntentsDepositController;
  ethereumWallet?: EthereumContext;
  reviewError?: string;
  step?: IntentsFormStep;
} = {}) =>
  renderToString(
    <IntentsView
      deposit={deposit}
      ethereumWallet={ethereumWallet}
      isMavrykBusy={false}
      onConnectMavryk={vi.fn()}
      onOpenPicker={vi.fn()}
      onReview={vi.fn()}
      onStepChange={vi.fn()}
      reviewError={reviewError}
      step={step}
      walletName="MetaMask"
    />
  ).replace(/<!-- -->/g, "");

const disabledButton = (label: string) =>
  new RegExp(`<button[^>]*disabled=""[^>]*><span[^>]*>${label}<`);

const disconnected = {
  ...wallet,
  userAddress: null,
  isConnected: false,
} as unknown as EthereumContext;

describe("IntentsView wallets step", () => {
  it("shows both connected wallets and lets the user continue", () => {
    const html = render({ step: "wallets" });
    expect(html).toContain('aria-current="step"');
    expect(html).toContain("0x1111…1111");
    expect(html).toContain("MetaMask");
    expect(html).toContain("Disconnect");
    expect(html).toContain("Ready. Next, choose what to send.");
    expect(html).not.toMatch(disabledButton("Continue"));
  });

  it("treats the EVM wallet as optional", () => {
    const html = render({ step: "wallets", ethereumWallet: disconnected });
    expect(html).toContain("Optional · EVM wallet");
    expect(html).toContain("Connect Wallet");
    expect(html).toContain("pay from any wallet or exchange");
    expect(html).not.toMatch(disabledButton("Continue"));
  });

  it("asks for the Equiteez account", () => {
    const html = render({
      step: "wallets",
      deposit: controller({ recipient: null }),
    });
    expect(html).toContain(">Connect<");
    expect(html).toMatch(disabledButton("Continue"));
  });
});

describe("IntentsView details step", () => {
  it("shows the network, destination token, refund address and preview", () => {
    const html = render();
    expect(html).toContain("Token to receive");
    expect(html).toContain("wUSDT");
    expect(html).toContain("On Mavryk");
    expect(html).toContain("Base");
    expect(html).toContain("Send from your connected wallet");
    expect(html).toContain("Amount to send");
    expect(html).toContain("Refunds go back to your connected wallet");
    expect(html).toContain("You receive");
    expect(html).toContain("≈ 24.921 wUSDT");
    expect(html).toContain("Minimum received");
    expect(html).toContain("24.6 wUSDT");
    expect(html).toContain("0.004 USDT0 included");
    expect(html).toContain("~35 s after your deposit confirms");
    expect(html).toMatch(/aria-expanded="false"[^>]*>1%/);
    expect(html).toContain("Review deposit");
    expect(html).not.toMatch(disabledButton("Review deposit"));
  });

  it("asks for and confirms a refund address on non-EVM networks", () => {
    const html = render({
      deposit: controller({
        selected: fixtureSolanaOption,
        network: fixtureSolanaOption.network,
        canWalletSend: false,
        isRefundFromWallet: false,
        refundInput: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        canReview: false,
      }),
    });
    expect(html).toContain("Refund address on Solana");
    expect(html).toContain("Send from any wallet or exchange");
    expect(html).toContain("I control this Solana address");
    expect(html).toContain("no checksum");
    expect(html).not.toContain("Use maximum");
    expect(html).toMatch(disabledButton("Review deposit"));
  });

  it("shows refund address errors", () => {
    const html = render({
      deposit: controller({
        isRefundFromWallet: false,
        refundInput: "0x1",
        refundError: "This is not a valid Base address.",
      }),
    });
    expect(html).toContain("This is not a valid Base address.");
    expect(html).not.toContain("I control this");
  });

  it("shows preview loading and errors with a retry", () => {
    expect(
      render({
        deposit: controller({ preview: undefined, previewStatus: "loading" }),
      })
    ).toContain("Getting a price");
    const html = render({
      deposit: controller({
        preview: undefined,
        previewStatus: "error",
        previewError: "This amount is too low to swap.",
        canReview: false,
      }),
    });
    expect(html).toContain("This amount is too low to swap.");
    expect(html).toContain("Retry");
    expect(html).not.toContain("Minimum received");
  });

  it("asks for the Equiteez wallet when it is not connected", () => {
    const html = render({ deposit: controller({ recipient: null }) });
    expect(html).toContain("Connect Equiteez wallet");
    expect(html).not.toContain("Review deposit");
  });

  it.each([
    ["loading", "Loading supported assets"],
    ["error", "unavailable right now. Receive On Mavryk still works."],
  ] as const)("renders the %s catalog state", (status, text) => {
    const html = render({
      deposit: controller({
        catalog: {
          status,
          error: null,
          options: [],
          refetch: vi.fn(),
        } as never,
        selected: undefined,
        network: undefined,
      }),
    });
    expect(html).toContain(text);
    if (status === "error") expect(html).toContain("Try Again");
  });

  it("explains why deposits cannot start", () => {
    const html = render({
      deposit: controller({
        catalogError:
          "Cross-chain deposits are not enabled on this deployment yet.",
      }),
    });
    expect(html).toContain("not enabled on this deployment yet");
    expect(html).toContain("Receive On Mavryk still works.");
  });

  it("shows amount validation and a wrong-network switch", () => {
    const html = render({
      deposit: controller({
        amountError: "Insufficient USDC balance.",
        preview: undefined,
        previewStatus: "idle",
        canReview: false,
        isWrongNetwork: true,
      }),
    });
    expect(html).toContain("Insufficient USDC balance.");
    expect(html).toContain("Switch to Base");
    expect(html).not.toContain("Minimum received");
  });

  it("surfaces review errors", () => {
    expect(render({ reviewError: "Sponsorship is unavailable." })).toContain(
      "Sponsorship is unavailable."
    );
  });
});
