import { BigNumber } from "bignumber.js";
import { sepolia } from "wagmi/chains";
import { USDT_BRIDGE } from "~/consts/usdtBridge";
import { getBridgeDepositId } from "~/lib/apis/rwa/bridge/bridge.schema";
import { getBridgeEventId } from "./bridgeDepositEvent";
import type { BridgeTransaction } from "./bridgeTransactions";
import type { RTransactionWidgetState } from "./components/RTransactionWidget/RTransactionWidget";

export type TransactionWidgetModel = {
  operationId: string;
  backendId?: string;
  amount: string | null;
  symbol: string;
  recipient: string;
  sourceExplorerUrl?: string;
  state: RTransactionWidgetState;
  isHistorical: boolean;
};

type TrackingContext = {
  reconciliationError?: string | null;
  lastCheckedAt?: number | null;
};

function getState(
  record: BridgeTransaction,
  context: TrackingContext
): RTransactionWidgetState {
  const events = record.signerEvents ?? [];
  if (events.length) {
    // The two-signer flow in events.md completes on two distinct COMPLETED updates.
    const completed = new Set(
      events
        .filter((event) => event.status === "COMPLETED")
        .map((event) => event.signatory)
    ).size;
    if (completed >= 2) return { status: "success" };
    return {
      status: "progress",
      step: Math.min(events.length, 4) as 1 | 2 | 3 | 4,
    };
  }
  if (record.verification === "verified" && record.backend) {
    switch (record.backend.status) {
      case "executed":
        return { status: "success" };
      case "confirming":
        return {
          status: "progress",
          step: 1,
          title: "Waiting for the bridge",
          description: `Source finality usually takes 3–5 minutes.${record.backend.required_confirmations === null ? " Confirmation target unavailable." : ` Bridge target: ${record.backend.required_confirmations} source confirmations.`}`,
        };
      case "signing":
        return {
          status: "progress",
          step: 2,
          description: `Validators sign ${record.backend.signer_count}/${record.backend.signatory_threshold ?? "?"}.`,
        };
      case "stalled":
        return {
          status: "warning",
          title: "Deposit delayed",
          description:
            record.backend.reason?.trim() ||
            "Bridge settlement is delayed. Refresh status to check for updates.",
        };
      default: {
        const unsupported: never = record.backend.status;
        throw new Error(`Unsupported validated deposit status: ${unsupported}`);
      }
    }
  }
  if (
    record.verification === "local" &&
    !record.executionError &&
    record.progress?.step === "lock" &&
    record.progress.status === "confirming"
  ) {
    return {
      status: "progress",
      step: 1,
      description: `Source lock confirmations: ${record.progress.confirmations ?? "?"}/${USDT_BRIDGE.lockConfirmations}. Bridge finality is a separate wait.`,
    };
  }
  if (
    record.verification === "local" &&
    !record.backend &&
    !record.executionError &&
    !context.reconciliationError &&
    context.lastCheckedAt != null &&
    record.progress?.step === "lock" &&
    record.progress.status === "confirmed"
  ) {
    return {
      status: "waiting",
      title: "Waiting for the bridge",
      description:
        "Source transaction confirmed. Waiting for the deposit to appear in bridge status; settlement is not yet verified. Usually 3–5 minutes.",
    };
  }
  return {
    status: "warning",
    title: context.reconciliationError
      ? "Bridge status unavailable"
      : "Bridge status unverified",
    description:
      record.executionError ||
      context.reconciliationError ||
      (record.progress?.step === "lock" &&
      record.progress.status === "confirmed"
        ? "Source transaction confirmed. Bridge settlement has not yet been verified."
        : "Deposit status needs verification. Refresh status to check the last known deposit."),
  };
}

