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
  getEvmFundingBlocker,
  getIntentFundingErrorMessage,
  type IntentFundingFailure,
} from "~/lib/intents/intentFunding";
import { isSameNetworkAddress } from "~/lib/intents/intentNetworks";
import {
  classifyIntentWalletError,
  getIntentWalletErrorMessage,
  type IntentWalletAdapter,
} from "~/lib/intents/wallets";
import { simulateMockDeposit } from "~/lib/apis/intents/intents.mock";
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
          ? "Funding is paused right now. Nothing was sent; try again later."
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

/** How one kind of wallet checks, sends and confirms a deposit. */
type IntentFundingSender = {
  /** The reviewed wallet is connected with the reviewed account. */
  checkWallet(record: IntentRecord): Promise<void>;
  /** Why these instructions cannot be sent from this wallet, or null. */
  blocker(
    record: IntentRecord,
    instructions: IntentFundingInstructions
  ): string | null;
  /** After the fresh read: network switch and balance (base units). */
  prepare(record: IntentRecord, amount: bigint): Promise<void>;
  send(
    record: IntentRecord,
    instructions: IntentFundingInstructions
  ): Promise<string>;
  classify(error: unknown): IntentFundingFailure;
  message(error: unknown): string;
  /**
   * Waits for the source receipt when the network supports it. Without one,
   * the deposit stays "broadcast" until 1Click reports it.
   */
  confirm?(
    record: IntentRecord,
    hash: string,
    addHash: (hash: string) => void
  ): Promise<Pick<IntentRecord, "fundingState" | "fundingError">>;
};

/**
 * Funds the 1Click source deposit address with a connected wallet. This is
 * the only user signature in the flow. Persisted before the wallet call so a
 * reload, modal close or late response can never prompt a second transfer.
 * The backend detects the deposit itself; the hash is kept for support.
 */
async function runIntentFunding(
  {
    api,
    session,
    localId,
    reviewedQuoteId,
    isCurrent,
    now = Date.now,
  }: Omit<FundingParams, "config">,
  sender: IntentFundingSender
): Promise<IntentFundingState> {
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
    if (api.env === "mock")
      throw new IntentFundingBlockedError(
        "Wallet transfers are disabled with the mock deposit service. Use Simulate Deposit."
      );
    if (!record.sourceWallet)
      throw new IntentFundingBlockedError(
        "Connect a wallet to send from it, or send to the deposit address from any wallet."
      );
    await sender.checkWallet(record);
    instructions = await readFundableInstructions(
      api,
      session,
      record,
      reviewedQuoteId,
      now()
    );
    const blocker = sender.blocker(record, instructions);
    if (blocker) throw new IntentFundingBlockedError(blocker);
    assertCurrent();
    await sender.prepare(record, BigInt(instructions.amount));
    assertCurrent();
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
          : `Unable to prepare the transfer: ${sender.message(error)}`,
    });
    throw error;
  }

  // Persisted before the wallet request (rule: persist before irreversible steps).
  write({
    fundingState: "prompted",
    fundingError: undefined,
    lastInstructions: instructions,
  });
  let hash: string;
  try {
    hash = await sender.send(read(), instructions);
  } catch (error) {
    const failure = sender.classify(error);
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
            : sender.message(error),
    });
    return read().fundingState;
  }

  // Saved even if the account changed meanwhile: the transfer exists.
  write({
    fundingState: "broadcast",
    sourceHashes: [...read().sourceHashes, hash],
    isWidgetRequested: true,
  });
  if (sender.confirm) {
    const outcome = await sender.confirm(read(), hash, (replacement) =>
      write({ sourceHashes: [...read().sourceHashes, replacement] })
    );
    write(outcome);
  }
  return read().fundingState;
}

