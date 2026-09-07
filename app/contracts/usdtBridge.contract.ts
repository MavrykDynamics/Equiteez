import { BigNumber } from "bignumber.js";
import {
  erc20Abi,
  maxUint256,
  parseUnits,
  stringToHex,
  type Address,
  type Hash,
} from "viem";
import type { Config } from "wagmi";
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";

import { USDT_BRIDGE } from "~/consts/usdtBridge";
import { isAddressValid } from "~/lib/utils/helpers";

// Only the deployed wrap entrypoint is needed for Ethereum -> Mavryk.
export const USDT_WRAP_ABI = [
  {
    type: "function",
    name: "wrapToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "destinationMavAddress", type: "bytes" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
] as const;

export type UsdtBridgeProgress = {
  step: "approve" | "lock";
  status: "signature" | "confirming" | "confirmed";
  hash?: Hash;
};

export class BridgeConfirmationError extends Error {
  constructor() {
    super(
      "Confirmation is unavailable. Check the transaction before starting another deposit."
    );
  }
}

export function getUsdtBridgeAmountError(amount: BigNumber | undefined) {
  if (!amount?.isFinite() || !amount.isPositive() || amount.isZero())
    return "Enter an amount greater than zero.";
  // Both sides must represent the same amount without rounding away funds.
  if (amount.decimalPlaces()! > USDT_BRIDGE.destinationToken.decimals)
    return "Use up to 6 decimal places for USDT received on Mavryk.";
  if (
    amount.shiftedBy(USDT_BRIDGE.sourceToken.decimals).gt(maxUint256.toString())
  )
    return "The amount is too large.";
  return null;
}

export function buildUsdtWrapCall(amount: BigNumber, recipient: string) {
  const error = getUsdtBridgeAmountError(amount);
  if (error) throw new Error(error);
  const destination = recipient.trim();
  if (!/^mv[1-3]/.test(destination) || !isAddressValid(destination))
    throw new Error("Connect a valid Mavryk wallet.");

  return {
    address: USDT_BRIDGE.address,
    abi: USDT_WRAP_ABI,
    functionName: "wrapToken",
    args: [
      USDT_BRIDGE.sourceToken.address.toLowerCase() as Address,
      parseUnits(amount.toFixed(), USDT_BRIDGE.sourceToken.decimals),
      stringToHex(destination),
    ],
  } as const;
}

export async function confirmUsdtBridgeTransaction(
  config: Config,
  progress: UsdtBridgeProgress,
  onProgress: (progress: UsdtBridgeProgress) => void
) {
  if (!progress.hash) throw new Error("Missing bridge transaction hash.");
  let wasCancelled = false;
  let hash = progress.hash;
  let receipt;
  try {
    receipt = await waitForTransactionReceipt(config, {
      chainId: USDT_BRIDGE.chainId,
      hash,
      timeout: 120_000,
      onReplaced: (replacement) => {
        wasCancelled = replacement.reason !== "repriced";
        hash = replacement.transactionReceipt.transactionHash;
        onProgress({ ...progress, hash });
      },
    });
  } catch {
    if (wasCancelled)
      throw new Error(
        "The transaction was replaced or cancelled in your wallet."
      );
    throw new BridgeConfirmationError();
  }
  if (wasCancelled)
    throw new Error(
      "The transaction was replaced or cancelled in your wallet."
    );
  if (receipt.status !== "success")
    throw new Error(
      progress.step === "approve"
        ? "USDT approval reverted."
        : "The bridge lock transaction reverted."
    );
  onProgress({ ...progress, hash, status: "confirmed" });
}

export async function executeUsdtBridge({
  config,
  account,
  amount,
  recipient,
  assertWallets,
  onProgress,
}: {
  config: Config;
  account: Address;
  amount: BigNumber;
  recipient: string;
  assertWallets: () => Promise<void>;
  onProgress: (progress: UsdtBridgeProgress) => void;
}) {
  const wrapCall = buildUsdtWrapCall(amount, recipient);
  const rawAmount = wrapCall.args[1];
  const token = {
    address: USDT_BRIDGE.sourceToken.address,
    abi: erc20Abi,
    chainId: USDT_BRIDGE.chainId,
  } as const;
  await assertWallets();
  const [balance, allowance, decimals] = await Promise.all([
    readContract(config, {
      ...token,
      functionName: "balanceOf",
      args: [account],
    }),
    readContract(config, {
      ...token,
      functionName: "allowance",
      args: [account, USDT_BRIDGE.address],
    }),
    readContract(config, { ...token, functionName: "decimals" }),
  ]);
  if (decimals !== USDT_BRIDGE.sourceToken.decimals)
    throw new Error("USDT decimals do not match the bridge configuration.");
  if (balance < rawAmount) throw new Error("Insufficient USDT balance.");

  const approve = async (value: bigint) => {
    onProgress({ step: "approve", status: "signature" });
    await assertWallets();
    const { request, result } = await simulateContract(config, {
      ...token,
      account,
      functionName: "approve",
      args: [USDT_BRIDGE.address, value],
    });
    if (!result) throw new Error("The token refused USDT approval.");
    await assertWallets();
    const hash = await writeContract(config, request);
    const progress = { step: "approve", status: "confirming", hash } as const;
    onProgress(progress);
    await confirmUsdtBridgeTransaction(config, progress, onProgress);
  };

  if (allowance < rawAmount) {
    // USDT deployments may require a nonzero allowance to be reset first.
    if (allowance > 0n) await approve(0n);
    await approve(rawAmount);
  }

  onProgress({ step: "lock", status: "signature" });
  await assertWallets();
  const { request, result } = await simulateContract(config, {
    ...wrapCall,
    chainId: USDT_BRIDGE.chainId,
    account,
  });
  if (!result) throw new Error("The bridge refused the USDT lock request.");
  await assertWallets();
  const hash = await writeContract(config, request);
  const progress = { step: "lock", status: "confirming", hash } as const;
  onProgress(progress);
  await confirmUsdtBridgeTransaction(config, progress, onProgress);
}
