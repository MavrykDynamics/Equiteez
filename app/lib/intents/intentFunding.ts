import {
  BaseError,
  ChainMismatchError,
  erc20Abi,
  EstimateGasExecutionError,
  InsufficientFundsError,
  UserRejectedRequestError,
} from "viem";

import type { IntentFundingInstructions } from "~/lib/apis/intents";
import type { IntentRecord } from "./intentOperation";

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

/**
 * Why a connected EVM wallet cannot send this deposit, or null when it can.
 * Non-EVM networks and deposits that need a memo are paid from the deposit
 * address instead (any wallet or exchange).
 */
export function getEvmFundingBlocker(
  source: IntentRecord["source"],
  instructions: Pick<
    IntentFundingInstructions,
    "depositAddress" | "depositMemo"
  >
): string | null {
  if (source.family !== "evm" || !source.evmChainId)
    return "Send this deposit from a wallet on its network.";
  if (instructions.depositMemo !== null)
    return "This deposit needs a memo, which this wallet cannot attach.";
  if (!EVM_ADDRESS.test(instructions.depositAddress))
    return "The deposit address is not an EVM address.";
  if (
    source.kind === "token" &&
    !(source.contractAddress && EVM_ADDRESS.test(source.contractAddress))
  )
    return "The token contract is not an EVM address.";
  return null;
}

/**
 * Exact funding call from the backend's published instructions. The amount
 * and destination are passed through unchanged, never recalculated. Funds go
 * to `depositAddress` (1Click's source deposit address), never to
 * `forwarderAddress`. The token contract comes from the metadata asset the
 * user confirmed; callers check the instructions match it first.
 */
export function buildIntentFundingCall(
  source: IntentRecord["source"],
  instructions: IntentFundingInstructions
) {
  const blocker = getEvmFundingBlocker(source, instructions);
  if (blocker) throw new Error(blocker);
  const chainId = source.evmChainId!;
  const to = instructions.depositAddress as `0x${string}`;
  const amount = BigInt(instructions.amount);
  return source.kind === "native"
    ? ({ kind: "native", chainId, to, value: amount } as const)
    : ({
        kind: "erc20",
        chainId,
        address: source.contractAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [to, amount],
      } as const);
}

export type IntentFundingFailure =
  /** Declined in the wallet: nothing was broadcast. */
  | "rejected"
  /** Failed before broadcast (estimate, funds, chain, connector). */
  | "not_sent"
  /** Anything else after the wallet request: may have been broadcast. */
  | "unknown";

// wagmi bundles its own @wagmi/core, so its errors are matched by name.
const wagmiPreBroadcastErrors = new Set([
  "ConnectorNotConnectedError",
  "ConnectorAccountNotFoundError",
  "ConnectorChainMismatchError",
  "ConnectorUnavailableReconnectingError",
]);
const isWagmiPreBroadcastError = (error: unknown): boolean =>
  error instanceof Error &&
  (wagmiPreBroadcastErrors.has(error.name) ||
    isWagmiPreBroadcastError((error as { cause?: unknown }).cause));

const walks = (error: unknown, type: new (...args: never[]) => Error) =>
  error instanceof type ||
  (error instanceof BaseError &&
    error.walk((cause) => cause instanceof type) instanceof type);

export function classifyIntentFundingError(
  error: unknown
): IntentFundingFailure {
  if (walks(error, UserRejectedRequestError)) return "rejected";
  if (
    walks(error, InsufficientFundsError) ||
    walks(error, EstimateGasExecutionError) ||
    walks(error, ChainMismatchError) ||
    isWagmiPreBroadcastError(error)
  )
    return "not_sent";
  return "unknown";
}

export const getIntentFundingErrorMessage = (error: unknown) =>
  error instanceof BaseError
    ? error.shortMessage
    : error instanceof Error
      ? error.message
      : "The wallet returned an unexpected error.";
