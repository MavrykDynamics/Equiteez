// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IntentsPickerKind } from "./components/IntentsPickerView";
import type { IntentsFormStep } from "./components/IntentsView";
import { RDepositFundsModal } from "./RDepositFundsModal";

const mocks = vi.hoisted(() => ({
  holdDeposit: vi.fn(),
  releaseDeposit: vi.fn(),
  closeWallet: vi.fn(),
  resetIntents: vi.fn(),
  cancelReview: vi.fn(),
  resumeIntent: vi.fn(() => false),
  intentsReview: { phase: "form" } as { phase: string; localId?: string },
}));

vi.mock("~/hooks/useIntentsDeposit", () => ({
  useIntentsDeposit: () => ({
    resetForm: mocks.resetIntents,
    review: mocks.intentsReview,
    resumeActive: mocks.resumeIntent,
    activeRecord: mocks.intentsReview.phase === "tracking" ? {} : undefined,
    hasFundingStarted: mocks.intentsReview.phase === "tracking",
    cancelReview: mocks.cancelReview,
  }),
}));
vi.mock("./components/IntentsView", () => ({
  IntentsView: ({
    step,
    onStepChange,
    onOpenPicker,
  }: {
    step: IntentsFormStep;
    onStepChange: (step: IntentsFormStep) => void;
    onOpenPicker: (kind: IntentsPickerKind) => void;
  }) => (
    <>
      <p>Intents {step}</p>
      <button onClick={() => onStepChange("details")}>Continue</button>
      <button onClick={() => onOpenPicker("network")}>Open network</button>
    </>
  ),
}));
vi.mock("./components/IntentsPickerView", () => ({
  IntentsPickerView: ({
    kind,
    onDone,
  }: {
    kind: IntentsPickerKind;
    onDone: () => void;
  }) => <button onClick={onDone}>Picker {kind}</button>,
}));
vi.mock("./components/IntentsQuoteView", () => ({
  IntentsQuoteView: () => <p>Intents review</p>,
}));
vi.mock("./components/IntentsStatusView", () => ({
  IntentsStatusView: () => <p>Intents status</p>,
}));
vi.mock("./components/ReceiveView", () => ({
  ReceiveView: () => <p>Receive view</p>,
}));
vi.mock("~/providers/TransactionsProvider/TransactionWidgetProvider", () => ({
  useTransactionWidget: () => ({ holdDeposit: mocks.holdDeposit }),
}));
vi.mock("wagmi", () => ({
  useAccount: () => ({ connector: undefined }),
  useConfig: () => ({ chains: [] }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({}),
}));
vi.mock("~/providers/EthereumProvider/ethereum.provider", () => ({
  useEthereumContext: () => ({
    userAddress: null,
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

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  mocks.holdDeposit.mockReturnValue(mocks.releaseDeposit);
  mocks.intentsReview = { phase: "form" };
  mocks.resumeIntent.mockReturnValue(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function renderModal() {
  const element = document.createElement("div");
  const root = createRoot(element);
  const onClose = vi.fn();
  const render = (isOpen = true) =>
    act(async () =>
      root.render(<RDepositFundsModal isOpen={isOpen} onClose={onClose} />)
    );
  const button = (label: string) =>
    [...element.querySelectorAll("button")].find(
      (item) =>
        item.textContent === label || item.getAttribute("aria-label") === label
    ) as HTMLButtonElement | undefined;
  await render();
  return { element, root, render, button, onClose };
}

describe("RDepositFundsModal", () => {
  it("offers Send From Any Network and Receive On Mavryk only", async () => {
    const { element, root, button } = await renderModal();
    try {
      const tabs = [...element.querySelectorAll("[role=tab]")].map(
        (tab) => tab.textContent
      );
      expect(tabs).toEqual(["Send From Any Network", "Receive On Mavryk"]);
      expect(
        button("Send From Any Network")!.getAttribute("aria-selected")
      ).toBe("true");
      expect(element.textContent).toContain("Intents wallets");
      expect(element.textContent).not.toContain("Bridge From Ethereum");

      await act(async () => button("Receive On Mavryk")!.click());
      expect(element.textContent).toContain("Receive view");
    } finally {
      await act(async () => root.unmount());
    }
  });

  it("goes from wallets to details and back with the header arrow", async () => {
    const { element, root, button } = await renderModal();
    try {
      expect(button("Back")).toBeUndefined();
      await act(async () => button("Continue")!.click());
      expect(element.textContent).toContain("Intents details");
      await act(async () => button("Back")!.click());
      expect(element.textContent).toContain("Intents wallets");
    } finally {
      await act(async () => root.unmount());
    }
  });

  it("shows a picker in place of the form and returns from it", async () => {
    const { element, root, button } = await renderModal();
    try {
      await act(async () => button("Open network")!.click());
      expect(element.textContent).toContain("Picker network");
      expect(element.querySelector("[role=tablist]")).toBeNull();
      await act(async () => button("Picker network")!.click());
      expect(element.querySelector("[role=tablist]")).not.toBeNull();
    } finally {
      await act(async () => root.unmount());
    }
  });

  it("shows the review screen while a request is reviewed", async () => {
    mocks.intentsReview = { phase: "review", localId: "local-1" };
    const { element, root } = await renderModal();
    try {
      expect(element.textContent).toContain("Intents review");
      expect(element.querySelector("[role=tablist]")).toBeNull();
    } finally {
      await act(async () => root.unmount());
    }
  });

  it("resets the flow when closed and reopens on the first step", async () => {
    const { element, root, render, button, onClose } = await renderModal();
    try {
      await act(async () => button("Continue")!.click());
      await act(async () => button("Close deposit funds")!.click());
      expect(onClose).toHaveBeenCalled();
      expect(mocks.resetIntents).toHaveBeenCalled();
      expect(mocks.closeWallet).toHaveBeenCalled();
      await render(false);
      await render(true);
      expect(element.textContent).toContain("Intents wallets");
    } finally {
      await act(async () => root.unmount());
    }
  });

  it("reopens on the active operation and holds its widget card", async () => {
    mocks.resumeIntent.mockImplementation(() => {
      mocks.intentsReview = { phase: "tracking", localId: "local-1" };
      return true;
    });
    const { element, root, render } = await renderModal();
    try {
      await render();
      expect(element.textContent).toContain("Intents status");
      expect(mocks.holdDeposit).toHaveBeenCalledWith("intent:local-1");
      await render(false);
      expect(mocks.releaseDeposit).toHaveBeenCalled();
    } finally {
      await act(async () => root.unmount());
    }
  });
});
