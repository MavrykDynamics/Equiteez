import { getBridgeDepositId } from "~/lib/apis/rwa/bridge/bridge.schema";
import type { IntentRecord } from "~/lib/intents/intentOperation";
import {
  getBridgeEventId,
  hasCompletedBridgeSigners,
} from "./bridgeDepositEvent";
import type { BridgeTransaction } from "./bridgeTransactions";

/**
 * Join key between a 1Click operation and the existing bridge settlement
 * data: the ERC20WrapAsked emitted by the sponsored forward (hash + log
 * index). The 1Click funding and delivery hashes are never used here.
 */
export function getIntentForwardId(record: IntentRecord) {
  const backend = record.backend;
  if (
    backend?.status !== "wrapped" ||
    !backend.forwardTxHash ||
    backend.forwardLogIndex === undefined
  )
    return undefined;
  return `${backend.forwardTxHash.toLowerCase()}:${backend.forwardLogIndex}`;
}

/** Every hash/log identity a bridge record is known under. */
export function getBridgeRecordIds(record: BridgeTransaction) {
  const ids = new Set<string>();
  for (const event of record.signerEvents ?? [])
    ids.add(getBridgeEventId(event));
  if (record.backend) ids.add(getBridgeDepositId(record.backend));
  return ids;
}

/**
 * Verified Mavryk receipt for a bridge record: the wallet API reports it
 * executed, or two distinct signers reported COMPLETED (the existing direct
 * bridge rule). A single signer COMPLETED, EVM WRAPPED or 1Click SUCCESS
 * is not a receipt.
 */
const hasVerifiedReceipt = (record: BridgeTransaction) =>
  (record.settlement === "executed" && record.verification === "verified") ||
  hasCompletedBridgeSigners(record.signerEvents);

/** Forward identity → intent localId, for operations the bridge may report. */
export function getIntentForwardIds(intents: readonly IntentRecord[]) {
  const ids = new Map<string, string>();
  for (const record of intents) {
    const id = getIntentForwardId(record);
    if (id) ids.set(id, record.localId);
  }
  return ids;
}

/** Bridge records that belong to a 1Click operation (shown on its card). */
export const isIntentOwnedBridgeRecord = (
  record: BridgeTransaction,
  forwardIds: ReadonlyMap<string, string>
) => [...getBridgeRecordIds(record)].some((id) => forwardIds.has(id));

/**
 * localIds whose forward identity matches a bridge record with verified
 * receipt evidence. Both stores are scoped to the same Equiteez account.
 */
export function findCorrelatedIntentReceipts(
  intents: readonly IntentRecord[],
  bridgeRecords: Iterable<BridgeTransaction>
) {
  const forwardIds = getIntentForwardIds(
    intents.filter((record) => record.receipt !== "correlated")
  );
  if (!forwardIds.size) return [];
  const matched = new Set<string>();
  for (const record of bridgeRecords) {
    if (!hasVerifiedReceipt(record)) continue;
    for (const id of getBridgeRecordIds(record)) {
      const localId = forwardIds.get(id);
      if (localId) matched.add(localId);
    }
  }
  return [...matched];
}
