import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { BigNumber } from "bignumber.js";
import { v4 as uuid } from "uuid";
import { useSwitchChain } from "wagmi";

import { useIntentsRoutes } from "~/hooks/useIntentsRoutes";
import {
  getIntentsApi,
  IntentsApiError,
  isIntentsApiError,
  type IntentOperation,
  type IntentQuote,
  type IntentRoute,
} from "~/lib/apis/intents";
import {
  createIntentRecord,
  getOperationMismatch,
  type IntentRecord,
} from "~/lib/intents/intentOperation";
import {
  canRequestIntentFunding,
  simulateIntentFunding,
} from "~/contracts/intentsFunding.contract";
import {
  getIntentErrorCopy,
  getIntentQuoteKey,
  hasMaterialQuoteChange,
  isDefinitiveIntentRejection,
  isIntentQuoteExpired,
} from "~/lib/intents/intentQuote";
import {
  getIntentAmountError,
  intentRouteAvailabilityCopy,
  toRawAmount,
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
  /** Inputs the quote was requested for; a different key invalidates it. */
  key: string;
  session: IntentOperations;
  route: IntentRoute;
  amountIn: string;
  sourceAddress: `0x${string}`;
};
export type IntentsReview =
  | { phase: "form" }
  | (ReviewBase & { phase: "quoting" })
  | (ReviewBase & {
      phase: "review" | "creating";
      preview: IntentQuote;
      /** Idempotency key for this confirmation; reused on retry. */
      localId: string;
    })
  | (ReviewBase & {
      phase: "reconfirm" | "ready";
      preview: IntentQuote;
      localId: string;
      operation: IntentOperation;
    })
  /** A committed operation shown in the modal (same model as the widget). */
  | { phase: "tracking"; session: IntentOperations; localId: string };

const noRecords: ReadonlyMap<string, IntentRecord> = new Map();
const noSubscribe = () => () => {};

const toApiError = (error: unknown) =>
  isIntentsApiError(error)
    ? error
    : new IntentsApiError(
        "internal",
        error instanceof Error ? error.message : "Unexpected error."
      );

