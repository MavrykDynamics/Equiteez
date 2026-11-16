import { getBridgeDepositId } from "~/lib/apis/rwa/bridge/bridge.schema";
import {
  getForwardIdentity,
  getIntentSettlementReceipt,
  type IntentRecord,
} from "~/lib/intents/intentOperation";
import {
  getBridgeEventId,
  hasCompletedBridgeSigners,
} from "./bridgeDepositEvent";
import type { BridgeTransaction } from "./bridgeTransactions";

/**
 * Join keys between a 1Click operation and the existing bridge settlement
 * data: the ERC20WrapAsked logs of the sponsored forward
 * (`forwarding.bridgeEvents`, plus `settlement.mints` wrap identities).
 * One operation can wrap in several allocations. The 1Click funding hash and
 * the delivery hashes are never used here.
 */
export function getIntentForwardIds(record: IntentRecord) {
  const backend = record.backend;
  const ids = new Set<string>();
  if (!backend) return ids;
  for (const event of backend.forwarding.bridgeEvents)
    ids.add(getForwardIdentity(event.transactionHash, event.logIndex));
  for (const mint of backend.settlement.mints)
    ids.add(getForwardIdentity(mint.wrapTransactionHash, mint.wrapLogIndex));
  return ids;
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
export function getIntentForwardIdMap(intents: readonly IntentRecord[]) {
  const ids = new Map<string, string>();
  for (const record of intents)
    for (const id of getIntentForwardIds(record)) ids.set(id, record.localId);
  return ids;
}

/** Bridge records that belong to a 1Click operation (shown on its card). */
export const isIntentOwnedBridgeRecord = (
  record: BridgeTransaction,
  forwardIds: ReadonlyMap<string, string>
) => [...getBridgeRecordIds(record)].some((id) => forwardIds.has(id));

/**
 * Fallback when the backend does not (yet) confirm settlement: localIds whose
 * EVERY forward identity matches a bridge record with verified receipt
 * evidence. Both stores are scoped to the same Equiteez account. A partial
 * match (one of several allocations) does not complete the operation.
 */
export function findCorrelatedIntentReceipts(
  intents: readonly IntentRecord[],
  bridgeRecords: Iterable<BridgeTransaction>
) {
  const pending = intents.filter(
    (record) =>
      record.receipt !== "correlated" &&
      getIntentSettlementReceipt(record) === null &&
      record.backend?.phase === "WRAPPED" &&
      record.backend.settlement.status !== "RECONCILE_REQUIRED"
  );
  if (!pending.length) return [];
  const verified = new Set<string>();
  for (const record of bridgeRecords)
    if (hasVerifiedReceipt(record))
      for (const id of getBridgeRecordIds(record)) verified.add(id);
  return pending
    .filter((record) => {
      const ids = getIntentForwardIds(record);
      return ids.size > 0 && [...ids].every((id) => verified.has(id));
    })
    .map((record) => record.localId);
}
