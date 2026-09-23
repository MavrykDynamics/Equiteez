import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { BigNumber } from "bignumber.js";
import { beforeEach, expect, it, vi } from "vitest";
import {
  BridgeConfirmationError,
  executeUsdtBridge,
} from "~/contracts/usdtBridge.contract";
import {
  BridgeTransactions,
  bridgeNetwork,
} from "~/providers/TransactionsProvider/bridgeTransactions";
import {
  hash,
  replacementHash,
} from "~/providers/TransactionsProvider/bridgeTransactions.fixtures";
import { useUsdtBridge } from "./useUsdtBridge";

const mocks = vi.hoisted(() => ({
  setState: vi.fn(),
  execute: vi.fn(),
  publish: vi.fn(),
  session: {},
  account: "recipient",
  refs: [] as Array<{ current: unknown }>,
  refIndex: 0,
}));
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useState: () => [null, mocks.setState],
  useRef: (initial: unknown) => {
    const index = mocks.refIndex++;
    return mocks.refs[index] ?? (mocks.refs[index] = { current: initial });
  },
}));
vi.mock("~/providers/TransactionsProvider/TransactionsProvider", () => ({
  useTransactionsContext: () => ({
    account: mocks.account,
    session: mocks.session,
    publish: mocks.publish,
  }),
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
  mocks.refIndex = 0;
  renderToString(createElement(Harness));
  return bridge;
}
let memory: Map<string, string>;
let store: BridgeTransactions;
beforeEach(() => {
  vi.resetAllMocks();
  memory = new Map();
  mocks.refs = [];
  mocks.account = "recipient";
  mocks.session = {};
  store = new BridgeTransactions("recipient", bridgeNetwork, () => ({
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => {
      memory.set(key, value);
    },
  }));
  mocks.publish.mockImplementation((record) => store.update(record));
});

it("keeps broadcast progress after modal dismissal and serializes active wallet execution", async () => {
  let complete!: () => void;
  mocks.execute.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        complete = resolve;
      })
  );
  const bridge = setup();
  const operation = bridge.submit(new BigNumber(1), "recipient");
  const callbacks = mocks.execute.mock.calls[0][0] as Parameters<
    typeof executeUsdtBridge
  >[0];
  callbacks.onProgress({ step: "lock", status: "confirming", hash });
  expect(memory.size).toBe(1); // No widget render/effect is necessary to persist.
  bridge.reset();
  expect(mocks.setState).toHaveBeenLastCalledWith(null);
  await bridge.submit(new BigNumber(2), "recipient");
  expect(mocks.execute).toHaveBeenCalledTimes(1);
  const updates = mocks.setState.mock.calls.length;
  callbacks.onProgress({
    step: "lock",
    status: "confirmed",
    hash: replacementHash,
  });
  await expect(callbacks.assertWallets()).rejects.toThrow(
    "The deposit flow was closed."
  );
  complete();
  await operation;
  expect(mocks.setState).toHaveBeenCalledTimes(updates);
  expect(
    [...store.getSnapshot().transactions.values()][0].sourceHashes
  ).toEqual([hash, replacementHash]);
});

it("retains a hash returned after modal dismissal while ignoring late modal updates", async () => {
  let complete!: () => void;
  mocks.execute.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        complete = resolve;
      })
  );
  const bridge = setup();
  const operation = bridge.submit(new BigNumber(1), "recipient");
  bridge.reset();
  const updates = mocks.setState.mock.calls.length;
  mocks.execute.mock.calls[0][0].onProgress({
    step: "lock",
    status: "confirming",
    hash,
  });
  expect(memory.size).toBe(1);
  complete();
  await operation;
  expect(mocks.setState).toHaveBeenCalledTimes(updates);
});

it("keeps multiple settling deposits when a second signing flow starts", async () => {
  mocks.execute
    .mockImplementationOnce(async ({ onProgress }) =>
      onProgress({ step: "lock", status: "confirmed", hash })
    )
    .mockImplementationOnce(async ({ onProgress }) =>
      onProgress({ step: "lock", status: "confirmed", hash: replacementHash })
    );
  const bridge = setup();
  await bridge.submit(new BigNumber(1), "recipient");
  bridge.reset();
  await bridge.submit(new BigNumber(2), "recipient");
  expect(store.getSnapshot().transactions.size).toBe(2);
  expect(
    [...store.getSnapshot().transactions.values()].every(
      (record) => record.settlement === "unknown"
    )
  ).toBe(true);
});

it("retains uncertain broadcast state across reset and reload without resubmission", async () => {
  mocks.execute.mockImplementation(async ({ onProgress }) => {
    onProgress({ step: "lock", status: "confirming", hash });
    throw new BridgeConfirmationError();
  });
  const bridge = setup();
  await bridge.submit(new BigNumber(1), "recipient");
  expect(mocks.setState).toHaveBeenLastCalledWith(
    expect.objectContaining({ isConfirmationUnknown: true })
  );
  bridge.reset();
  const restored = new BridgeTransactions("recipient", bridgeNetwork, () => ({
    getItem: (key) => memory.get(key) ?? null,
    setItem: () => {},
  }));
  restored.restore();
  setup();
  expect(
    [...restored.getSnapshot().transactions.values()][0].verification
  ).toBe("unverified");
  expect(mocks.execute).toHaveBeenCalledTimes(1);
});

it("rejects late source progress after account switching, including switching back", async () => {
  let complete!: () => void;
  mocks.execute.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        complete = resolve;
      })
  );
  const bridge = setup();
  const operation = bridge.submit(new BigNumber(1), "recipient");
  const callbacks = mocks.execute.mock.calls[0][0] as Parameters<
    typeof executeUsdtBridge
  >[0];
  callbacks.onProgress({ step: "lock", status: "confirming", hash });
  mocks.account = "other-recipient";
  mocks.session = {};
  setup();
  mocks.account = "recipient";
  mocks.session = {};
  setup();
  const publications = mocks.publish.mock.calls.length;
  callbacks.onProgress({
    step: "lock",
    status: "confirmed",
    hash: replacementHash,
  });
  await expect(callbacks.assertWallets()).rejects.toThrow(
    "The deposit flow was closed."
  );
  complete();
  await operation;
  expect(mocks.publish).toHaveBeenCalledTimes(publications);
});
