// @vitest-environment jsdom
import { BigNumber } from "bignumber.js";
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import type { UsdtBridgeState } from "~/providers/EthereumProvider/hooks/useUsdtBridge";
import { type BridgeTransaction } from "~/providers/TransactionsProvider/bridgeTransactions";
import {
  localRecord,
  signerEventSequence,
} from "~/providers/TransactionsProvider/bridgeTransactions.fixtures";
import { toTransactionWidget } from "~/providers/TransactionsProvider/transactionWidget.helpers";
import { RButton } from "~/lib/atoms/RButton";
import { RDepositFundsModal } from "./RDepositFundsModal";

const mocks = vi.hoisted(() => ({
  state: null as UsdtBridgeState | null,
  transactions: new Map<string, BridgeTransaction>(),
  holdDeposit: vi.fn(),
  releaseDeposit: vi.fn(),
  reset: vi.fn(),
  closeWallet: vi.fn(),
  submit: vi.fn(),
}));

vi.mock("~/providers/TransactionsProvider/TransactionWidgetProvider", () => ({
  useTransactionWidget: () => ({
    transactions: [...mocks.transactions.values()],
    models: [...mocks.transactions.values()].flatMap((record) => {
      const model = toTransactionWidget(record);
      return model ? [model] : [];
    }),
    holdDeposit: mocks.holdDeposit,
  }),
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
    bridge: { state: mocks.state, reset: mocks.reset, submit: mocks.submit },
    walletSelection: { onClose: mocks.closeWallet },
  }),
}));
vi.mock("~/lib/organisms/CustomPopup/CustomPopup", () => ({
  default: ({ children, isOpen }: { children: ReactNode; isOpen: boolean }) =>
    isOpen ? children : null,
}));
vi.mock("~/lib/atoms/RIcon", () => ({ RIcon: () => null }));
vi.mock("~/lib/atoms/RTypography/RHeading", () => ({
  RHeading: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("./components/BridgeView", () => ({
  BridgeView: ({
    onDeposit,
    onDepositAmountChange,
  }: {
    onDeposit: () => Promise<void>;
    onDepositAmountChange: (value: BigNumber) => void;
  }) => (
    <>
      <button onClick={() => onDepositAmountChange(new BigNumber(1))}>
        Set amount
      </button>
      <RButton onClick={onDeposit}>Deposit Funds</RButton>
    </>
  ),
}));
vi.mock("./components/ReceiveView", () => ({ ReceiveView: () => null }));
vi.mock("~/lib/atoms/Money", () => ({ default: () => null }));
vi.mock("~/lib/molecules/HashChip", () => ({ HashChip: () => null }));

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  mocks.holdDeposit.mockReturnValue(mocks.releaseDeposit);
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

afterEach(() => {
  vi.unstubAllGlobals();
});

async function renderSubmittedModal() {
  const element = document.createElement("div");
  const root = createRoot(element);
  try {
    await act(async () =>
      root.render(<RDepositFundsModal isOpen onClose={vi.fn()} />)
    );
    return element.innerHTML;
  } finally {
    await act(async () => root.unmount());
  }
}

function renderModal() {
  return renderToString(<RDepositFundsModal isOpen onClose={vi.fn()} />);
}

it("shows the submitted screen while a broadcast lock is being tracked", async () => {
  expect(await renderSubmittedModal()).toContain("Transaction Submitted");
});

it.each([
  "The bridge lock transaction reverted.",
  "The transaction was replaced or cancelled in your wallet.",
])("exposes the failure after broadcast: %s", (error) => {
  mocks.state!.error = error;
  const html = renderModal();
  expect(html).toContain(error);
  expect(html).not.toContain("Transaction Submitted");
});

it("exposes confirmation recovery even though a lock hash exists", () => {
  mocks.state!.isConfirmationUnknown = true;
  const html = renderModal();
  expect(html).toContain("Check Confirmation");
  expect(html).not.toContain("Transaction Submitted");
});

it("returns to the submitted screen after successful confirmation recovery", async () => {
  mocks.state!.isConfirmationUnknown = true;
  expect(renderModal()).toContain("Check Confirmation");
  mocks.state!.isConfirmationUnknown = false;
  mocks.state!.progress!.status = "confirmed";
  expect(await renderSubmittedModal()).toContain("Transaction Submitted");
});

it("keeps the submitted screen open when matching events arrive", async () => {
  mocks.transactions.set("operation-1", {
    ...localRecord(),
    sourceHashes: [mocks.state!.progress!.hash!],
    signerEvents: [
      { ...signerEventSequence[0], direction: "in", status: "PENDING" },
    ],
  });
  expect(await renderSubmittedModal()).toContain("Transaction Submitted");
});

it("shows shared event progress in details without closing the popup", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const element = document.createElement("div");
  const root = createRoot(element);
  const onClose = vi.fn();
  const render = () =>
    act(async () =>
      root.render(<RDepositFundsModal isOpen onClose={onClose} />)
    );
  const record: BridgeTransaction = {
    ...localRecord(),
    sourceHashes: [mocks.state!.progress!.hash!],
    isWidgetRequested: true,
    signerEvents: [],
  };
  mocks.transactions.set(record.operationId, record);
  try {
    await render();
    const details = [...element.querySelectorAll("button")].find(
      (button) => button.textContent === "View Details"
    )!;
    await act(async () => details.click());
    expect(element.textContent).not.toContain("Transaction Submitted");
    expect(element.textContent).toContain("Validators Sign");
    expect(element.querySelectorAll("li[data-status=pending]")).toHaveLength(3);
    expect(element.querySelector("li")?.getAttribute("data-status")).toBe(
      "loading"
    );
    for (const [index, payload] of signerEventSequence.entries()) {
      record.signerEvents!.push({
        ...payload,
        direction: "in",
        status: payload.status as "PENDING" | "PROCESSING" | "COMPLETED",
      });
      await render();
      if (index < 5) {
        expect(
          [...element.querySelectorAll("li")].findIndex(
            (step) => step.getAttribute("data-status") === "loading"
          )
        ).toBe(Math.min(index, 3));
      } else {
        expect(
          element.querySelectorAll("li[data-status=success]")
        ).toHaveLength(4);
        expect(element.textContent).toContain("Successfully transferred");
      }
      expect(onClose).not.toHaveBeenCalled();
    }
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});

it.each(["minimize", "close", "external close", "unmount"])(
  "releases only the submitted deposit on %s",
  async (action) => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const element = document.createElement("div");
    const root = createRoot(element);
    const onClose = vi.fn();
    const submitted = mocks.state;
    mocks.state = null;
    mocks.submit.mockImplementation(
      async (_amount, _recipient, onTrackDeposit) => {
        onTrackDeposit("operation-1");
        mocks.state = submitted;
      }
    );
    const render = (isOpen = true) =>
      act(async () =>
        root.render(<RDepositFundsModal isOpen={isOpen} onClose={onClose} />)
      );
    const click = (label: string) =>
      act(async () => {
        [...element.querySelectorAll("button")]
          .find(
            (button) =>
              button.textContent === label ||
              button.getAttribute("aria-label") === label
          )!
          .click();
      });
    let isUnmounted = false;
    try {
      await render();
      await click("Set amount");
      await click("Deposit Funds");
      await render();
      expect(mocks.holdDeposit).toHaveBeenCalledOnce();
      expect(mocks.holdDeposit).toHaveBeenCalledWith("operation-1");
      expect(mocks.releaseDeposit).not.toHaveBeenCalled();
      expect(element.textContent).toContain("Transaction Submitted");
      if (action === "minimize") await click("Minimize And Continue Browsing");
      if (action === "close") await click("Close deposit funds");
      if (action === "external close") await render(false);
      if (action === "unmount") {
        await act(async () => root.unmount());
        isUnmounted = true;
      }
      expect(mocks.releaseDeposit).toHaveBeenCalledOnce();
    } finally {
      if (!isUnmounted) await act(async () => root.unmount());
      vi.unstubAllGlobals();
    }
  }
);

it.each([
  undefined,
  { step: "approve", status: "signature" },
  { step: "approve", status: "confirming", hash: "0xapproval" },
  { step: "approve", status: "confirmed", hash: "0xapproval" },
  { step: "lock", status: "signature" },
] as const)(
  "keeps the deposit form mounted before lock submission: %j",
  (progress) => {
    mocks.state!.progress = progress;
    mocks.state!.isBusy = true;
    const html = renderModal();
    expect(html).toContain("Set amount");
    expect(html).not.toContain("Bridging from Ethereum");
    expect(html).not.toContain("Transaction Submitted");
  }
);

it("switches directly from the deposit form to success when the lock hash arrives", async () => {
  const element = document.createElement("div");
  const root = createRoot(element);
  const submittedProgress = mocks.state!.progress;
  mocks.state!.progress = { step: "lock", status: "signature" };
  mocks.state!.isBusy = true;
  const render = () =>
    act(async () =>
      root.render(<RDepositFundsModal isOpen onClose={vi.fn()} />)
    );
  try {
    await render();
    expect(element.textContent).toContain("Set amount");
    expect(element.textContent).not.toContain("Bridging from Ethereum");
    mocks.state!.progress = submittedProgress;
    await render();
    expect(element.textContent).toContain("Transaction Submitted");
    expect(element.textContent).not.toContain("Set amount");
    expect(element.textContent).not.toContain("Bridging from Ethereum");
  } finally {
    await act(async () => root.unmount());
  }
});

it("keeps the clicked deposit button loading through initial submission", async () => {
  const element = document.createElement("div");
  const root = createRoot(element);
  const submitted = mocks.state;
  mocks.state = null;
  let finishSubmission!: () => void;
  const submission = new Promise<void>((resolve) => {
    finishSubmission = resolve;
  });
  mocks.submit.mockImplementation(() => {
    mocks.state = { ...submitted!, progress: undefined, isBusy: true };
    return submission;
  });
  const render = () =>
    act(async () =>
      root.render(<RDepositFundsModal isOpen onClose={vi.fn()} />)
    );
  try {
    await render();
    await act(async () => {
      [...element.querySelectorAll("button")]
        .find((button) => button.textContent === "Set amount")!
        .click();
    });
    const button = [...element.querySelectorAll("button")].find(
      (button) => button.textContent === "Deposit Funds"
    )!;
    await act(async () => button.click());
    await render();
    expect(element.contains(button)).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.disabled).toBe(true);
    expect(element.textContent).not.toContain("Bridging from Ethereum");
    mocks.state = submitted;
    await render();
    expect(element.textContent).toContain("Transaction Submitted");
  } finally {
    await act(async () => finishSubmission());
    await act(async () => root.unmount());
  }
});
