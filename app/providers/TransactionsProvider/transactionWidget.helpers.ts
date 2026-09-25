import { BigNumber } from "bignumber.js";
import { sepolia } from "wagmi/chains";
import { USDT_BRIDGE } from "~/consts/usdtBridge";
import { getBridgeDepositId } from "~/lib/apis/rwa/bridge/bridge.schema";
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
  const backend = record.backend;
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
  const symbol = isRawAmount
    ? "raw units"
    : tokenAddress === USDT_BRIDGE.sourceToken.address.toLowerCase()
      ? USDT_BRIDGE.sourceToken.symbol
      : "Token amount";
  const amount =
    backend?.amount ??
    (backend?.amount_raw !== undefined && backend.decimals != null
      ? new BigNumber(backend.amount_raw).shiftedBy(-backend.decimals).toFixed()
      : backend?.amount_raw !== undefined
        ? backend.amount_raw
        : matchesLocal
          ? (record.amount ?? null)
          : null);
  return {
    operationId: record.operationId,
    backendId: backend ? getBridgeDepositId(backend) : undefined,
    amount,
    symbol,
    recipient: record.account,
    sourceExplorerUrl:
      USDT_BRIDGE.chainId === sepolia.id
        ? `${sepolia.blockExplorers.default.url}/tx/${backend?.evm_tx_hash ?? record.sourceHashes.at(-1)}`
        : undefined,
    state: getState(record, context),
    isHistorical: record.settlement === "executed",
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
    if (current && current.backendId === model.backendId) continue;
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
    const visible = entry?.visible ?? !model.isHistorical;
    next.discovered.set(model.operationId, {
      order: entry?.order ?? next.discovered.size,
      backendId: model.backendId,
      visible,
    });
    if (alias && next.dismissed.has(alias[0]))
      next.dismissed.add(model.operationId);
    if (!entry && visible && !next.dismissed.has(model.operationId))
      next.isOpen = true;
  }
  return next;
}
