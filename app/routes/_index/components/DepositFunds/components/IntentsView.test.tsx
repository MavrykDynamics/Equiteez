import { BigNumber } from "bignumber.js";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { IntentsDepositController } from "~/hooks/useIntentsDeposit";
import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";
import { IntentsView } from "./IntentsView";

vi.mock("./BridgeView", () => ({
  DepositAmountField: ({ label }: { label: string }) => <p>{label}</p>,
}));
vi.mock("~/lib/organisms/REthereumWalletDropdown", () => ({
  REthereumWalletDropdown: () => null,
}));
vi.mock("~/lib/molecules/HashChip", () => ({
  HashChip: ({ hash }: { hash: string }) => <span>{hash}</span>,
}));

const recipient = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
const [usdt, , usdc] = mockIntentRoutes;

function controller(
  overrides: Partial<IntentsDepositController> = {}
): IntentsDepositController {
  return {
    catalog: {
      status: "ready",
      options: [
        { route: usdt, availability: "available" },
        { route: usdc, availability: "unsupported_chain" },
      ],
      refetch: vi.fn(),
    },
    selected: { route: usdt, availability: "available" },
    route: usdt,
    routeError: null,
    recipient,
    sourceAddress: "0x1111111111111111111111111111111111111111",
    sourceBalance: {
      balance: new BigNumber(10),
      rawBalance: "10",
      status: "ready",
      refetch: vi.fn(),
    },
    amount: new BigNumber(2),
    setAmount: vi.fn(),
    amountError: null,
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
  isConnected: true,
  isConnecting: false,
  isReconnecting: false,
  error: null,
  connect: vi.fn(),
} as unknown as EthereumContext;

const render = (
  deposit = controller(),
  ethereumWallet = wallet,
  reviewError?: string
) =>
  renderToString(
    <IntentsView
      deposit={deposit}
      ethereumWallet={ethereumWallet}
      isMavrykBusy={false}
      onConnectMavryk={vi.fn()}
      onReview={vi.fn()}
      reviewError={reviewError}
    />
  );

describe("IntentsView", () => {
  it("shows the route, source and the fixed Equiteez recipient", () => {
    const html = render();
    expect(html).toContain("Send from Arbitrum Sepolia");
    expect(html).toContain("USDC on Base Sepolia (unavailable)");
    expect(html).toContain(recipient);
    expect(html).toContain("Review Deposit");
  });

  it("asks for the Mavryk account before review", () => {
    const html = render(controller({ recipient: null, canReview: false }));
    expect(html).toContain("Connect Mavryk Wallet");
    expect(html).not.toContain("Review Deposit");
  });

  it("asks for the source wallet first", () => {
    expect(render(controller(), { ...wallet, isConnected: false })).toContain(
      "Connect Ethereum Wallet"
    );
  });

  it.each([
    ["loading", "Loading deposit routes"],
    [
      "error",
      "unavailable right now. Bridge From Ethereum and Receive On Mavryk still work.",
    ],
  ] as const)("renders the %s catalog state", (status, text) => {
    const html = render(
      controller({
        catalog: { status, options: [], refetch: vi.fn() } as never,
        route: undefined,
        selected: undefined,
      })
    );
    expect(html).toContain(text);
    if (status === "error") expect(html).toContain("Try Again");
  });

  it("explains an unsupported route and blocks review", () => {
    const html = render(
      controller({
        selected: { route: usdc, availability: "unsupported_chain" },
        route: usdc,
        routeError: "This source network is not supported in Equiteez yet.",
        canReview: false,
      })
    );
    expect(html).toContain("not supported in Equiteez yet");
    expect(html).toMatch(/<button[^>]*disabled[^>]*>.*Review Deposit/s);
  });

  it("shows amount validation and a wrong-network switch", () => {
    const html = render(
      controller({
        amountError: "Minimum deposit is 1 USDT.",
        canReview: false,
        isWrongNetwork: true,
      })
    );
    expect(html).toContain("Minimum deposit is 1 USDT.");
    expect(html).toContain("Switch to <!-- -->Arbitrum Sepolia");
  });

  it("surfaces review errors", () => {
    expect(
      render(controller(), wallet, "Sponsorship is unavailable.")
    ).toContain("Sponsorship is unavailable.");
  });
});
