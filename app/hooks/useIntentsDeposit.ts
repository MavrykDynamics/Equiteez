import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { BigNumber } from "bignumber.js";
import { useConfig, useSwitchChain } from "wagmi";

import { INTENTS_DEFAULT_SLIPPAGE_BPS } from "~/consts/intents";
import { useIntentsCatalog } from "~/hooks/useIntentsCatalog";
import { useIntentsPreview } from "~/hooks/useIntentsPreview";
import {
  getIntentsApi,
  IntentsApiError,
  isIntentsApiError,
  type IntentOperationRequest,
  type IntentPreview,
  type IntentPreviewRequest,
} from "~/lib/apis/intents";
import {
  canRequestIntentFunding,
  markIntentSentExternally,
  simulateIntentFunding,
} from "~/contracts/intentsFunding.contract";
import {
  intentCatalogStatusCopy,
  getIntentAmountError,
  getIntentSlippageError,
  isIntentRecipient,
  toRawAmount,
  type IntentSettlement,
  type IntentSourceOption,
} from "~/lib/intents/intentCatalog";
import {
  newIdempotencyKey,
  newOperationCapability,
} from "~/lib/intents/intentCapability";
import {
  getRefundAddressError,
  normalizeRefundAddress,
} from "~/lib/intents/intentNetworks";
import {
  createIntentRecord,
  getInstructionsMismatch,
  getOperationMismatch,
  hasIntentFundsObserved,
  type IntentRecord,
} from "~/lib/intents/intentOperation";
import {
  getAcceptedMinAmountOut,
  getIntentErrorCopy,
  getIntentRequestKey,
  isIntentCatalogChangedError,
  isIntentInstructionsExpired,
  isIntentPreviewExpired,
  isRetryableIntentError,
  toIntentPreviewRequest,
} from "~/lib/intents/intentQuote";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";
import { useIntentSourceBalance } from "~/providers/EthereumProvider/hooks/useIntentSourceBalance";
import { useIntentsFunding } from "~/providers/EthereumProvider/hooks/useIntentsFunding";
import { useIntentWalletsContext } from "~/providers/IntentWalletsProvider/IntentWalletsProvider";
import type { IntentWalletAccount } from "~/lib/intents/wallets";
import type { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";
import { toIntentWidget } from "~/providers/TransactionsProvider/intentWidget";
import { useTransactionsContext } from "~/providers/TransactionsProvider/TransactionsProvider";

type Params = {
  /** Active Equiteez Mavryk account: the only recipient this flow supports. */
  recipient: string | null;
  ethereumWallet: EthereumContext;
};

type ReviewBase = {
  /** Inputs the request was built from; a different key invalidates it. */
  key: string;
  session: IntentOperations;
  option: IntentSourceOption;
  settlement: IntentSettlement;
  /** Exact body for POST /v1/operations. */
  request: IntentOperationRequest;
  /** The fresh preview the accepted minimum comes from. */
  preview: IntentPreview;
  /** Connected wallet that will send: an EVM address or a network wallet. */
  sourceWallet?: string | IntentWalletAccount;
  /** Local identity; its record holds the capability and idempotency key. */
  localId: string;
};
export type IntentsReview =
  | { phase: "form" }
  /** Local review of the request; nothing sent yet. */
  | (ReviewBase & { phase: "review" | "creating" })
  /** Persisted operation: preparing the quote, then showing instructions. */
  | (ReviewBase & { phase: "operation" })
  /** A committed operation shown in the modal (same model as the widget). */
  | { phase: "tracking"; session: IntentOperations; localId: string };

/** What the operation step can show, derived from the backend snapshot. */
export type IntentsOperationView =
  | { status: "preparing" }
  | { status: "ready" }
  | { status: "paused" }
  | { status: "expired" }
  | { status: "rejected" }
  | { status: "mismatch"; detail: string };

const noRecords: ReadonlyMap<string, IntentRecord> = new Map();
const noSubscribe = () => () => {};

const toApiError = (error: unknown) =>
  isIntentsApiError(error)
    ? error
    : new IntentsApiError(
        "UNKNOWN",
        error instanceof Error ? error.message : "Unexpected error."
      );

const errorMessage = (error: unknown) =>
  isIntentsApiError(error)
    ? getIntentErrorCopy(error)
    : error instanceof Error
      ? error.message
      : "Something went wrong.";

export function getIntentsOperationView(
  record: IntentRecord | undefined,
  now: number
): IntentsOperationView {
  const backend = record?.backend;
  if (!record || !backend) return { status: "preparing" };
  const mismatch = getOperationMismatch(record, backend);
  if (mismatch) return { status: "mismatch", detail: mismatch };
  if (backend.closure !== "OPEN") return { status: "rejected" };
  switch (backend.fundingStatus) {
    case "AVAILABLE": {
      const instructions = backend.fundingInstructions;
      if (!instructions) return { status: "preparing" };
      const detail = getInstructionsMismatch(record, instructions);
      if (detail) return { status: "mismatch", detail };
      return isIntentInstructionsExpired(instructions.fundingExpiresAt, now)
        ? { status: "expired" }
        : { status: "ready" };
    }
    case "PAUSED":
      return { status: "paused" };
    case "EXPIRED":
      return { status: "expired" };
    case "NOT_READY":
      return { status: "preparing" };
    default:
      // OBSERVED is handled by tracking; UNKNOWN never enables funding.
      return { status: "mismatch", detail: "funding status" };
  }
}

/** Orchestrates the 1Click deposit inside Deposit Funds. */
export function useIntentsDeposit({ recipient, ethereumWallet }: Params) {
  const catalogState = useIntentsCatalog();
  const { catalog } = catalogState;
  const { account, intentSession, refreshIntent } = useTransactionsContext();
  const { chains } = useConfig();
  const api = getIntentsApi();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [slippageBps, setSlippageBps] = useState(INTENTS_DEFAULT_SLIPPAGE_BPS);
  const [refundInput, setRefundInputState] = useState("");
  const [isRefundConfirmed, setIsRefundConfirmed] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [review, setReview] = useState<IntentsReview>({ phase: "form" });
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const [isPreparingReview, setIsPreparingReview] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const intentWallets = useIntentWalletsContext();
  const runRef = useRef(0);
  const busyRef = useRef(false);
  const funding = useIntentsFunding();
  const records = useSyncExternalStore(
    intentSession?.subscribe ?? noSubscribe,
    () => intentSession?.getSnapshot().records ?? noRecords,
    () => noRecords
  );
  const activeRecord =
    "localId" in review && review.session === intentSession
      ? records.get(review.localId)
      : undefined;
  // Once a wallet request was made, the operation outlives the inputs.
  const hasFundingStarted = Boolean(
    activeRecord &&
      activeRecord.fundingState !== "abandoned" &&
      !canRequestIntentFunding(activeRecord.fundingState)
  );

  const options = useMemo(() => catalog?.options ?? [], [catalog]);
  const settlement = catalog?.settlement;
  const selected = useMemo(
    () =>
      options.find((option) => option.assetId === selectedAssetId) ??
      options[0],
    [options, selectedAssetId]
  );
  const network = selected?.network;
  const catalogError =
    catalog && catalog.status !== "available"
      ? intentCatalogStatusCopy[catalog.status]
      : null;
  const isCatalogAvailable = catalog?.status === "available";

  // A connected wallet sends in one click: the wagmi wallet for EVM assets,
  // the network's own wallet (Solana, NEAR, Aptos, Bitcoin) otherwise. Without
  // one, any wallet or exchange pays the deposit address.
  const walletAddress = ethereumWallet.userAddress;
  const isEvmChainConfigured = Boolean(
    network?.evmChainId &&
      chains.some((chain) => chain.id === network.evmChainId)
  );
  const canEvmSend = Boolean(
    selected?.evmToken &&
      isEvmChainConfigured &&
      walletAddress &&
      ethereumWallet.isConnected
  );
  const family = network?.family;
  const nativeAccount =
    family && family !== "evm" && intentWallets.isSupported(family)
      ? intentWallets.accounts[family]
      : undefined;
  // The wallet's account must be a valid refund address on the network.
  const canNativeSend = Boolean(
    nativeAccount &&
      network &&
      !getRefundAddressError(network, nativeAccount.address)
  );
  const canWalletSend = (canEvmSend || canNativeSend) && api.env !== "mock";
  const sendingWallet: string | IntentWalletAccount | undefined = !canWalletSend
    ? undefined
    : canEvmSend
      ? walletAddress!.toLowerCase()
      : nativeAccount;
  const sourceWallet =
    typeof sendingWallet === "string" ? sendingWallet : sendingWallet?.address;
  const sendingWalletName = canEvmSend
    ? undefined
    : canWalletSend
      ? nativeAccount?.walletName
      : undefined;
  const sourceBalance = useIntentSourceBalance(selected, sourceWallet ?? null);
  const isWrongNetwork = Boolean(
    canWalletSend &&
      canEvmSend &&
      ethereumWallet.chainId !== network?.evmChainId
  );

  // Refunds go to the sending wallet when there is one; otherwise to an
  // address the user pastes and confirms (backend.md §6.2, §7).
  const isRefundFromWallet = Boolean(sourceWallet);
  const refundAddress =
    network && (sourceWallet ?? refundInput.trim())
      ? normalizeRefundAddress(network, sourceWallet ?? refundInput)
      : "";
  const refundError =
    network && !isRefundFromWallet && refundInput.trim()
      ? getRefundAddressError(network, refundInput)
      : null;
  const isRefundReady = Boolean(
    network &&
      refundAddress &&
      (isRefundFromWallet ||
        (!getRefundAddressError(network, refundInput) && isRefundConfirmed))
  );

  const decimals = selected?.asset.decimals ?? 0;
  const amountIn = selected && amount ? toRawAmount(amount, decimals) : null;
  const amountError = selected
    ? getIntentAmountError(
        selected,
        amount,
        canWalletSend ? sourceBalance.balance : undefined
      )
    : null;
  const slippageError = getIntentSlippageError(slippageBps);
  // The connected Mavryk wallet must be the authenticated tracking account.
  const sessionError =
    recipient && (!intentSession || account !== recipient)
      ? "Your Equiteez session is not ready. Reconnect your Mavryk wallet to continue."
      : recipient && !isIntentRecipient(recipient)
        ? "Cross-chain deposits can only go to mv1 Mavryk accounts. Use Receive On Mavryk instead."
        : null;

  // The refund address is validated before any price (backend.md §6.2).
  const previewRequest = useMemo<IntentPreviewRequest | null>(
    () =>
      isCatalogAvailable &&
      selected &&
      settlement &&
      account &&
      recipient === account &&
      !sessionError &&
      amountIn &&
      amountIn !== "0" &&
      !amountError &&
      !slippageError &&
      network &&
      refundAddress &&
      !getRefundAddressError(network, refundAddress)
        ? {
            sourceAssetId: selected.assetId,
            settlementTokenId: settlement.id,
            settlementTokenVersion: settlement.version,
            recipient: account,
            refundAddress,
            amountIn,
            slippageBps,
          }
        : null,
    [
      account,
      amountError,
      amountIn,
      isCatalogAvailable,
      network,
      recipient,
      refundAddress,
      selected,
      sessionError,
      settlement,
      slippageBps,
      slippageError,
    ]
  );
  const preview = useIntentsPreview(previewRequest);
  const previewError = preview.error ? getIntentErrorCopy(preview.error) : null;

  const canReview = Boolean(
    previewRequest &&
      preview.status === "ready" &&
      isRefundReady &&
      (!canWalletSend || sourceBalance.status === "ready") &&
      !isPreparingReview
  );
  const requestKey = `${getIntentRequestKey({
    account,
    ...(previewRequest ?? {}),
  })}|${sourceWallet ?? ""}`;
  const keyRef = useRef(requestKey);
  keyRef.current = requestKey;
  const sessionRef = useRef(intentSession);
  sessionRef.current = intentSession;

  /** Drops an operation that was never funded so it is neither shown nor sent. */
  const abandon = useCallback((session: IntentOperations, localId: string) => {
    const record = session.get(localId);
    if (record?.fundingState === "not_started")
      session.upsert({
        ...record,
        fundingState: "abandoned",
        sequence: record.sequence + 1,
      });
  }, []);

  const reviewRef = useRef(review);
  reviewRef.current = review;
  const resetReview = useCallback(
    (error: string | null = null) => {
      runRef.current += 1;
      const current = reviewRef.current;
      if ("localId" in current) abandon(current.session, current.localId);
      setReview({ phase: "form" });
      setReviewError(error);
      setReviewNotice(null);
      setIsPreparingReview(false);
    },
    [abandon]
  );

  // A changed Equiteez session always leaves the view (never show another
  // account's operation); other input changes only matter before funding.
  useEffect(() => {
    if (review.phase === "form") return;
    if (review.session !== intentSession) {
      const old = review.session.get(review.localId);
      const wasFunded =
        old &&
        old.fundingState !== "abandoned" &&
        !canRequestIntentFunding(old.fundingState);
      resetReview(
        wasFunded
          ? null
          : "The deposit was cleared because your account changed."
      );
      return;
    }
    if (review.phase === "tracking") return;
    if (review.key === requestKey || hasFundingStarted) return;
    // Published instructions stay on screen: the user may already have paid
    // the address from another wallet. Only an unpublished review is reset.
    if (review.phase === "operation" && activeRecord?.lastInstructions) return;
    resetReview(
      "The deposit was cleared because your account, wallet, amount, refund address or slippage changed."
    );
  }, [
    activeRecord,
    requestKey,
    intentSession,
    review,
    resetReview,
    hasFundingStarted,
  ]);

  // Once the wallet returned (or a reload left the prompt open), the user
  // reported sending, or the backend saw funds, the modal follows the
  // operation instead of the deposit screen.
  const isPrompting = Boolean(funding.busyId);
  useEffect(() => {
    if (review.phase !== "operation" || !activeRecord) return;
    const { fundingState } = activeRecord;
    if (
      fundingState === "broadcast" ||
      fundingState === "confirmed" ||
      fundingState === "unknown" ||
      fundingState === "reverted" ||
      fundingState === "external" ||
      (fundingState === "prompted" && !isPrompting) ||
      hasIntentFundsObserved(activeRecord.backend)
    )
      setReview({
        phase: "tracking",
        session: review.session,
        localId: review.localId,
      });
  }, [review, activeRecord, isPrompting]);

  // Countdown clock while a preview or instructions may be on screen.
  const isClockNeeded =
    review.phase === "operation" || review.phase === "review";
  useEffect(() => {
    if (!isClockNeeded) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, [isClockNeeded]);

  const operationView = useMemo(
    () =>
      review.phase === "operation"
        ? getIntentsOperationView(activeRecord, now)
        : null,
    [activeRecord, now, review.phase]
  );

  // A rejected quote (no executable quote met the accepted minimum) or one
  // that expired before funding goes back to the form; nothing was sent.
  useEffect(() => {
    if (review.phase !== "operation" || !activeRecord) return;
    if (activeRecord.fundingState !== "not_started") return;
    if (operationView?.status === "rejected")
      resetReview(
        "We couldn't get a price that meets your minimum. Nothing was sent. Try a higher slippage tolerance or a different amount."
      );
    else if (operationView?.status === "expired")
      resetReview(
        "The deposit window closed. Do not send to that address; review again for a new one."
      );
  }, [activeRecord, operationView, resetReview, review.phase]);

  /**
   * Local review: refreshes metadata and the price, then builds the exact
   * request from the fresh preview (backend.md §6.1–6.3). Nothing is sent.
   */
  const startReview = useCallback(async () => {
    if (
      !canReview ||
      !selected ||
      !settlement ||
      !previewRequest ||
      !intentSession
    )
      return;
    const runId = ++runRef.current;
    const key = requestKey;
    setReviewError(null);
    setReviewNotice(null);
    setIsPreparingReview(true);
    try {
      const metadata = await catalogState.refetch();
      if (runId !== runRef.current) return;
      if (metadata.error) throw metadata.error;
      const fresh = await preview.fetchFresh(previewRequest);
      if (runId !== runRef.current || keyRef.current !== key) return;
      setReview({
        phase: "review",
        key,
        session: intentSession,
        option: selected,
        settlement,
        request: {
          ...previewRequest,
          acceptedMinAmountOut: getAcceptedMinAmountOut(fresh),
        },
        preview: fresh,
        sourceWallet: sendingWallet,
        localId: newIdempotencyKey(),
      });
    } catch (error) {
      if (runId !== runRef.current) return;
      setReviewError(errorMessage(error));
    } finally {
      if (runId === runRef.current) setIsPreparingReview(false);
    }
  }, [
    canReview,
    catalogState,
    intentSession,
    preview,
    previewRequest,
    requestKey,
    selected,
    settlement,
    sendingWallet,
  ]);

  /**
   * Persist capability + idempotency key + exact request, then POST. A lost
   * response is retried with the same three; only a definitive rejection
   * needs a fresh scope (backend.md §5). An expired preview is refreshed
   * first; a changed minimum is shown for a new confirmation.
   */
  const confirmRequest = useCallback(async () => {
    if (busyRef.current || review.phase !== "review") return;
    busyRef.current = true;
    const runId = ++runRef.current;
    let current = review;
    const { session, localId } = current;
    const isCurrent = () =>
      runId === runRef.current &&
      sessionRef.current === session &&
      keyRef.current === current.key;
    setReviewError(null);
    setReviewNotice(null);
    try {
      let record = session.get(localId);
      if (!record) {
        setReview({ ...current, phase: "creating" });
        if (isIntentPreviewExpired(current.preview)) {
          // A preview takes exactly seven fields: no accepted minimum.
          const fresh = await preview.fetchFresh(
            toIntentPreviewRequest(current.request)
          );
          if (!isCurrent()) return;
          const accepted = getAcceptedMinAmountOut(fresh);
          if (accepted !== current.request.acceptedMinAmountOut) {
            setReview({
              ...current,
              phase: "review",
              preview: fresh,
              request: { ...current.request, acceptedMinAmountOut: accepted },
            });
            setReviewNotice(
              "The price changed. Check the new amounts and confirm again."
            );
            return;
          }
          current = { ...current, preview: fresh };
        }
        // Every new transfer intent gets its own random scope.
        record = createIntentRecord({
          localId,
          account: session.account,
          env: session.env,
          option: current.option,
          settlement: current.settlement,
          request: current.request,
          expectedDestinationAmount: current.preview.destinationAmountOut,
          sourceWallet: current.sourceWallet,
          credentials: {
            capability: newOperationCapability(),
            idempotencyKey: newIdempotencyKey(),
          },
        });
        // Persisted before the first POST; never regenerated for retries.
        if (!session.upsert(record) || !session.get(localId))
          throw new Error("Deposit recovery data could not be saved.");
      }
      setReview({ ...current, phase: "creating" });
      const { operation } = await getIntentsApi().createOperation(
        {
          capability: record.capability,
          idempotencyKey: record.idempotencyKey,
        },
        record.request
      );
      session.applyBackend(localId, operation);
      const saved = session.get(localId);
      if (!saved) throw new Error("Deposit record is unavailable.");
      const mismatch = getOperationMismatch(saved, operation);
      const isStale = !isCurrent();
      if (mismatch || isStale)
        session.upsert({
          ...saved,
          fundingState: "abandoned",
          fundingError: mismatch
            ? `Backend operation ${mismatch} does not match the request.`
            : undefined,
          sequence: saved.sequence + 1,
        });
      if (isStale) return; // Late response for an old account/request.
      if (mismatch) {
        setReview({ phase: "form" });
        setReviewError(
          "The deposit service returned an operation that does not match your request. Nothing was sent."
        );
        return;
      }
      // Durable, but no quote yet: the tracker polls for instructions.
      setReview({ ...current, phase: "operation" });
      refreshIntent?.(localId);
    } catch (error) {
      if (!isCurrent()) return;
      const apiError = toApiError(error);
      if (isIntentCatalogChangedError(apiError)) void catalogState.refetch();
      // A definitive rejection created nothing; the next attempt needs a new
      // scope. Lost responses keep it so a retry replays the same operation.
      const isRetryable =
        isRetryableIntentError(apiError) && Boolean(session.get(localId));
      if (!isRetryable) abandon(session, localId);
      setReview({
        ...current,
        phase: "review",
        localId: isRetryable ? localId : newIdempotencyKey(),
      });
      setReviewError(errorMessage(error));
    } finally {
      busyRef.current = false;
    }
  }, [abandon, catalogState, preview, refreshIntent, review]);

  const isCurrentOperation = useCallback(
    (session: IntentOperations, localId: string) =>
      sessionRef.current === session &&
      "localId" in reviewRef.current &&
      reviewRef.current.localId === localId,
    []
  );

  /** One-click send from the connected EVM wallet. */
  const fund = useCallback(async () => {
    const current = reviewRef.current;
    if (current.phase !== "operation") return;
    const { session, localId } = current;
    const quoteId = session.get(localId)?.backend?.fundingInstructions?.quoteId;
    if (!quoteId) return;
    await funding.fund(session, localId, quoteId, () =>
      isCurrentOperation(session, localId)
    );
  }, [funding, isCurrentOperation]);

  /** The user paid the address from another wallet or an exchange. */
  const markSent = useCallback(() => {
    const current = reviewRef.current;
    if (current.phase !== "operation") return;
    if (markIntentSentExternally(current.session, current.localId))
      refreshIntent?.(current.localId);
  }, [refreshIntent]);

  const simulateFunding = useMemo(
    () =>
      api.env === "mock"
        ? () => {
            const current = reviewRef.current;
            if (current.phase !== "operation") return;
            simulateIntentFunding(api, current.session, current.localId);
            refreshIntent?.(current.localId);
          }
        : undefined,
    [api, refreshIntent]
  );

  /**
   * Reopening Deposit Funds shows the newest committed, unfinished operation
   * of this account instead of a new form. Returns whether one was found.
   */
  const resumeActive = useCallback(() => {
    if (!intentSession) return false;
    const current = reviewRef.current;
    if (current.phase !== "form") return current.phase === "tracking";
    const active = [...intentSession.getSnapshot().records.values()]
      .filter((record) => {
        const model = toIntentWidget(record);
        return model && !model.isTerminal;
      })
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    if (!active) return false;
    setReview({
      phase: "tracking",
      session: intentSession,
      localId: active.localId,
    });
    refreshIntent?.(active.localId);
    return true;
  }, [intentSession, refreshIntent]);

  const trackedModel = useMemo(
    () => (activeRecord ? toIntentWidget(activeRecord) : null),
    [activeRecord]
  );

  /** A different asset (and network) clears the amount and refund address. */
  const selectAsset = useCallback(
    (assetId: string) => {
      resetReview();
      const next = options.find((option) => option.assetId === assetId);
      if (next?.network.key !== selected?.network.key) {
        setRefundInputState("");
        setIsRefundConfirmed(false);
      }
      setSelectedAssetId(assetId);
      setAmount(undefined);
      setNetworkError(null);
    },
    [options, resetReview, selected]
  );

  const setRefundInput = useCallback((value: string) => {
    setRefundInputState(value);
    setIsRefundConfirmed(false);
  }, []);

  const switchToSource = useCallback(async () => {
    if (!network?.evmChainId) return;
    setNetworkError(null);
    try {
      await switchChainAsync({ chainId: network.evmChainId });
    } catch {
      setNetworkError(
        `Unable to switch networks. Select ${network.name} in your wallet and try again.`
      );
    }
  }, [network, switchChainAsync]);

  const resetForm = useCallback(() => {
    resetReview();
    setAmount(undefined);
    setNetworkError(null);
  }, [resetReview]);

  return {
    catalog: {
      status: catalogState.status,
      error: catalogState.error,
      refetch: catalogState.refetch,
      options,
      settlement,
    },
    catalogError,
    selected,
    network,
    recipient,
    walletAddress,
    canWalletSend,
    sourceWallet,
    sendingWalletName,
    sourceBalance,
    amount,
    setAmount,
    amountError,
    slippageBps,
    setSlippageBps,
    slippageError,
    refundAddress,
    refundInput,
    setRefundInput,
    refundError,
    isRefundFromWallet,
    isRefundConfirmed,
    setIsRefundConfirmed,
    preview: preview.preview,
    previewStatus: preview.status,
    previewError,
    refetchPreview: preview.refetch,
    canReview,
    isPreparingReview,
    isWrongNetwork,
    isSwitching,
    networkError,
    sessionError,
    selectAsset,
    switchToSource,
    resetForm,
    review,
    reviewError,
    reviewNotice,
    now,
    startReview,
    confirmRequest,
    operationView,
    cancelReview: resetReview,
    activeRecord,
    trackedModel,
    hasFundingStarted,
    resumeActive,
    fund,
    markSent,
    simulateFunding,
    isFunding: Boolean(funding.busyId),
    fundingError: funding.error,
  };
}

export type IntentsDepositController = ReturnType<typeof useIntentsDeposit>;
