// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MavrykChainId } from "~/lib/mavryk/types";

const mocks = vi.hoisted(() => ({
  identity: null as { provider: string; chainId: string } | null,
  bug: vi.fn(),
  toolkit: { kind: "toolkit" },
}));

vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({
    getIdentity: () => mocks.identity,
    getToolkit: () => mocks.toolkit,
    identity: mocks.identity,
    directExecution: undefined,
  }),
}));
vi.mock("~/providers/WalletProvider/dynamic/dynamic.config", () => ({
  isDynamicDirectEnabled: () => false,
}));
vi.mock("~/providers/PopupProvider/popup.provider", () => ({
  usePopupContext: () => ({
    showPopup: vi.fn(),
    hidePopup: vi.fn(),
    popupKeys: {},
  }),
}));
vi.mock("~/providers/PopupProvider/consts", () => ({ txTemplates: {} }));
vi.mock("~/providers/ToasterProvider/toaster.provider", () => ({
  useToasterContext: () => ({
    success: vi.fn(),
    bug: mocks.bug,
    loading: vi.fn(),
    warning: vi.fn(),
    hideToasterMessage: vi.fn(),
  }),
}));
vi.mock("~/lib/utils/sleep", () => ({ sleep: async () => undefined }));

import { useContractAction } from "./useContractAction";

let root: Root;
let invoke: () => Promise<void>;
const actionFn = vi.fn(async () => undefined);
const ARGS = { orderId: "1" };

function Probe() {
  ({ invokeAction: invoke } = useContractAction(
    actionFn,
    ARGS,
    undefined,
    undefined,
    { action: "orderbook.cancel" }
  ));
  return null;
}

beforeEach(async () => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  root = createRoot(document.createElement("div"));
  await act(async () => root.render(<Probe />));
});

afterEach(() => {
  act(() => root.unmount());
});

describe("useContractAction capability guard", () => {
  it("does not reach the wallet for an action the email wallet may not run", async () => {
    mocks.identity = { provider: "dynamic", chainId: MavrykChainId.Basenet };

    await act(() => invoke());

    expect(actionFn).not.toHaveBeenCalled();
    expect(mocks.bug).toHaveBeenCalledWith(
      "Not available for email wallets yet."
    );
  });

  it("runs the action for Mavryk Wallet as before", async () => {
    mocks.identity = {
      provider: "mavryk_extension",
      chainId: MavrykChainId.Basenet,
    };

    await act(() => invoke());

    expect(actionFn).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: "1", tezos: mocks.toolkit })
    );
    expect(mocks.bug).not.toHaveBeenCalled();
  });
});
