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
  INTENTS_FUNDING_TIMEOUT_MS,
} from "~/consts/intents";
import type { IntentsApi } from "~/lib/apis/intents";
import {
  buildIntentFundingCall,
  classifyIntentFundingError,
  getIntentFundingErrorMessage,
} from "~/lib/intents/intentFunding";
import { sendIntentHint } from "~/lib/intents/intentHints";
import type {
  IntentFundingState,
  IntentRecord,
} from "~/lib/intents/intentOperation";
import { isIntentQuoteExpired } from "~/lib/intents/intentQuote";
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
  /** False once the Equiteez account/session or modal run changed. */
  isCurrent: () => boolean;
  sendHint?: typeof sendIntentHint;
};

/**
 * Funds the 1Click source deposit address with the connected source wallet.
 * This is the only user signature in the flow; it is distinct from the direct
 * bridge's approve/wrapToken path. Persisted before the wallet call so a
 * reload, modal close or late response can never prompt a second transfer.
 */
export async function executeIntentFunding({
  config,
  api,
  session,
  localId,
  isCurrent,
  sendHint = sendIntentHint,
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
  const { funding, operationId } = record;
  if (!funding || !operationId)
    throw new IntentFundingBlockedError("The deposit operation is not ready.");
  if (!canRequestIntentFunding(record.fundingState))
    throw new IntentFundingBlockedError(
      "This deposit was already sent to your wallet. It will not be requested again."
    );
  if (record.quoteExpiresAt && isIntentQuoteExpired(record.quoteExpiresAt))
    throw new IntentFundingBlockedError(
      "The quote expired before funding. Start a new deposit."
    );

  try {
    assertCurrent();
    const wallet = getAccount(config);
    if (
      !wallet.isConnected ||
      wallet.address?.toLowerCase() !== record.sourceAddress.toLowerCase()
    )
      throw new IntentFundingBlockedError(
        "Your source wallet changed. Reconnect the wallet you reviewed the quote with."
      );
    if (wallet.chainId !== funding.chainId)
      await switchChain(config, { chainId: funding.chainId });
    const amount = BigInt(funding.amount);
    const balance =
      funding.token === "native"
        ? (
            await getBalance(config, {
              address: wallet.address,
              chainId: funding.chainId,
            })
          ).value
        : await readContract(config, {
            address: funding.token,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [wallet.address],
            chainId: funding.chainId,
          });
    if (balance < amount)
      throw new IntentFundingBlockedError(
        `Insufficient ${record.source.symbol} balance on ${record.source.chainName}.`
      );
    assertCurrent();
    const after = getAccount(config);
    if (
      after.address?.toLowerCase() !== record.sourceAddress.toLowerCase() ||
      after.chainId !== funding.chainId
    )
      throw new IntentFundingBlockedError(
        `Keep your wallet connected to ${record.source.chainName} with the same account.`
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
  write({ fundingState: "prompted", fundingError: undefined });
  const call = buildIntentFundingCall(funding);
  let hash: Hash;
  try {
    hash =
      call.kind === "native"
        ? await sendTransaction(config, {
            account: record.sourceAddress as `0x${string}`,
            chainId: call.chainId,
            to: call.to,
            value: call.value,
          })
        : await writeContract(config, {
            account: record.sourceAddress as `0x${string}`,
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
  write({
    fundingState: "broadcast",
    sourceHashes: [...read().sourceHashes, hash.toLowerCase() as `0x${string}`],
    hintState: "pending",
    isWidgetRequested: true,
  });
  void sendHint(api, session, localId);

  // Only a repriced replacement is the same transfer; a cancel or a different
  // transaction leaves the funding outcome unknown.
  let replacementReason: string | undefined;
  try {
    const receipt = await waitForTransactionReceipt(config, {
      chainId: funding.chainId,
      hash,
      confirmations: INTENTS_FUNDING_CONFIRMATIONS,
      timeout: INTENTS_FUNDING_TIMEOUT_MS,
      onReplaced: (replacement) => {
        replacementReason = replacement.reason;
        if (replacement.reason !== "repriced") return;
        write({
          sourceHashes: [
            ...read().sourceHashes,
            replacement.transaction.hash.toLowerCase() as `0x${string}`,
          ],
          hintState: "pending",
        });
        void sendHint(api, session, localId);
      },
    });
    write(
      replacementReason && replacementReason !== "repriced"
        ? {
            fundingState: "unknown",
            fundingError:
              "The transfer was replaced or cancelled in your wallet. Check it before sending anything else.",
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
 * UI can be exercised without testnet funds. Never available with the HTTP API.
 */
export function simulateIntentFunding(
  api: IntentsApi,
  session: IntentOperations,
  localId: string,
  sendHint: typeof sendIntentHint = sendIntentHint
) {
  if (api.env !== "mock")
    throw new Error("Simulation is only available in mock mode.");
  const record = session.get(localId);
  if (!record?.operationId || !canRequestIntentFunding(record.fundingState))
    return;
  const hash = `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("")}` as `0x${string}`;
  session.upsert({
    ...record,
    fundingState: "confirmed",
    fundingError: undefined,
    sourceHashes: [...record.sourceHashes, hash],
    hintState: "pending",
    isWidgetRequested: true,
    sequence: record.sequence + 1,
  });
  void sendHint(api, session, localId);
}
