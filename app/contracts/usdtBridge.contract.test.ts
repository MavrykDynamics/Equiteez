import { beforeEach, describe, expect, it, vi } from "vitest";
import { BigNumber } from "bignumber.js";
import { encodeFunctionData, hexToString, type Address, type Hash } from "viem";
import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";

import { USDT_BRIDGE } from "~/consts/usdtBridge";
import {
  BridgeConfirmationError,
  buildUsdtWrapCall,
  confirmUsdtBridgeTransaction,
  executeUsdtBridge,
  getUsdtBridgeAmountError,
  type UsdtBridgeProgress,
} from "./usdtBridge.contract";

const actions = vi.hoisted(() => ({
  readContract: vi.fn(),
  simulateContract: vi.fn(),
  writeContract: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
}));
vi.mock("wagmi/actions", () => actions);

const config = createConfig({
  chains: [sepolia],
  transports: { [sepolia.id]: http() },
});
const account: Address = "0x1111111111111111111111111111111111111111";
const recipient = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
const hash: Hash = `0x${"1".repeat(64)}`;
const amount = new BigNumber("1.234567");
const rawAmount = 1234567000000000000n;
const assertWallets = vi.fn(async () => {});
const progress = vi.fn<(progress: UsdtBridgeProgress) => void>();

function mockBalances(balance: bigint, allowance: bigint, decimals = 18) {
  actions.readContract.mockImplementation(
    async (_config: unknown, { functionName }: { functionName: string }) => {
      if (functionName === "balanceOf") return balance;
      if (functionName === "allowance") return allowance;
      if (functionName === "decimals") return decimals;
      throw new Error(`Unexpected read: ${functionName}`);
    }
  );
}

