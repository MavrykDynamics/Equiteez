import { BigNumber } from "bignumber.js";
import { erc20Abi, type Address, type PublicClient } from "viem";

import { USDT_BRIDGE } from "~/consts/usdtBridge";
import { buildUsdtWrapCall } from "./usdtBridge.contract";

export async function estimateUsdtBridge(
  client: PublicClient,
  account: Address,
  amount: BigNumber,
  recipient: string
) {
  const wrapCall = buildUsdtWrapCall(amount, recipient);
  const [allowance, fees, latest] = await Promise.all([
    client.readContract({
      address: USDT_BRIDGE.sourceToken.address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [account, USDT_BRIDGE.address],
    }),
    client.estimateFeesPerGas(),
    client.getBlock(),
  ]);
  const approvalAmounts =
    allowance >= wrapCall.args[1]
      ? []
      : allowance > 0n
        ? [0n, wrapCall.args[1]]
        : [wrapCall.args[1]];
  const transactionCount = approvalAmounts.length + 1;
  const gasPromise = async () => {
    if (!approvalAmounts.length)
      return client.estimateContractGas({ ...wrapCall, account });

    // Preserve allowance changes without broadcasting approvals or guessing storage slots.
    const calls = [
      ...approvalAmounts.map((value) => ({
        to: USDT_BRIDGE.sourceToken.address,
        abi: erc20Abi,
        functionName: "approve" as const,
        args: [USDT_BRIDGE.address, value] as const,
        account,
      })),
      { ...wrapCall, to: wrapCall.address, account },
    ];
    const blocks = await client.simulateBlocks({ blocks: [{ calls }] });
    const results = blocks.flatMap((block) => block.calls);
    if (results.length !== transactionCount)
      throw new Error("Incomplete bridge fee simulation.");
    return results.reduce((total, call) => {
      if (call.status === "failure") throw call.error;
      if (call.result === false) throw new Error("Bridge simulation refused.");
      return total + call.gasUsed;
    }, 0n);
  };
  const [gas, previous] = await Promise.allSettled([
    gasPromise(),
    client.getBlock({
      blockNumber: latest.number > 10n ? latest.number - 10n : 0n,
    }),
  ]);
  const effectiveGasPrice =
    latest.baseFeePerGas === null
      ? fees.maxFeePerGas
      : latest.baseFeePerGas + fees.maxPriorityFeePerGas;
  const gasPrice =
    effectiveGasPrice < fees.maxFeePerGas
      ? effectiveGasPrice
      : fees.maxFeePerGas;
  const blockSeconds =
    previous.status === "fulfilled" && latest.number > previous.value.number
      ? Number(latest.timestamp - previous.value.timestamp) /
        Number(latest.number - previous.value.number)
      : null;

  return {
    fee: gas.status === "fulfilled" ? (gas.value * gasPrice).toString() : null,
    // A heuristic of one to three blocks per sequential transaction, excluding signatures.
    timeSeconds:
      blockSeconds && blockSeconds > 0
        ? {
            min: Math.ceil(blockSeconds * transactionCount),
            max: Math.ceil(blockSeconds * transactionCount * 3),
          }
        : null,
  };
}
