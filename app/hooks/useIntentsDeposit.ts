import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { BigNumber } from "bignumber.js";
import { useSwitchChain } from "wagmi";

import {
  INTENTS_DEFAULT_SLIPPAGE_BPS,
  INTENTS_REHEARSAL,
} from "~/consts/intents";
import { useIntentsRoutes } from "~/hooks/useIntentsRoutes";
import {
  getIntentsApi,
  IntentsApiError,
  isIntentsApiError,
  type IntentOperationRequest,
} from "~/lib/apis/intents";
import {
  canRequestIntentFunding,
  simulateIntentFunding,
} from "~/contracts/intentsFunding.contract";
import {
  newIdempotencyKey,
  newOperationCapability,
} from "~/lib/intents/intentCapability";
import {
  createIntentRecord,
  getInstructionsMismatch,
  getOperationMismatch,
  hasIntentFundsObserved,
  type IntentRecord,
} from "~/lib/intents/intentOperation";
import {
  estimateAcceptedMinAmountOut,
  getIntentErrorCopy,
  getIntentRequestKey,
  isIntentInstructionsExpired,
  isRetryableIntentError,
} from "~/lib/intents/intentQuote";
import {
  formatRawAmount,
  getIntentAmountError,
  getIntentSlippageError,
  intentRouteAvailabilityCopy,
  isIntentRecipient,
  toRawAmount,
  type IntentRouteOption,
} from "~/lib/intents/intentRoute";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";
import { useIntentSourceBalance } from "~/providers/EthereumProvider/hooks/useIntentSourceBalance";
import { useIntentsFunding } from "~/providers/EthereumProvider/hooks/useIntentsFunding";
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
  option: IntentRouteOption;
  /** Exact body for POST /v1/operations. */
  request: IntentOperationRequest;
  /** Estimated output before slippage (settlement units), display only. */
  expectedAmountOut: string;
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
  const catalog = useIntentsRoutes();
  const { account, intentSession, refreshIntent } = useTransactionsContext();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [slippageBps, setSlippageBps] = useState(INTENTS_DEFAULT_SLIPPAGE_BPS);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [review, setReview] = useState<IntentsReview>({ phase: "form" });
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
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

  const selected = useMemo(
    () =>
      catalog.options.find((option) => option.route.id === selectedRouteId) ??
      catalog.options.find((option) => option.availability === "available") ??
      catalog.options[0],
    [catalog.options, selectedRouteId]
  );
  const route = selected?.route;
  const source = selected?.source;
  const isRouteAvailable = selected?.availability === "available";
  const sourceAddress = ethereumWallet.userAddress;
  const sourceBalance = useIntentSourceBalance(
    source,
    sourceAddress,
    isRouteAvailable
  );
  const isWrongNetwork = Boolean(
    source &&
      ethereumWallet.isConnected &&
      ethereumWallet.chainId !== source.chainId
  );
  const routeError =
    selected && selected.availability !== "available"
      ? intentRouteAvailabilityCopy[selected.availability]
      : null;
  const amountIn =
    route && amount ? toRawAmount(amount, route.sourceDecimals) : null;
  const estimate = useMemo(
    () =>
      selected?.source && selected.destination && amountIn && amountIn !== "0"
        ? estimateAcceptedMinAmountOut({
            amountIn,
            sourceDecimals: selected.route.sourceDecimals,
            settlementDecimals: selected.route.settlementDecimals,
            destinationDecimals: selected.destination.decimals,
            pricing: selected.source.pricing,
            feeAllowanceBps: selected.source.feeAllowanceBps,
            slippageBps,
          })
        : null,
    [amountIn, selected, slippageBps]
  );
  const slippageError = selected
    ? getIntentSlippageError(selected, slippageBps)
    : null;
  const amountError = selected
    ? (getIntentAmountError(selected, amount, sourceBalance.balance) ??
      (amountIn && route && selected.destination
        ? !estimate || new BigNumber(estimate.minimum).lt(route.minAmountOut)
          ? `The minimum you would receive must be at least ${formatRawAmount(
              route.minAmountOut,
              route.settlementDecimals
            )} ${selected.destination.symbol}. Enter a larger amount or lower the slippage.`
          : null
        : null))
    : null;
  // The connected Mavryk wallet must be the authenticated tracking account.
  const sessionError =
    recipient && (!intentSession || account !== recipient)
      ? "Your Equiteez session is not ready. Reconnect your Mavryk wallet to continue."
      : recipient && !isIntentRecipient(recipient)
        ? "This route can only deliver to mv1 Mavryk accounts. Use Bridge From Ethereum or Receive On Mavryk instead."
        : null;
  const canReview = Boolean(
    route &&
      isRouteAvailable &&
      recipient &&
      sourceAddress &&
      estimate &&
      !amountError &&
      !slippageError &&
      !sessionError &&
      sourceBalance.status === "ready"
  );
  const requestKey = getIntentRequestKey({
    account,
    sourceAddress,
    routeId: route?.id,
    routeVersion: route?.version,
    amountIn,
    slippageBps,
  });
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
    resetReview(
      "The deposit was cleared because your account, wallet, amount or slippage changed."
    );
  }, [requestKey, intentSession, review, resetReview, hasFundingStarted]);

  // Once the wallet returned (or a reload left the prompt open), or the
  // backend saw funds, the modal follows the operation instead of the quote.
  const isPrompting = Boolean(funding.busyId);
  useEffect(() => {
    if (review.phase !== "operation" || !activeRecord) return;
    const { fundingState } = activeRecord;
    if (
      fundingState === "broadcast" ||
      fundingState === "confirmed" ||
      fundingState === "unknown" ||
      fundingState === "reverted" ||
      (fundingState === "prompted" && !isPrompting) ||
      hasIntentFundsObserved(activeRecord.backend)
    )
      setReview({
        phase: "tracking",
        session: review.session,
        localId: review.localId,
      });
  }, [review, activeRecord, isPrompting]);

  // Countdown clock while instructions may be on screen.
  const isOperationOpen = review.phase === "operation";
  useEffect(() => {
    if (!isOperationOpen) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, [isOperationOpen]);

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
        "No quote met your minimum. Try a higher slippage tolerance or a different amount."
      );
    else if (operationView?.status === "expired")
      resetReview(
        "The quote expired before funding. Review again for a new quote."
      );
  }, [activeRecord, operationView, resetReview, review.phase]);

  /** Local review: builds the exact request. Nothing is sent yet. */
  const startReview = useCallback(() => {
    if (
      !canReview ||
      !selected ||
      !route ||
      !amountIn ||
      !estimate ||
      !account ||
      !sourceAddress ||
      !intentSession
    )
      return;
    runRef.current += 1;
    const wallet = sourceAddress.toLowerCase() as `0x${string}`;
    setReviewError(null);
    setReview({
      phase: "review",
      key: requestKey,
      session: intentSession,
      option: selected,
      request: {
        routeId: route.id,
        routeVersion: route.version,
        sourceAddress: wallet,
        recipient: account,
        // 1Click refunds go back to the funding wallet on the source chain.
        refundAddress: wallet,
        amountIn,
        slippageBps,
        acceptedMinAmountOut: estimate.minimum,
      },
      expectedAmountOut: estimate.expected,
      localId: newIdempotencyKey(),
    });
  }, [
    account,
    amountIn,
    canReview,
    estimate,
    intentSession,
    requestKey,
    route,
    selected,
    slippageBps,
    sourceAddress,
  ]);

  /**
   * Persist capability + idempotency key + exact request, then POST. A lost
   * response is retried with the same three; only a definitive rejection
   * needs a fresh scope (backend.md §2).
   */
  const confirmRequest = useCallback(async () => {
    if (busyRef.current || review.phase !== "review") return;
    busyRef.current = true;
    const runId = ++runRef.current;
    const current = review;
    const { session, localId } = current;
    const isCurrent = () =>
      runId === runRef.current &&
      sessionRef.current === session &&
      keyRef.current === current.key;
    setReviewError(null);
    try {
      let record = session.get(localId);
      if (!record) {
        // The rehearsal admits one pre-approved scope. It is reused only
        // while no operation was created with it (a definitive rejection
        // created nothing); afterwards new intents get random scopes.
        const rehearsal = INTENTS_REHEARSAL;
        const usesRehearsal =
          rehearsal &&
          ![...session.getSnapshot().records.values()].some(
            (item) =>
              item.idempotencyKey === rehearsal.idempotencyKey &&
              (item.operationId || item.fundingState !== "abandoned")
          );
        record = createIntentRecord({
          localId,
          account: session.account,
          env: session.env,
          option: current.option,
          request: current.request,
          expectedAmountOut: current.expectedAmountOut,
          credentials: usesRehearsal
            ? rehearsal
            : {
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
      setReviewError(
        isIntentsApiError(error)
          ? getIntentErrorCopy(apiError)
          : (error as Error).message
      );
    } finally {
      busyRef.current = false;
    }
  }, [abandon, refreshIntent, review]);

  /** The single user signature: fund the 1Click deposit address. */
  const fund = useCallback(async () => {
    const current = reviewRef.current;
    if (current.phase !== "operation") return;
    const { session, localId } = current;
    const quoteId = session.get(localId)?.backend?.fundingInstructions?.quoteId;
    if (!quoteId) return;
    await funding.fund(
      session,
      localId,
      quoteId,
      () =>
        sessionRef.current === session &&
        "localId" in reviewRef.current &&
        reviewRef.current.localId === localId
    );
  }, [funding]);

  const api = getIntentsApi();
  const simulateFunding = useMemo(
    () =>
      api.env === "mock" && api.simulateDeposit
        ? () => {
            const current = reviewRef.current;
            if (current.phase === "operation")
              simulateIntentFunding(api, current.session, current.localId);
          }
        : undefined,
    [api]
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

  const selectRoute = useCallback(
    (routeId: string) => {
      resetReview();
      setSelectedRouteId(routeId);
      setAmount(undefined);
      setNetworkError(null);
    },
    [resetReview]
  );

  const switchToSource = useCallback(async () => {
    if (!source) return;
    setNetworkError(null);
    try {
      await switchChainAsync({ chainId: source.chainId });
    } catch {
      setNetworkError(
        `Unable to switch networks. Select ${source.chainName} in your wallet and try again.`
      );
    }
  }, [source, switchChainAsync]);

  const resetForm = useCallback(() => {
    resetReview();
    setAmount(undefined);
    setNetworkError(null);
  }, [resetReview]);

  return {
    catalog,
    selected,
    route,
    source,
    routeError,
    recipient,
    sourceAddress,
    sourceBalance,
    amount,
    setAmount,
    amountError,
    slippageBps,
    setSlippageBps,
    slippageError,
    estimate,
    canReview,
    isWrongNetwork,
    isSwitching,
    networkError,
    sessionError,
    selectRoute,
    switchToSource,
    resetForm,
    review,
    reviewError,
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
    simulateFunding,
    isFunding: Boolean(funding.busyId),
    fundingError: funding.error,
  };
}

export type IntentsDepositController = ReturnType<typeof useIntentsDeposit>;
