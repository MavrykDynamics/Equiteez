/**
 * Which actions each wallet may run, by provider, payment mode, action and
 * network (docs/dynamic-wallet.md "First-release capability matrix",
 * DYN-FE-14). Being able to sign does not authorize an action: only actions
 * listed here as tested (or gated and switched on) can be submitted.
 */
import { RPC_NODE_CHAIN_IDS } from "~/consts/rpcNodes";
import type { WalletProviderKind } from "~/services/direct/attempt.types";

export type WalletAction =
  | "orderbook.buy"
  | "orderbook.sell"
  | "orderbook.cancel"
  | "orderbook.refund"
  | "primary.purchase"
  | "withdraw"
  /** Ethereum → Mavryk bridge into this wallet */
  | "bridge.deposit"
  /** Mavryk → Ethereum: no submit flow exists in the app */
  | "bridge.withdraw"
  | "dodo";

export type PaymentMode = "mvrk" | "gasless";

/**
 * tested      – implemented and verified for this wallet
 * gated       – implemented, waiting for real-network evidence; off unless
 *               its rollout flag is on
 * unavailable – not implemented for this wallet
 */
export type CapabilityStatus = "tested" | "gated" | "unavailable";

const DIRECT_MATRIX: Record<
  WalletProviderKind,
  Record<WalletAction, CapabilityStatus>
> = {
  mavryk_extension: {
    "orderbook.buy": "tested",
    "orderbook.sell": "tested",
    "orderbook.cancel": "tested",
    "orderbook.refund": "tested",
    "primary.purchase": "tested",
    withdraw: "tested",
    "bridge.deposit": "tested",
    "bridge.withdraw": "unavailable",
    // DODO helpers have no UI; audit before exposing them
    dodo: "unavailable",
  },
  dynamic: {
    "orderbook.buy": "gated",
    "orderbook.sell": "gated",
    "orderbook.cancel": "gated",
    "orderbook.refund": "gated",
    "primary.purchase": "gated",
    withdraw: "gated",
    "bridge.deposit": "gated",
    "bridge.withdraw": "unavailable",
    dodo: "unavailable",
  },
};

export const UNAVAILABLE_FOR_EMAIL_WALLET =
  "Not available for email wallets yet.";
export const UNAVAILABLE_ACTION = "This action is not available.";
export const UNSUPPORTED_NETWORK = "This network is not supported.";

export type CapabilityContext = {
  provider: WalletProviderKind;
  chainId: string;
  /** Rollout flag for a gated action of email wallets */
  isDynamicDirectEnabled: (action: string) => boolean;
  mode?: PaymentMode;
};

export type ActionAvailability =
  | { isAllowed: true }
  | { isAllowed: false; reason: string };

const SUPPORTED_CHAIN_IDS = new Set<string>(Object.values(RPC_NODE_CHAIN_IDS));

const isWalletAction = (action: string): action is WalletAction =>
  action in DIRECT_MATRIX.mavryk_extension;

export function getCapabilityStatus(
  provider: WalletProviderKind,
  action: string,
  mode: PaymentMode = "mvrk"
): CapabilityStatus {
  // No Gasless executor exists yet
  if (mode !== "mvrk") return "unavailable";
  // Unlisted actions are never implied by the ability to sign
  if (!isWalletAction(action)) return "unavailable";

  return DIRECT_MATRIX[provider][action];
}

export function getActionAvailability(
  action: string,
  { provider, chainId, isDynamicDirectEnabled, mode }: CapabilityContext
): ActionAvailability {
  if (!SUPPORTED_CHAIN_IDS.has(chainId)) {
    return { isAllowed: false, reason: UNSUPPORTED_NETWORK };
  }

  const status = getCapabilityStatus(provider, action, mode);

  if (status === "tested") return { isAllowed: true };
  if (
    status === "gated" &&
    provider === "dynamic" &&
    isDynamicDirectEnabled(action)
  ) {
    return { isAllowed: true };
  }

  return {
    isAllowed: false,
    reason:
      provider === "dynamic"
        ? UNAVAILABLE_FOR_EMAIL_WALLET
        : UNAVAILABLE_ACTION,
  };
}

/** The action is not available for the connected wallet. */
export class ActionUnavailableError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "ActionUnavailableError";
  }
}

export function assertActionAvailable(
  action: string,
  context: CapabilityContext
) {
  const availability = getActionAvailability(action, context);

  if (!availability.isAllowed) {
    throw new ActionUnavailableError(availability.reason);
  }
}
