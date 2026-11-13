import {
  BaseError,
  ChainMismatchError,
  erc20Abi,
  EstimateGasExecutionError,
  InsufficientFundsError,
  UserRejectedRequestError,
} from "viem";

import type { IntentFunding } from "~/lib/apis/intents";

/**
 * Exact funding call from the backend's executable instructions. Values are
 * passed through unchanged, never recalculated.
 */
export function buildIntentFundingCall(funding: IntentFunding) {
  return funding.token === "native"
    ? ({
        kind: "native",
        chainId: funding.chainId,
        to: funding.depositAddress,
        value: BigInt(funding.amount),
      } as const)
    : ({
        kind: "erc20",
        chainId: funding.chainId,
        address: funding.token,
        abi: erc20Abi,
        functionName: "transfer",
        args: [funding.depositAddress, BigInt(funding.amount)],
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
