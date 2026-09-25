import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

import type { UsdtBridgeState } from "~/providers/EthereumProvider/hooks/useUsdtBridge";
import { RDepositFundsModal } from "./RDepositFundsModal";

const mocks = vi.hoisted(() => ({
  state: null as UsdtBridgeState | null,
}));

vi.mock("wagmi", () => ({ useConfig: () => ({ chains: [] }) }));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({ userTokensBalances: {} }),
}));
vi.mock("~/providers/TokensProvider/tokens.provider", () => ({
  useTokensContext: () => ({ tokensMetadata: {} }),
}));
vi.mock("~/providers/EthereumProvider/ethereum.provider", () => ({
  useEthereumContext: () => ({
    bridge: { state: mocks.state, reset: vi.fn() },
    walletSelection: { onClose: vi.fn() },
  }),
}));
vi.mock("~/lib/organisms/CustomPopup/CustomPopup", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("~/lib/atoms/RIcon", () => ({ RIcon: () => null }));
vi.mock("~/lib/atoms/RTypography/RHeading", () => ({
  RHeading: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("./components/BridgeView", () => ({
  BridgeView: () => "deposit form",
}));
vi.mock("./components/ReceiveView", () => ({ ReceiveView: () => null }));
vi.mock("./components/ConfirmedView", () => ({
  ConfirmedView: () => "transaction submitted",
}));
vi.mock("./components/BridgeStatusView", () => ({
  BridgeStatusView: ({ state }: { state: UsdtBridgeState }) =>
    state.isConfirmationUnknown ? "check confirmation" : state.error,
}));

beforeEach(() => {
  mocks.state = {
    amount: "1",
    recipient: "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt",
    sender: null,
    progress: {
      step: "lock",
      status: "confirming",
      hash: `0x${"1".repeat(64)}`,
    },
    isBusy: false,
    isConfirmationUnknown: false,
    error: null,
  };
});

function renderModal() {
  return renderToString(<RDepositFundsModal isOpen onClose={vi.fn()} />);
}

it("shows the submitted screen while a broadcast lock is being tracked", () => {
  expect(renderModal()).toContain("transaction submitted");
});

it.each([
  "The bridge lock transaction reverted.",
  "The transaction was replaced or cancelled in your wallet.",
])("exposes the failure after broadcast: %s", (error) => {
  mocks.state!.error = error;
  const html = renderModal();
  expect(html).toContain(error);
  expect(html).not.toContain("transaction submitted");
});

it("exposes confirmation recovery even though a lock hash exists", () => {
  mocks.state!.isConfirmationUnknown = true;
  const html = renderModal();
  expect(html).toContain("check confirmation");
  expect(html).not.toContain("transaction submitted");
});

it("returns to the submitted screen after successful confirmation recovery", () => {
  mocks.state!.isConfirmationUnknown = true;
  expect(renderModal()).toContain("check confirmation");
  mocks.state!.isConfirmationUnknown = false;
  mocks.state!.progress!.status = "confirmed";
  expect(renderModal()).toContain("transaction submitted");
});
