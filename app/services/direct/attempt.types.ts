/**
 * Attempts of economic actions submitted directly to Mavryk RPC with gas paid
 * in MVRK (docs/dynamic-wallet.md §8.7, §9.2; DYN-FE-10).
 */

export type WalletProviderKind = "mavryk_extension" | "dynamic";

/** Where an attempt belongs: one account on one network of one backend. */
export type AttemptScope = {
  environment: string;
  chainId: string;
  /** mv1 address */
  address: string;
};

export type AttemptIdentity = AttemptScope & {
  provider: WalletProviderKind;
  walletId: string;
  epoch: number;
};

/**
 * Mode-discriminated reference to the submitted operation. Gasless attempts
 * will carry the RWA operation id instead of a chain hash.
 */
export type OperationRef = { mode: "mvrk"; opHash: string };

/**
 * prepared      – reviewed, being signed; nothing has reached the network
 * broadcasting  – hash persisted, RPC injection in flight
 * injected      – the node accepted the operation and returned its hash
 * applied       – included, every manager and internal result applied
 * failed        – included but failed/backtracked/skipped (fees may be spent)
 * unknown       – may have reached the network; only a receipt resolves it
 * rejected      – proven never broadcast (see RejectReason)
 */
export type AttemptPhase =
  | "prepared"
  | "broadcasting"
  | "injected"
  | "applied"
  | "failed"
  | "unknown"
  | "rejected";

export type RejectReason =
  /** Declined or cancelled in the wallet */
  | "user"
  /** The node's simulation (preapply) refused the operation */
  | "preapply"
  /** The node answered the injection with an error */
  | "node"
  /** Closed or reloaded before the operation was broadcast */
  | "abandoned"
  /** Failed before broadcast for any other reason */
  | "error";

export type DirectAttempt = {
  attemptId: string;
  /** e.g. "orderbook.buy" – for display and diagnostics only */
  action: string;
  /** Same intent ⇒ same fingerprint; blocks duplicates while unresolved */
  intentFingerprint: string;
  identity: AttemptIdentity;
  phase: AttemptPhase;
  ref?: OperationRef;
  branch?: string;
  /** First and last manager counter of the operation */
  counterRange?: [string, string];
  rejectReason?: RejectReason;
  /** Short error code/message, never signed data */
  error?: string;
  createdAt: number;
  updatedAt: number;
};

/** Phases after which nothing more can happen to the operation. */
export const TERMINAL_PHASES: ReadonlySet<AttemptPhase> = new Set([
  "applied",
  "failed",
  "rejected",
]);

/** Phases in which the operation may still execute on chain. */
export const UNRESOLVED_PHASES: ReadonlySet<AttemptPhase> = new Set([
  "broadcasting",
  "injected",
  "unknown",
]);
