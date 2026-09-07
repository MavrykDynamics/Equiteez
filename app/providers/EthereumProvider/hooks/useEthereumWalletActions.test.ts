import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

import { useEthereumWalletActions } from "./useEthereumWalletActions";

const mocks = vi.hoisted(() => ({
  setState: vi.fn(),
  switchChainAsync: vi.fn(),
}));
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useState: () => [null, mocks.setState],
}));
vi.mock("wagmi", () => ({
  useConnect: () => ({ connectAsync: vi.fn() }),
  useDisconnect: () => ({ disconnectAsync: vi.fn() }),
  useSwitchChain: () => ({ switchChainAsync: mocks.switchChainAsync }),
}));
vi.mock("../ethereum.config", () => ({ ETHEREUM_CHAIN: { id: 11155111 } }));
vi.mock("../helpers/ethereumErrors", () => ({
  getEthereumErrorMessage: (error: Error) => error.message,
}));

function setup() {
  let actions!: ReturnType<typeof useEthereumWalletActions>;
  function Harness() {
    actions = useEthereumWalletActions(true, undefined, 1);
    return null;
  }
  renderToString(createElement(Harness));
  return actions;
}

beforeEach(() => vi.resetAllMocks());

it("clears wallet selection, loading and errors on close", async () => {
  mocks.switchChainAsync.mockRejectedValueOnce(new Error("Switch declined"));
  const actions = setup();
  await actions.switchNetwork();
  expect(mocks.setState).toHaveBeenCalledWith("Switch declined");
  mocks.setState.mockClear();
  actions.handleClose();
  expect(mocks.setState.mock.calls).toEqual([[false], [false], [null]]);
});

it("ignores late wallet errors after close and releases the pending action guard", async () => {
  let rejectSwitch!: (error: Error) => void;
  mocks.switchChainAsync.mockImplementationOnce(
    () =>
      new Promise<void>((_, reject) => {
        rejectSwitch = reject;
      })
  );
  const actions = setup();
  const pending = actions.switchNetwork();
  actions.handleClose();
  mocks.setState.mockClear();
  rejectSwitch(new Error("Late rejection"));
  await pending;
  expect(mocks.setState).not.toHaveBeenCalled();
  await actions.switchNetwork();
  expect(mocks.switchChainAsync).toHaveBeenCalledTimes(2);
});
