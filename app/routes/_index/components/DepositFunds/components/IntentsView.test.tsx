import { BigNumber } from "bignumber.js";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { IntentsDepositController } from "~/hooks/useIntentsDeposit";
import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import { fixtureOption, resolveOption } from "~/lib/intents/intents.fixtures";
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
const usdc = resolveOption(mockIntentRoutes[2]);

function controller(
  overrides: Partial<IntentsDepositController> = {}
): IntentsDepositController {
  return {
    catalog: {
      status: "ready",
      options: [fixtureOption, usdc],
      refetch: vi.fn(),
    },
    selected: fixtureOption,
    route: fixtureOption.route,
    source: fixtureOption.source,
    routeError: null,
    recipient,
    sourceAddress,
    sourceBalance: {
      balance: new BigNumber(10),
      rawBalance: "10",
      status: "ready",
      refetch: vi.fn(),
    },
    amount: new BigNumber(2),
    setAmount: vi.fn(),
    amountError: null,
    slippageBps: 50,
    setSlippageBps: vi.fn(),
    slippageError: null,
    estimate: {
      expected: "2000000000000000000",
      minimum: "1980050000000000000",
    },
    canReview: true,
    isWrongNetwork: false,
    isSwitching: false,
    networkError: null,
    selectRoute: vi.fn(),
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
    expect(html).toContain("mv19MA…NWGWt".slice(0, 6));
    expect(html).toContain("Disconnect");
    expect(html).toContain("Both wallets are ready.");
    expect(html).not.toMatch(disabledButton("Continue"));
  });

  it("asks for the external wallet through the wallet dropdown", () => {
    const html = render({ step: "wallets", ethereumWallet: disconnected });
    expect(html).toContain("Not connected");
    expect(html).toContain("Connect Wallet");
    expect(html).toContain("Connect the external wallet");
    expect(html).toMatch(disabledButton("Continue"));
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
  it("shows the route, destination token, network and estimate", () => {
    const html = render();
    expect(html).toContain("Token to receive");
    expect(html).toContain("wUSDT");
    expect(html).toContain("On Mavryk");
    expect(html).toContain("Arbitrum Sepolia");
    expect(html).toContain("In your external wallet");
    expect(html).toContain("Amount to send");
    expect(html).toContain("You receive");
    expect(html).toContain("≈ 2 wUSDT");
    expect(html).toContain("Minimum received");
    expect(html).toContain("1.98005 wUSDT");
    expect(html).toContain("Network fee only");
    expect(html).toMatch(/aria-expanded="false"[^>]*>0.5%/);
    expect(html).toContain("Review deposit");
  });

  it("locks a fixed amount and zero slippage on the rehearsal route", () => {
    const html = render({
      deposit: controller({
        amount: new BigNumber(1),
        isAmountFixed: true,
        slippageBps: 0,
        isSlippageFixed: true,
      }),
    });
    expect(html).toContain("The amount is fixed by this route.");
    expect(html).toContain("0% (fixed)");
    expect(html).not.toContain("aria-expanded");
    expect(html).not.toContain("Use maximum");
  });

  it("sends a disconnected user back to the wallets step", () => {
    const html = render({ ethereumWallet: disconnected });
    expect(html).toContain("Connect wallets");
    expect(html).not.toContain("Review deposit");
  });

  it.each([
    ["loading", "Loading deposit routes"],
    ["error", "unavailable right now. Receive On Mavryk still works."],
  ] as const)("renders the %s catalog state", (status, text) => {
    const html = render({
      deposit: controller({
        catalog: { status, options: [], refetch: vi.fn() } as never,
        route: undefined,
        selected: undefined,
      }),
    });
    expect(html).toContain(text);
    if (status === "error") expect(html).toContain("Try Again");
  });

  it("explains an unsupported route and blocks review", () => {
    const html = render({
      deposit: controller({
        selected: usdc,
        route: usdc.route,
        source: undefined,
        routeError: "This route is not enabled in Equiteez yet.",
        canReview: false,
      }),
    });
    expect(html).toContain("not enabled in Equiteez yet");
    expect(html).toContain("Select network");
    expect(html).toMatch(disabledButton("Review deposit"));
  });

  it("shows amount validation and a wrong-network switch", () => {
    const html = render({
      deposit: controller({
        amountError: "Minimum deposit is 1 USDT.",
        canReview: false,
        isWrongNetwork: true,
      }),
    });
    expect(html).toContain("Minimum deposit is 1 USDT.");
    expect(html).toContain("Switch to Arbitrum Sepolia");
    expect(html).not.toContain("Minimum received");
  });

  it("surfaces review errors", () => {
    expect(render({ reviewError: "Sponsorship is unavailable." })).toContain(
      "Sponsorship is unavailable."
    );
  });
});
