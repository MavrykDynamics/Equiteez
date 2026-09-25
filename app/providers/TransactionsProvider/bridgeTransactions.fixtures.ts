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

// Same ordering, signer alternation and timestamps as events.md, with test identities.
export const signerEventSequence = [
  ["signer-a", "PENDING", "2026-09-25T12:04:24.930022+00:00"],
  ["signer-b", "PENDING", "2026-09-25T12:04:24.931014+00:00"],
  ["signer-b", "PROCESSING", "2026-09-25T12:06:37.009301+00:00"],
  ["signer-a", "PROCESSING", "2026-09-25T12:06:37.931717+00:00"],
  ["signer-b", "COMPLETED", "2026-09-25T12:06:46.806471+00:00"],
  ["signer-a", "COMPLETED", "2026-09-25T12:07:01.427561+00:00"],
].map(([signatory, status, updated_at]) => ({
  direction: "in",
  initial_tx_hash: hash,
  initial_log_index: 32,
  mavryk_address: "wallet-a",
  signatory,
  status,
  updated_at,
  amount: "1500000000000000000",
  erc_token: "0xada0b668c6598559c5c816a8b633efe714c5b5f3",
}));