/** Connected EVM wallet through wagmi actions. */
function evmSender(config: Config): IntentFundingSender {
  const chainOf = (record: IntentRecord) => {
    const chainId = record.source.evmChainId;
    if (!chainId)
      throw new IntentFundingBlockedError(
        "Connect a wallet on this network to send from it, or send to the deposit address from any wallet."
      );
    return chainId;
  };
  const assertAccount = (record: IntentRecord, chainId?: number) => {
    const wallet = getAccount(config);
    if (
      !wallet.isConnected ||
      wallet.address?.toLowerCase() !== record.sourceWallet ||
      (chainId !== undefined && wallet.chainId !== chainId)
    )
      throw new IntentFundingBlockedError(
        chainId === undefined
          ? "Your source wallet changed. Reconnect the wallet you reviewed the deposit with."
          : `Keep your wallet connected to ${record.source.networkName} with the same account.`
      );
    return wallet;
  };
  return {
    async checkWallet(record) {
      chainOf(record);
      assertAccount(record);
    },
    blocker: (record, instructions) =>
      getEvmFundingBlocker(record.source, instructions),
    async prepare(record, amount) {
      const chainId = chainOf(record);
      const wallet = assertAccount(record);
      if (wallet.chainId !== chainId) await switchChain(config, { chainId });
      const owner = wallet.address!;
      const balance =
        record.source.kind === "native"
          ? (await getBalance(config, { address: owner, chainId })).value
          : await readContract(config, {
              address: record.source.contractAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [owner],
              chainId,
            });
      if (balance < amount)
        throw new IntentFundingBlockedError(
          `Insufficient ${record.source.symbol} balance on ${record.source.networkName}.`
        );
      assertAccount(record, chainId);
    },
    async send(record, instructions) {
      const call = buildIntentFundingCall(record.source, instructions);
      const account = record.sourceWallet as `0x${string}`;
      const hash: Hash =
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
      return hash.toLowerCase();
    },
    classify: classifyIntentFundingError,
    message: getIntentFundingErrorMessage,
    // Only a repriced replacement is the same transfer; a cancel or a
    // different transaction leaves the funding outcome unknown.
    async confirm(record, hash, addHash) {
      let replacementReason: string | undefined;
      try {
        const receipt = await waitForTransactionReceipt(config, {
          chainId: chainOf(record),
          hash: hash as Hash,
          confirmations: INTENTS_FUNDING_CONFIRMATIONS,
          timeout: INTENTS_FUNDING_TIMEOUT_MS,
          onReplaced: (replacement) => {
            replacementReason = replacement.reason;
            if (replacement.reason === "repriced")
              addHash(replacement.transaction.hash.toLowerCase());
          },
        });
        return replacementReason && replacementReason !== "repriced"
          ? {
              fundingState: "unknown",
              fundingError:
                "The transfer was replaced or cancelled in your wallet. Check it before sending anything else.",
            }
          : receipt.status === "success"
            ? { fundingState: "confirmed", fundingError: undefined }
            : {
                fundingState: "reverted",
                fundingError: `The transfer failed on ${record.source.networkName}. Start a new deposit to try again.`,
              };
      } catch (error) {
        return {
          fundingState: "unknown",
          fundingError: `The transfer was sent, but its confirmation could not be checked (${getIntentFundingErrorMessage(error)}). Do not send it again; tracking continues.`,
        };
      }
    },
  };
}

/** Funds an EVM deposit from the connected wagmi wallet. */
export const executeIntentFunding = ({ config, ...params }: FundingParams) =>
  runIntentFunding(params, evmSender(config));

/**
 * A Solana, NEAR, Aptos or Bitcoin wallet. The account is re-checked before
 * sending; there is no receipt wait: the deposit stays "broadcast" until
 * 1Click reports it.
 */
function walletSender(
  adapter: IntentWalletAdapter,
  walletId: string
): IntentFundingSender {
  return {
    async checkWallet(record) {
      if (record.source.family !== adapter.family)
        throw new IntentFundingBlockedError(
          `Connect a ${record.source.networkName} wallet to send from it.`
        );
      const account = await adapter.getAccount(walletId);
      if (
        !account ||
        !isSameNetworkAddress(record.source, account, record.sourceWallet!)
      )
        throw new IntentFundingBlockedError(
          "Your source wallet changed. Reconnect the wallet you reviewed the deposit with."
        );
    },
    blocker: (_record, instructions) =>
      instructions.depositMemo !== null
        ? "This deposit needs a memo. Send it from a wallet that supports memos, using the details on screen."
        : null,
    async prepare(record, amount) {
      const balance = await adapter.getBalance(
        record.source,
        record.sourceWallet!
      );
      if (balance < amount)
        throw new IntentFundingBlockedError(
          `Insufficient ${record.source.symbol} balance on ${record.source.networkName}.`
        );
    },
    async send(record, instructions) {
      return adapter.send(walletId, {
        asset: record.source,
        from: record.sourceWallet!,
        to: instructions.depositAddress,
        amount: BigInt(instructions.amount),
      });
    },
    classify: classifyIntentWalletError,
    message: getIntentWalletErrorMessage,
  };
}

/** Funds a non-EVM deposit from a connected Solana, NEAR, Aptos or Bitcoin wallet. */
export const executeIntentWalletFunding = ({
  adapter,
  walletId,
  ...params
}: Omit<FundingParams, "config"> & {
  adapter: IntentWalletAdapter;
  walletId: string;
}) => runIntentFunding(params, walletSender(adapter, walletId));

/**
 * The user sent (or will send) the deposit from another wallet or an
 * exchange. Recorded so the operation joins the widget and is never offered
 * to a connected wallet; 1Click detects the deposit itself. Only allowed
 * while the instructions are published and nothing was sent from here.
 */
export function markIntentSentExternally(
  session: IntentOperations,
  localId: string
) {
  const record = session.get(localId);
  if (
    !record?.operationId ||
    !canRequestIntentFunding(record.fundingState) ||
    record.backend?.fundingStatus !== "AVAILABLE"
  )
    return false;
  return session.upsert({
    ...record,
    fundingState: "external",
    fundingError: undefined,
    lastInstructions: record.backend.fundingInstructions ?? undefined,
    isWidgetRequested: true,
    sequence: record.sequence + 1,
  });
}

/**
 * Mock mode only: tells the simulator a deposit arrived, without a wallet,
 * so the UI can be exercised end to end. Never available with the HTTP API.
 */
export function simulateIntentFunding(
  api: IntentsApi,
  session: IntentOperations,
  localId: string
) {
  if (api.env !== "mock")
    throw new Error("Simulation is only available in mock mode.");
  const record = session.get(localId);
  if (!record?.operationId || !markIntentSentExternally(session, localId))
    return;
  simulateMockDeposit(api, record.capability, record.operationId);
}