function execute() {
  return executeUsdtBridge({
    config,
    account,
    amount,
    recipient,
    assertWallets,
    onProgress: progress,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mockBalances(rawAmount * 10n, 0n);
  actions.simulateContract.mockImplementation(
    async (_config: unknown, request: unknown) => ({ request, result: true })
  );
  actions.writeContract.mockResolvedValue(hash);
  actions.waitForTransactionReceipt.mockResolvedValue({
    status: "success",
    transactionHash: hash,
  });
});

describe("USDT bridge amount and deployed call", () => {
  it("encodes the deployed selector, exact 18-decimal amount, and UTF-8 Mavryk recipient", () => {
    const call = buildUsdtWrapCall(amount, ` ${recipient} `);
    expect(call.address).toBe("0x476a30d098eD197c2b109abaBbf5135D49df0967");
    expect(call.args[0]).toBe("0x0111c65c13b3ee07662340692cba957b29572f27");
    expect(call.args[1]).toBe(rawAmount);
    expect(hexToString(call.args[2])).toBe(recipient);
    expect(encodeFunctionData(call).slice(0, 10)).toBe("0xeb093ee8");
  });

  it("preserves large amounts and the smallest Mavryk-representable amount", () => {
    expect(
      buildUsdtWrapCall(new BigNumber("9999999999999.123456"), recipient)
        .args[1]
    ).toBe(9999999999999123456000000000000n);
    expect(
      buildUsdtWrapCall(new BigNumber("0.000001"), recipient).args[1]
    ).toBe(1000000000000n);
  });

  it.each([
    undefined,
    "0",
    "-1",
    "NaN",
    "Infinity",
    "0.0000001",
    "1.2345678",
    "1e80",
  ])("rejects unrepresentable amount %s", (value) => {
    expect(
      getUsdtBridgeAmountError(
        value === undefined ? undefined : new BigNumber(value)
      )
    ).not.toBeNull();
  });

  it.each([
    "",
    account,
    "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWx",
    USDT_BRIDGE.destinationToken.address,
  ])("rejects invalid wallet recipient %s", (destination) => {
    expect(() => buildUsdtWrapCall(amount, destination)).toThrow(
      "valid Mavryk wallet"
    );
  });
});

describe("USDT approval and lock execution", () => {
  it("confirms exact approval before locking, and never sends native currency", async () => {
    await execute();
    const requests = actions.writeContract.mock.calls.map(
      ([, request]) => request
    );
    expect(requests.map((request) => request.functionName)).toEqual([
      "approve",
      "wrapToken",
    ]);
    expect(requests[0].args).toEqual([USDT_BRIDGE.address, rawAmount]);
    expect(requests[1].args).toEqual(buildUsdtWrapCall(amount, recipient).args);
    expect(
      requests.every(
        (request) =>
          request.value === undefined &&
          request.chainId === sepolia.id &&
          request.account === account
      )
    ).toBe(true);
    expect(
      actions.waitForTransactionReceipt.mock.invocationCallOrder[0]
    ).toBeLessThan(actions.writeContract.mock.invocationCallOrder[1]);
    expect(progress).toHaveBeenLastCalledWith({
      step: "lock",
      status: "confirmed",
      hash,
    });
  });

  it("reuses sufficient allowance", async () => {
    mockBalances(rawAmount, rawAmount);
    await execute();
    expect(actions.writeContract).toHaveBeenCalledTimes(1);
    expect(actions.writeContract.mock.calls[0][1].functionName).toBe(
      "wrapToken"
    );
  });

  it("resets insufficient nonzero allowance before exact USDT approval", async () => {
    mockBalances(rawAmount, 1n);
    await execute();
    expect(
      actions.writeContract.mock.calls.map(([, request]) => request.args[1])
    ).toEqual([0n, rawAmount, rawAmount]);
    expect(actions.waitForTransactionReceipt).toHaveBeenCalledTimes(3);
  });

  it("stops on a reverted approval", async () => {
    actions.waitForTransactionReceipt.mockResolvedValueOnce({
      status: "reverted",
      transactionHash: hash,
    });
    await expect(execute()).rejects.toThrow("approval reverted");
    expect(actions.writeContract).toHaveBeenCalledTimes(1);
  });

  it("does not report a reverted lock as submitted", async () => {
    mockBalances(rawAmount, rawAmount);
    actions.waitForTransactionReceipt.mockResolvedValueOnce({
      status: "reverted",
      transactionHash: hash,
    });
    await expect(execute()).rejects.toThrow("lock transaction reverted");
    expect(progress).not.toHaveBeenCalledWith(
      expect.objectContaining({ status: "confirmed" })
    );
  });

  it("stops when the wallet changes after simulation", async () => {
    mockBalances(rawAmount, rawAmount);
    assertWallets
      .mockResolvedValueOnce()
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error("Wrong network"));
    await expect(execute()).rejects.toThrow("Wrong network");
    expect(actions.writeContract).not.toHaveBeenCalled();
  });

  it("does not lock after the user declines approval", async () => {
    actions.writeContract.mockRejectedValueOnce(new Error("User rejected"));
    await expect(execute()).rejects.toThrow("User rejected");
    expect(actions.writeContract).toHaveBeenCalledTimes(1);
    expect(actions.waitForTransactionReceipt).not.toHaveBeenCalled();
  });

  it("checks the live balance and decimals before signing", async () => {
    mockBalances(rawAmount - 1n, 0n);
    await expect(execute()).rejects.toThrow("Insufficient USDT balance");
    mockBalances(rawAmount, 0n, 6);
    await expect(execute()).rejects.toThrow("decimals do not match");
    expect(actions.writeContract).not.toHaveBeenCalled();
  });

  it("rejects a token or bridge returning false", async () => {
    actions.simulateContract.mockResolvedValueOnce({ result: false });
    await expect(execute()).rejects.toThrow("refused USDT approval");
    expect(actions.writeContract).not.toHaveBeenCalled();
  });
});

describe("receipt recovery", () => {
  const pending = { step: "lock", status: "confirming", hash } as const;

  it("retains an unknown confirmation for checking instead of resending", async () => {
    actions.waitForTransactionReceipt.mockRejectedValueOnce(
      new Error("RPC timeout")
    );
    await expect(
      confirmUsdtBridgeTransaction(config, pending, progress)
    ).rejects.toBeInstanceOf(BridgeConfirmationError);
    await confirmUsdtBridgeTransaction(config, pending, progress);
    expect(actions.writeContract).not.toHaveBeenCalled();
    expect(progress).toHaveBeenLastCalledWith({
      ...pending,
      status: "confirmed",
    });
  });

  it.each(["cancelled", "replaced"])(
    "does not treat a %s transaction as a successful lock",
    async (reason) => {
      actions.waitForTransactionReceipt.mockImplementationOnce(
        async (
          _config: unknown,
          { onReplaced }: { onReplaced: (value: unknown) => void }
        ) => {
          const receipt = { status: "success", transactionHash: hash };
          onReplaced({ reason, transactionReceipt: receipt });
          return receipt;
        }
      );
      await expect(
        confirmUsdtBridgeTransaction(config, pending, progress)
      ).rejects.toThrow("replaced or cancelled");
      expect(progress).not.toHaveBeenCalledWith(
        expect.objectContaining({ status: "confirmed" })
      );
    }
  );
});