export function toTransactionWidget(
  record: BridgeTransaction,
  context: TrackingContext = {}
): TransactionWidgetModel | null {
  if (!record.backend && !record.sourceHashes.length) return null;
  const event = record.signerEvents?.[0];
  const backend = event ? undefined : record.backend;
  const isKnownEventToken =
    event?.erc_token === USDT_BRIDGE.sourceToken.address.toLowerCase();
  const sourceAddress = record.sourceToken?.address.toLowerCase();
  const backendAddress = backend?.token_evm?.toLowerCase();
  const matchesLocal = Boolean(
    sourceAddress && (!backend || backendAddress === sourceAddress)
  );
  const tokenAddress = backend ? backendAddress : sourceAddress;
  const isRawAmount =
    backend?.amount == null &&
    backend?.amount_raw !== undefined &&
    backend.decimals == null;
  const symbol =
    !backend && event
      ? isKnownEventToken
        ? USDT_BRIDGE.sourceToken.symbol
        : "raw units"
      : isRawAmount
        ? "raw units"
        : tokenAddress === USDT_BRIDGE.sourceToken.address.toLowerCase()
          ? USDT_BRIDGE.sourceToken.symbol
          : "Token amount";
  const amount =
    !backend && event
      ? isKnownEventToken
        ? new BigNumber(event.amount)
            .shiftedBy(-USDT_BRIDGE.sourceToken.decimals)
            .toFixed()
        : event.amount
      : (backend?.amount ??
        (backend?.amount_raw !== undefined && backend.decimals != null
          ? new BigNumber(backend.amount_raw)
              .shiftedBy(-backend.decimals)
              .toFixed()
          : backend?.amount_raw !== undefined
            ? backend.amount_raw
            : matchesLocal
              ? (record.amount ?? null)
              : null));
  return {
    operationId: record.operationId,
    backendId: backend
      ? getBridgeDepositId(backend)
      : event
        ? getBridgeEventId(event)
        : undefined,
    amount,
    symbol,
    recipient: record.account,
    sourceExplorerUrl:
      USDT_BRIDGE.chainId === sepolia.id
        ? `${sepolia.blockExplorers.default.url}/tx/${event?.initial_tx_hash ?? backend?.evm_tx_hash ?? record.sourceHashes.at(-1)}`
        : undefined,
    state: getState(record, context),
    isHistorical: !event && record.settlement === "executed",
  };
}

export type WidgetPresentation = {
  session: object | null;
  dismissed: Set<string>;
  discovered: Map<
    string,
    { order: number; backendId?: string; visible: boolean }
  >;
  isOpen: boolean;
};
export function createWidgetPresentation(
  session: object | null
): WidgetPresentation {
  return {
    session,
    dismissed: new Set(),
    discovered: new Map(),
    isOpen: false,
  };
}

/** Discover before dismissal filtering; migrate only exact canonical backend identities. */
export function reconcileWidgetPresentation(
  previous: WidgetPresentation,
  session: object | null,
  models: TransactionWidgetModel[]
): WidgetPresentation {
  let next =
    previous.session === session ? previous : createWidgetPresentation(session);
  for (const model of models) {
    const current = next.discovered.get(model.operationId);
    if (
      current &&
      current.backendId === model.backendId &&
      (current.visible || model.isHistorical)
    )
      continue;
    if (next === previous)
      next = {
        ...next,
        discovered: new Map(next.discovered),
        dismissed: new Set(next.dismissed),
      };
    const alias =
      model.backendId &&
      [...next.discovered.entries()].find(
        ([id, item]) =>
          id !== model.operationId &&
          item.backendId === model.backendId &&
          !models.some((other) => other.operationId === id)
      );
    const entry = current ?? (alias ? alias[1] : undefined);
    const visible = Boolean(entry?.visible || !model.isHistorical);
    next.discovered.set(model.operationId, {
      order: entry?.order ?? next.discovered.size,
      backendId: model.backendId,
      visible,
    });
    if (alias && next.dismissed.has(alias[0]))
      next.dismissed.add(model.operationId);
    if (!entry?.visible && visible && !next.dismissed.has(model.operationId))
      next.isOpen = true;
  }
  return next;
}
