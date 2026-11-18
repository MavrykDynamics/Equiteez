import { erc20Abi, type Hash } from "viem";
import type { Config } from "wagmi";
import {
  getAccount,
  getBalance,
  readContract,
  sendTransaction,
  switchChain,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";

import {
  INTENTS_FUNDING_CONFIRMATIONS,
  INTENTS_FUNDING_SAFETY_MS,
  INTENTS_FUNDING_TIMEOUT_MS,
} from "~/consts/intents";
import {
  isIntentsApiError,
  type IntentFundingInstructions,
  type IntentsApi,
} from "~/lib/apis/intents";
import {
  buildIntentFundingCall,
  classifyIntentFundingError,
  getIntentFundingErrorMessage,
} from "~/lib/intents/intentFunding";
import {
  getInstructionsMismatch,
  getOperationMismatch,
  type IntentFundingState,
  type IntentRecord,
} from "~/lib/intents/intentOperation";
import {
  getIntentErrorCopy,
  isIntentInstructionsExpired,
} from "~/lib/intents/intentQuote";
import type { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";

/** States that allow (another) wallet request: nothing was broadcast. */
export const canRequestIntentFunding = (state: IntentFundingState) =>
  state === "not_started" || state === "rejected";

export class IntentFundingBlockedError extends Error {}

type FundingParams = {
  config: Config;
  api: IntentsApi;
  /** Captured at start: late wallet responses still land in this scope. */
  session: IntentOperations;
  localId: string;
  /** Quote the user reviewed; a different one needs a new confirmation. */
  reviewedQuoteId: string;
  /** False once the Equiteez account/session or modal run changed. */
  isCurrent: () => boolean;
  now?: () => number;
};

/**
 * Re-reads the operation and returns its instructions only if they can be
 * sent right now: AVAILABLE, open, echoing the confirmed request, matching
 * the route, the quote the user reviewed, and not about to expire
 * (backend.md §7.4).
 */
async function readFundableInstructions(
  api: IntentsApi,
  session: IntentOperations,
  record: IntentRecord,
  reviewedQuoteId: string,
  now: number
): Promise<IntentFundingInstructions> {
  let operation;
  try {
    operation = await api.getOperation(record.capability, record.operationId!);
  } catch (error) {
    throw new IntentFundingBlockedError(
      isIntentsApiError(error)
        ? `Unable to confirm the quote before sending. ${getIntentErrorCopy(error)}`
        : "Unable to confirm the quote before sending."
    );
  }
  session.applyBackend(record.localId, operation);
  const instructions = operation.fundingInstructions;
  if (getOperationMismatch(record, operation))
    throw new IntentFundingBlockedError(
      "The deposit service returned an operation that does not match your request. Nothing was sent."
    );
  if (operation.closure !== "OPEN")
    throw new IntentFundingBlockedError(
      "This quote was rejected. Start a new deposit."
    );
  if (operation.fundingStatus !== "AVAILABLE" || !instructions)
    throw new IntentFundingBlockedError(
      operation.fundingStatus === "EXPIRED"
        ? "The quote expired before funding. Start a new deposit."
        : operation.fundingStatus === "PAUSED"
          ? "Funding is paused for this route. Nothing was sent; try again later."
          : operation.fundingStatus === "OBSERVED"
            ? "A deposit was already observed for this operation. It will not be requested again."
            : "The quote is not ready for funding yet."
    );
  if (instructions.quoteId !== reviewedQuoteId)
    throw new IntentFundingBlockedError(
      "The quote changed. Review the new amounts and confirm again."
    );
  const mismatch = getInstructionsMismatch(record, instructions);
  if (mismatch)
    throw new IntentFundingBlockedError(
      `The funding instructions do not match your request (${mismatch}). Nothing was sent.`
    );
  if (
    isIntentInstructionsExpired(
      instructions.fundingExpiresAt,
      now,
      INTENTS_FUNDING_SAFETY_MS
    )
  )
    throw new IntentFundingBlockedError(
      "The quote is about to expire. Start a new deposit."
    );
  return instructions;
}

/**
 * Funds the 1Click source deposit address with the connected source wallet.
 * This is the only user signature in the flow; it is distinct from the direct
 * bridge's approve/wrapToken path. Persisted before the wallet call so a
 * reload, modal close or late response can never prompt a second transfer.
 * Routes with connected-wallet registration (backend.md §4.5) get the hash
 * queued as `registration: pending` in the same write that saves it; the
 * tracker sends it to the backend and retries without the wallet.
 */
export async function executeIntentFunding({
  config,
  api,
  session,
  localId,
  reviewedQuoteId,
  isCurrent,
  now = Date.now,
}: FundingParams): Promise<IntentFundingState> {
  const read = () => {
    const record = session.get(localId);
    if (!record) throw new IntentFundingBlockedError("Deposit not found.");
    return record;
  };
  const write = (patch: Partial<IntentRecord>) => {
    const current = read();
    session.upsert({ ...current, ...patch, sequence: current.sequence + 1 });
  };
  const assertCurrent = () => {
    if (!isCurrent())
      throw new IntentFundingBlockedError(
        "Your Equiteez account changed. Start the deposit again."
      );
  };

  const record = read();
  if (!record.operationId)
    throw new IntentFundingBlockedError("The deposit operation is not ready.");
  if (!canRequestIntentFunding(record.fundingState))
    throw new IntentFundingBlockedError(
      "This deposit was already sent to your wallet. It will not be requested again."
    );

  let instructions: IntentFundingInstructions;
  try {
    assertCurrent();
    const wallet = getAccount(config);
    if (
      !wallet.isConnected ||
      wallet.address?.toLowerCase() !==
        record.request.sourceAddress.toLowerCase()
    )
      throw new IntentFundingBlockedError(
        "Your source wallet changed. Reconnect the wallet you reviewed the deposit with."
      );
    instructions = await readFundableInstructions(
      api,
      session,
      record,
      reviewedQuoteId,
      now()
    );
    assertCurrent();
    const { chainId } = record.source;
    if (wallet.chainId !== chainId) await switchChain(config, { chainId });
    const amount = BigInt(instructions.amount);
    const balance =
      record.source.token === "native"
        ? (await getBalance(config, { address: wallet.address, chainId })).value
        : await readContract(config, {
            address: record.source.token,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [wallet.address],
            chainId,
          });
    if (balance < amount)
      throw new IntentFundingBlockedError(
        `Insufficient ${record.source.symbol} balance on ${record.source.chainName}.`
      );
    assertCurrent();
    const after = getAccount(config);
    if (
      after.address?.toLowerCase() !==
        record.request.sourceAddress.toLowerCase() ||
      after.chainId !== chainId
    )
      throw new IntentFundingBlockedError(
        `Keep your wallet connected to ${record.source.chainName} with the same account.`
      );
    if (
      isIntentInstructionsExpired(
        instructions.fundingExpiresAt,
        now(),
        INTENTS_FUNDING_SAFETY_MS
      )
    )
      throw new IntentFundingBlockedError(
        "The quote is about to expire. Start a new deposit."
      );
  } catch (error) {
    write({
      fundingError:
        error instanceof IntentFundingBlockedError
          ? error.message
          : `Unable to prepare the transfer: ${getIntentFundingErrorMessage(error)}`,
    });
    throw error;
  }

  // Persisted before the wallet request (rule: persist before irreversible steps).
  write({
    fundingState: "prompted",
    fundingError: undefined,
    lastInstructions: instructions,
  });
  const call = buildIntentFundingCall(record.source, instructions);
  const account = record.request.sourceAddress;
  let hash: Hash;
  try {
    hash =
      call.kind === "native"
        ? await sendTransaction(config, {
            account,
            chainId: call.chainId,
            to: call.to,
            value: call.value,
          })
        : await writeContract(config, {
            account,
            chainId: call.chainId,
            address: call.address,
            abi: call.abi,
            functionName: call.functionName,
            args: call.args,
          });
  } catch (error) {
    const failure = classifyIntentFundingError(error);
    write({
      fundingState:
        failure === "rejected"
          ? "rejected"
          : failure === "not_sent"
            ? "not_started"
            : "unknown",
      fundingError:
        failure === "rejected"
          ? "The transfer was declined in your wallet."
          : failure === "unknown"
            ? "The wallet did not confirm whether the transfer was sent. Check your wallet before doing anything else."
            : getIntentFundingErrorMessage(error),
    });
    return read().fundingState;
  }

  // Saved even if the account changed meanwhile: the transfer exists.
  const sentHash = hash.toLowerCase() as `0x${string}`;
  write({
    fundingState: "broadcast",
    sourceHashes: [...read().sourceHashes, sentHash],
    isWidgetRequested: true,
    registration: record.hasDepositRegistration
      ? { status: "pending", hash: sentHash }
      : undefined,
  });
  const pendingRegistration = () => {
    const current = read().registration;
    return current?.status === "pending" ? current : undefined;
  };

  // Only a repriced replacement is the same transfer; a cancel or a different
  // transaction leaves the funding outcome unknown.
  let replacementReason: string | undefined;
  try {
    const receipt = await waitForTransactionReceipt(config, {
      chainId: record.source.chainId,
      hash,
      confirmations: INTENTS_FUNDING_CONFIRMATIONS,
      timeout: INTENTS_FUNDING_TIMEOUT_MS,
      onReplaced: (replacement) => {
        replacementReason = replacement.reason;
        if (replacement.reason !== "repriced") return;
        const replacementHash =
          replacement.transaction.hash.toLowerCase() as `0x${string}`;
        const registration = pendingRegistration();
        write({
          sourceHashes: [...read().sourceHashes, replacementHash],
          // Only the mined transaction can be registered.
          ...(registration && {
            registration: { ...registration, hash: replacementHash },
          }),
        });
      },
    });
    const registration = pendingRegistration();
    write(
      replacementReason && replacementReason !== "repriced"
        ? {
            fundingState: "unknown",
            fundingError:
              "The transfer was replaced or cancelled in your wallet. Check it before sending anything else.",
            // The saved hash will never be mined; nothing to register.
            ...(registration && {
              registration: {
                ...registration,
                status: "stopped" as const,
                error: "The transfer was replaced or cancelled in the wallet.",
              },
            }),
          }
        : receipt.status === "success"
          ? { fundingState: "confirmed" }
          : {
              fundingState: "reverted",
              fundingError: `The transfer failed on ${record.source.chainName}. Start a new deposit to try again.`,
            }
    );
  } catch (error) {
    write({
      fundingState: "unknown",
      fundingError: `The transfer was sent, but its confirmation could not be checked (${getIntentFundingErrorMessage(error)}). Do not send it again; tracking continues.`,
    });
  }
  return read().fundingState;
}

/**
 * Mock mode only: records a fake funding hash without a wallet request so the
 * UI can be exercised without testnet funds. The tracker registers it like a
 * real one. Never available with the HTTP API.
 */
export function simulateIntentFunding(
  api: IntentsApi,
  session: IntentOperations,
  localId: string
) {
  if (api.env !== "mock")
    throw new Error("Simulation is only available in mock mode.");
  const record = session.get(localId);
  if (
    !record?.operationId ||
    !canRequestIntentFunding(record.fundingState) ||
    record.backend?.fundingStatus !== "AVAILABLE"
  )
    return;
  const hash = `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("")}` as `0x${string}`;
  session.upsert({
    ...record,
    fundingState: "confirmed",
    fundingError: undefined,
    lastInstructions: record.backend.fundingInstructions ?? undefined,
    sourceHashes: [...record.sourceHashes, hash],
    registration: record.hasDepositRegistration
      ? { status: "pending", hash }
      : undefined,
    isWidgetRequested: true,
    sequence: record.sequence + 1,
  });
}
