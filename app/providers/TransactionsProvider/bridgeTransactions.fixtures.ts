import { bridgeNetwork, type BridgeTransaction } from "./bridgeTransactions";
import type { BridgeDeposit } from "~/lib/apis/rwa/bridge/bridge.schema";

export const hash = `0x${"a".repeat(64)}` as const;
export const replacementHash = `0x${"b".repeat(64)}` as const;
export const localRecord = (
  operationId = "operation-1"
): BridgeTransaction => ({
  operationId,
  account: "wallet-a",
  network: bridgeNetwork,
  sender: `0x${"1".repeat(40)}`,
  amount: "1",
  sequence: 1,
  sourceHashes: [hash],
  settlement: "unknown",
  verification: "local",
});
export const deposit = (
  overrides: Partial<BridgeDeposit> = {}
): BridgeDeposit => ({
  evm_tx_hash: hash,
  log_index: 1,
  status: "confirming",
  chain_from: "ethereum",
  chain_to: "mavryk",
  updated_at: "2026-09-23T12:00:00Z",
  signer_count: 0,
  signatory_threshold: null,
  required_confirmations: 12,
  ...overrides,
});
