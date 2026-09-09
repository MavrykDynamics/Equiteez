import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { BigNumber } from "bignumber.js";
import { beforeEach, expect, it, vi } from "vitest";

import {
  BridgeConfirmationError,
  executeUsdtBridge,
} from "~/contracts/usdtBridge.contract";
import { useUsdtBridge } from "./useUsdtBridge";

const mocks = vi.hoisted(() => ({ setState: vi.fn(), execute: vi.fn() }));
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useState: () => [null, mocks.setState],
}));
vi.mock("wagmi", () => ({ useConfig: () => ({}) }));
vi.mock("wagmi/actions", () => ({
  getAccount: () => ({ address: "0x1111111111111111111111111111111111111111" }),
}));
vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({}),
}));
vi.mock("~/contracts/usdtBridge.contract", () => ({
  executeUsdtBridge: mocks.execute,
  confirmUsdtBridgeTransaction: vi.fn(),
  BridgeConfirmationError: class extends Error {},
}));

function setup() {
  let bridge!: ReturnType<typeof useUsdtBridge>;
  function Harness() {
    bridge = useUsdtBridge(vi.fn(async () => {}));
    return null;
  }
  renderToString(createElement(Harness));
  return bridge;
}

beforeEach(() => vi.resetAllMocks());

it("resets a busy flow and ignores its late progress and completion after a new deposit starts", async () => {
  let completeOld!: () => void;
  let completeNew!: () => void;
  mocks.execute
    .mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          completeOld = resolve;
        })
    )
    .mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          completeNew = resolve;
        })
    );
  const bridge = setup();
  const oldDeposit = bridge.submit(new BigNumber(1), "recipient");
  const oldCallbacks = mocks.execute.mock.calls[0][0] as Parameters<
    typeof executeUsdtBridge
  >[0];
  bridge.reset();
  expect(mocks.setState).toHaveBeenLastCalledWith(null);
  const newDeposit = bridge.submit(new BigNumber(2), "recipient");
  const updates = mocks.setState.mock.calls.length;
  oldCallbacks.onProgress({ step: "lock", status: "confirmed" });
  await expect(oldCallbacks.assertWallets()).rejects.toThrow(
    "The deposit flow was closed."
  );
  completeOld();
  await oldDeposit;
  expect(mocks.setState).toHaveBeenCalledTimes(updates);
  completeNew();
  await newDeposit;
  expect(mocks.setState).toHaveBeenLastCalledWith(
    expect.objectContaining({ amount: "2", isBusy: false })
  );
});

it("clears unknown confirmation and errors so a new flow can start", async () => {
  mocks.execute.mockRejectedValueOnce(new BridgeConfirmationError());
  const bridge = setup();
  await bridge.submit(new BigNumber(1), "recipient");
  expect(mocks.setState).toHaveBeenLastCalledWith(
    expect.objectContaining({ isConfirmationUnknown: true })
  );
  bridge.reset();
  expect(mocks.setState).toHaveBeenLastCalledWith(null);
  await bridge.submit(new BigNumber(2), "recipient");
  expect(mocks.execute).toHaveBeenCalledTimes(2);
  expect(mocks.setState).toHaveBeenLastCalledWith(
    expect.objectContaining({
      amount: "2",
      error: null,
      isConfirmationUnknown: false,
    })
  );
});