/** Orchestrates the 1Click deposit inside Deposit Funds. */
export function useIntentsDeposit({ recipient, ethereumWallet }: Params) {
  const catalog = useIntentsRoutes();
  const { account, intentSession, refreshIntent } = useTransactionsContext();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [amount, setAmount] = useState<BigNumber | undefined>();
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
  // Once a wallet request was made, the operation outlives quote inputs.
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
  const isRouteAvailable = selected?.availability === "available";
  const sourceAddress = ethereumWallet.userAddress;
  const sourceBalance = useIntentSourceBalance(
    route,
    sourceAddress,
    isRouteAvailable
  );
  const isWrongNetwork = Boolean(
    route &&
      ethereumWallet.isConnected &&
      ethereumWallet.chainId !== route.source.chainId
  );
  const routeError =
    selected && selected.availability !== "available"
      ? intentRouteAvailabilityCopy[selected.availability]
      : null;
  const amountError = route
    ? getIntentAmountError(route, amount, sourceBalance.balance)
    : null;
  const amountIn =
    route && amount ? toRawAmount(amount, route.source.token.decimals) : null;
  // The connected Mavryk wallet must be the authenticated tracking account.
  const sessionError =
    recipient && (!intentSession || account !== recipient)
      ? "Your Equiteez session is not ready. Reconnect your Mavryk wallet to continue."
      : null;
  const canReview = Boolean(
    route &&
      isRouteAvailable &&
      recipient &&
      sourceAddress &&
      !amountError &&
      !sessionError &&
      sourceBalance.status === "ready"
  );
  const quoteKey = getIntentQuoteKey({
    account,
    sourceAddress,
    routeId: route?.id,
    amountIn,
  });
  const keyRef = useRef(quoteKey);
  keyRef.current = quoteKey;
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

  // Invalidate the quote when the account, session, source wallet, route or
  // amount changes before funding starts.
  // A changed Equiteez session always leaves the view (never show another
  // account's operation); other changes only matter before funding starts.
  useEffect(() => {
    if (review.phase === "form") return;
    if (review.session !== intentSession) {
      const old =
        "localId" in review ? review.session.get(review.localId) : undefined;
      const wasFunded =
        old &&
        old.fundingState !== "abandoned" &&
        !canRequestIntentFunding(old.fundingState);
      resetReview(
        wasFunded ? null : "The quote was cleared because your account changed."
      );
      return;
    }
    if (review.phase === "tracking") return;
    if (review.key === quoteKey || hasFundingStarted) return;
    resetReview(
      "The quote was cleared because your account, wallet or amount changed."
    );
  }, [quoteKey, intentSession, review, resetReview, hasFundingStarted]);

  // Countdown clock for quote expiry while a quote is on screen.
  // Once the wallet returned (or a reload left the prompt open), the modal
  // follows the operation instead of the quote.
  const isPrompting = Boolean(funding.busyId);
  useEffect(() => {
    if (review.phase !== "ready" || !activeRecord) return;
    const { fundingState } = activeRecord;
    if (
      fundingState === "broadcast" ||
      fundingState === "confirmed" ||
      fundingState === "unknown" ||
      fundingState === "reverted" ||
      (fundingState === "prompted" && !isPrompting)
    )
      setReview({
        phase: "tracking",
        session: review.session,
        localId: review.localId,
      });
  }, [review, activeRecord, isPrompting]);

  const hasQuote =
    review.phase !== "form" &&
    review.phase !== "quoting" &&
    review.phase !== "tracking";
  useEffect(() => {
    if (!hasQuote) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, [hasQuote]);

  // An executable quote that expires before funding is dropped.
  useEffect(() => {
    if (
      (review.phase === "ready" || review.phase === "reconfirm") &&
      isIntentQuoteExpired(review.operation.quoteExpiresAt, now)
    ) {
      const record = review.session.get(review.localId);
      if (record?.fundingState === "not_started")
        resetReview("The quote expired before funding. Start a new deposit.");
    }
  }, [now, review, resetReview]);

  const requestPreview = useCallback(async () => {
    if (
      !canReview ||
      !route ||
      !amountIn ||
      !account ||
      !sourceAddress ||
      !intentSession
    )
      return;
    const runId = ++runRef.current;
    const base: ReviewBase = {
      key: quoteKey,
      session: intentSession,
      route,
      amountIn,
      sourceAddress,
    };
    setReviewError(null);
    setReview({ ...base, phase: "quoting" });
    try {
      const preview = await getIntentsApi().getQuote({
        routeId: route.id,
        amountIn,
        recipient: account,
      });
      if (runId !== runRef.current) return; // stale response
      if (
        preview.recipient !== account ||
        preview.amountIn !== amountIn ||
        preview.routeId !== route.id
      )
        throw new IntentsApiError(
          "invalid_response",
          "The quote does not match your request."
        );
      setReview({ ...base, phase: "review", preview, localId: uuid() });
    } catch (error) {
      if (runId !== runRef.current) return;
      setReview({ phase: "form" });
      setReviewError(getIntentErrorCopy(toApiError(error)));
    }
  }, [
    account,
    amountIn,
    canReview,
    intentSession,
    quoteKey,
    route,
    sourceAddress,
  ]);

  /** Persist locally, then ask the backend to persist the executable operation. */
  const confirmQuote = useCallback(async () => {
    if (busyRef.current || review.phase !== "review") return;
    if (isIntentQuoteExpired(review.preview.expiresAt)) {
      setReviewError("The quote expired. Refresh it to continue.");
      return;
    }
    busyRef.current = true;
    const runId = ++runRef.current;
    const current = review;
    const { session, localId, route: quotedRoute } = current;
    const isCurrent = () =>
      runId === runRef.current &&
      sessionRef.current === session &&
      keyRef.current === current.key;
    setReviewError(null);
    if (!session.get(localId))
      session.upsert(
        createIntentRecord({
          localId,
          account: session.account,
          env: session.env,
          route: quotedRoute,
          amountIn: current.amountIn,
          sourceAddress: current.sourceAddress,
        })
      );
    setReview({ ...current, phase: "creating" });
    try {
      const operation = await getIntentsApi().createOperation({
        routeId: quotedRoute.id,
        amountIn: current.amountIn,
        recipient: session.account,
        sourceAddress: current.sourceAddress,
        idempotencyKey: localId,
      });
      session.applyBackend(localId, operation);
      const record = session.get(localId);
      if (!record) throw new Error("Deposit record is unavailable.");
      const mismatch = getOperationMismatch(record, operation, quotedRoute);
      const isStale = !isCurrent();
      // Persisted before any funding prompt can be shown.
      session.upsert({
        ...record,
        operationId: operation.id,
        amountOut: operation.amountOut,
        minAmountOut: operation.minAmountOut,
        quoteExpiresAt: operation.quoteExpiresAt,
        funding: operation.funding,
        fundingState: mismatch || isStale ? "abandoned" : "not_started",
        fundingError: mismatch
          ? `Backend operation ${mismatch} does not match the request.`
          : undefined,
        sequence: record.sequence + 1,
      });
      if (isStale) return; // Late response for an old account/quote.
      if (mismatch) {
        setReview({ phase: "form" });
        setReviewError(
          "The deposit service returned an operation that does not match your request. Nothing was sent."
        );
        return;
      }
      if (isIntentQuoteExpired(operation.quoteExpiresAt)) {
        abandon(session, localId);
        setReview({ ...current, phase: "review", localId: uuid() });
        setReviewError("The quote expired. Refresh it to continue.");
        return;
      }
      setReview({
        ...current,
        phase: hasMaterialQuoteChange(current.preview, operation)
          ? "reconfirm"
          : "ready",
        operation,
      });
    } catch (error) {
      if (!isCurrent()) return;
      const apiError = toApiError(error);
      // A definitive rejection created nothing; the next attempt needs a new
      // key. Transport errors keep the key so a retry returns the same operation.
      const isDefinitive = isDefinitiveIntentRejection(apiError);
      if (isDefinitive) abandon(session, localId);
      setReview({
        ...current,
        phase: "review",
        localId: isDefinitive ? uuid() : localId,
      });
      setReviewError(getIntentErrorCopy(apiError));
    } finally {
      busyRef.current = false;
    }
  }, [abandon, review]);

  /** The single user signature: fund the 1Click deposit address. */
  const fund = useCallback(async () => {
    const current = reviewRef.current;
    if (current.phase !== "ready") return;
    const { session, localId } = current;
    await funding.fund(
      session,
      localId,
      () =>
        sessionRef.current === session &&
        "localId" in reviewRef.current &&
        reviewRef.current.localId === localId
    );
  }, [funding]);

  const api = getIntentsApi();
  const simulateFunding = useMemo(
    () =>
      api.env === "mock"
        ? () => {
            const current = reviewRef.current;
            if (current.phase === "ready")
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

  const acceptUpdatedQuote = useCallback(() => {
    setReview((current) =>
      current.phase === "reconfirm" ? { ...current, phase: "ready" } : current
    );
  }, []);

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
    if (!route) return;
    setNetworkError(null);
    try {
      await switchChainAsync({ chainId: route.source.chainId });
    } catch {
      setNetworkError(
        `Unable to switch networks. Select ${route.source.chainName} in your wallet and try again.`
      );
    }
  }, [route, switchChainAsync]);

  const resetForm = useCallback(() => {
    resetReview();
    setAmount(undefined);
    setNetworkError(null);
  }, [resetReview]);

  return {
    catalog,
    selected,
    route,
    routeError,
    recipient,
    sourceAddress,
    sourceBalance,
    amount,
    setAmount,
    amountError,
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
    requestPreview,
    confirmQuote,
    acceptUpdatedQuote,
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
