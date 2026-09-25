// @vitest-environment jsdom
import { act, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

import type { UsdtBridgeState } from "~/providers/EthereumProvider/hooks/useUsdtBridge";
import { type BridgeTransaction } from "~/providers/TransactionsProvider/bridgeTransactions";
import {
  localRecord,
  signerEventSequence,
} from "~/providers/TransactionsProvider/bridgeTransactions.fixtures";
import { RDepositFundsModal } from "./RDepositFundsModal";

const mocks = vi.hoisted(() => ({
  state: null as UsdtBridgeState | null,
  transactions: new Map<string, BridgeTransaction>(),
}));

vi.mock("~/providers/TransactionsProvider/TransactionsProvider", () => ({
  useTransactionsContext: () => ({ transactions: mocks.transactions }),
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
  mocks.transactions.clear();
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

it("hands the matching transaction over to the global widget on its first event", () => {
  const record = {
    ...localRecord(),
    sourceHashes: [mocks.state!.progress!.hash!],
    signerEvents: [
      {
        ...signerEventSequence[0],
        direction: "in" as const,
        status: "PENDING" as const,
      },
    ],
  };
  mocks.transactions.set(record.operationId, record);
  expect(renderModal()).toBe("");
});

it("does not hide the popup for another deposit's event", () => {
  mocks.transactions.set("other", {
    ...localRecord("other"),
    signerEvents: [
      { ...signerEventSequence[0], direction: "in", status: "PENDING" },
    ],
  });
  expect(renderModal()).toContain("transaction submitted");
});

it("closes the open popup once when its matching event arrives", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const element = document.createElement("div");
  const root = createRoot(element);
  const onClose = vi.fn();
  function Popup() {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <RDepositFundsModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setIsOpen(false);
        }}
      />
    );
  }
  try {
    await act(async () => root.render(<Popup />));
    expect(element.textContent).toContain("transaction submitted");
    expect(onClose).not.toHaveBeenCalled();
    mocks.transactions.set("operation-1", {
      ...localRecord(),
      sourceHashes: [mocks.state!.progress!.hash!],
      signerEvents: [
        { ...signerEventSequence[0], direction: "in", status: "PENDING" },
      ],
    });
    await act(async () => root.render(<Popup />));
    expect(onClose).toHaveBeenCalledOnce();
    expect(element.textContent).toBe("");
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
