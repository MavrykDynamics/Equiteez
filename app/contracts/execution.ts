/**
 * Sending, confirming and checking contract operations, shared by every
 * direct action (orderbook, primary purchase) and both wallet providers.
 */
import type { MavrykToolkit } from "@mavrykdynamics/taquito";

import { assertNativeBudget } from "~/services/direct/nativeBudget";
import {
  inspectOperationResults,
  OperationFailedOnChainError,
  OperationOutcomeUnknownError,
} from "~/services/direct/operationResults";

import type { ContractActionLifecycleCallbacks } from "./actions.type";
import type { BatchOperationKindType } from "./types";

type SentOperation = {
  opHash: string;
  confirmation: (
    confirmations?: number
  ) => Promise<{ block: { header: { level: number } } } | undefined>;
  operationResults: () => Promise<readonly unknown[] | undefined>;
};

/**
 * Waits for inclusion and requires every result of the operation, including
 * internal operations, to be applied. Inclusion alone is not success.
 */
export async function confirmWalletOperation(
  operation: SentOperation,
  callbacks: ContractActionLifecycleCallbacks = {},
  confirmations?: number
) {
  const { opHash } = operation;

  callbacks.onTransactionSubmitted?.({ opHash });

  const confirmation = await operation.confirmation(confirmations);
  const outcome = inspectOperationResults(await operation.operationResults());

  if (outcome.status === "failed") {
    throw new OperationFailedOnChainError(opHash, outcome.reason);
  }
  if (outcome.status === "not-found") {
    throw new OperationOutcomeUnknownError(opHash);
  }

  const level = confirmation?.block.header.level;

  // Applied results without an inclusion level is not a state to report as
  // done: keep it unknown rather than silently skipping the confirmation
  if (typeof level !== "number") {
    throw new OperationOutcomeUnknownError(opHash);
  }

  callbacks.onTransactionConfirmed?.({ level, opHash });

  return { opHash, level };
}

/** Optional MVRK check, then send the batch and confirm it. */
export async function sendAndConfirmBatch(
  tezos: MavrykToolkit,
  batch: BatchOperationKindType,
  callbacks: ContractActionLifecycleCallbacks = {},
  confirmations?: number
) {
  if (callbacks.execution?.checkNativeBudget) {
    await assertNativeBudget(tezos, batch);
  }

  const operation = await tezos.wallet.batch(batch).send();

  return confirmWalletOperation(operation, callbacks, confirmations);
}
