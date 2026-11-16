import type { IntentAttention } from "~/lib/apis/intents";
import {
  getIntentSettlementReceipt,
  hasIntentArrived,
  hasIntentFundingStarted,
  hasIntentFundsObserved,
  type IntentRecord,
} from "~/lib/intents/intentOperation";
import { formatRawAmount, fromRawAmount } from "~/lib/intents/intentRoute";
import type { RTransactionWidgetState } from "./components/RTransactionWidget/RTransactionWidget";
import type { TransactionWidgetModel } from "./transactionWidget.helpers";

export const intentWidgetStepLabels = [
  "Send Funds",
  "Swap",
  "Forward To Bridge",
  "Bridge To Mavryk",
] as const;

/** Composite widget identity; never collides with a bridge hash/log ID. */
export const getIntentWidgetId = (record: Pick<IntentRecord, "localId">) =>
  `intent:${record.localId}`;

/**
 * A record joins the widget stack once the user committed to it in the
 * wallet, or the backend saw funds. Unfunded, declined or abandoned
 * operations stay in the modal only.
 */
export function isIntentWidgetVisible(record: IntentRecord) {
  if (!record.operationId) return false;
  return (
    hasIntentFundingStarted(record) || hasIntentFundsObserved(record.backend)
  );
}

const withChain = (record: IntentRecord, text: string) =>
  text.replaceAll("{chain}", record.source.chainName);

const support = (record: IntentRecord) =>
  record.operationId
    ? ` Contact support with operation ID ${record.operationId}.`
    : "";

/** Attention overlays that need a person: never encourage a second deposit. */
const reviewAttention = new Set<IntentAttention>([
  "MANUAL_REVIEW",
  "RECONCILE_REQUIRED",
]);

/** Extra copy for non-blocking attention overlays (backend.md §6). */
const attentionCopy: Partial<Record<IntentAttention, string>> = {
  RETRYING: "A step is being retried automatically.",
  ROUTE_PAUSED:
    "The route is paused. Your deposit is preserved and continues when it resumes.",
  PROVIDER_UNAVAILABLE:
    "1Click is temporarily unavailable. Processing continues when it recovers.",
  REFUND_PENDING: "1Click is preparing a refund to your source wallet.",
};

const withAttention = (record: IntentRecord, description: string) => {
  const extra = record.backend && attentionCopy[record.backend.attention];
  return extra ? `${description} ${extra}` : description;
};

const destinationAmount = (record: IntentRecord) => {
  const settlement = record.backend?.settlement;
  return settlement && settlement.confirmedAmount !== "0"
    ? `${formatRawAmount(settlement.confirmedAmount, record.destination.decimals)} ${record.destination.symbol}`
    : record.destination.symbol;
};

/**
 * Truthful stages. 1Click SUCCESS, EVM WRAPPED and signer votes are never
 * shown as success: only a confirmed backend settlement for the expected
 * Mavryk token, or verified bridge data on the forward identity, completes
 * the card. `isTerminal` means the card may be dismissed.
 */
export function getIntentWidgetState(record: IntentRecord): {
  state: RTransactionWidgetState;
  isTerminal: boolean;
} {
  const backend = record.backend;

  if (hasIntentArrived(record))
    return {
      state: {
        status: "success",
        description: `${destinationAmount(record)} arrived in your Mavryk account.`,
      },
      isTerminal: true,
    };
  if (record.access === "lost")
    return {
      isTerminal: true,
      state: {
        status: "warning",
        title: "Status unavailable",
        description: `This deposit's status can no longer be read from the deposit service. Do not send it again.${support(record)}`,
      },
    };

  if (backend && hasIntentFundsObserved(backend)) {
    if (getIntentSettlementReceipt(record) === "mismatch")
      return {
        isTerminal: true,
        state: {
          status: "warning",
          title: "Check your Mavryk balance",
          description: `The bridge reported a mint that could not be matched to ${record.destination.symbol}.${support(record)}`,
        },
      };
    if (backend.refund)
      return {
        isTerminal: true,
        state: {
          status: "warning",
          title: "Refund reported",
          description: withChain(
            record,
            `1Click reported a refund of ${formatRawAmount(backend.refund.amount, record.source.decimals)} ${record.source.symbol} to ${backend.refund.recipient} on {chain}. This is the provider's report; check your wallet to confirm it arrived.`
          ),
        },
      };
    if (
      reviewAttention.has(backend.attention) ||
      backend.delivery.status === "AMBIGUOUS" ||
      backend.delivery.status === "RECONCILE_REQUIRED" ||
      backend.forwarding.status === "RECONCILE_REQUIRED" ||
      backend.settlement.status === "RECONCILE_REQUIRED"
    )
      return {
        isTerminal: false,
        state: {
          status: "warning",
          title: "Deposit under review",
          description: `Your deposit needs a manual check. Do not send another deposit.${support(record)}`,
        },
      };
    if (backend.attention === "DEPOSIT_INCOMPLETE")
      return {
        isTerminal: false,
        state: {
          status: "warning",
          title: "Incomplete deposit",
          description: `1Click received less than the quoted amount. Do not send another deposit.${support(record)}`,
        },
      };
    if (
      backend.phase === "UNKNOWN" ||
      backend.attention === "UNKNOWN" ||
      backend.settlement.status === "UNKNOWN"
    )
      return {
        isTerminal: false,
        state: {
          status: "warning",
          title: "Status not recognised",
          description: `The deposit service reported a status this app does not recognise. Do not send another deposit.${support(record)}`,
        },
      };

    switch (backend.phase) {
      case "WRAPPED":
        return backend.settlement.status === "NOT_TRACKED"
          ? {
              state: {
                status: "progress",
                step: 4,
                description:
                  "Handed to the Mavryk bridge. Tokens will appear in your balance shortly; arrival is not confirmed yet.",
              },
              // Settlement is not observed for this operation; dismissible.
              isTerminal: true,
            }
          : {
              state: {
                status: "progress",
                step: 4,
                description: withAttention(
                  record,
                  "Waiting for Mavryk confirmation."
                ),
              },
              isTerminal: false,
            };
      case "VERIFYING_DELIVERY":
      case "DELIVERY_VERIFIED":
      case "FORWARDING":
        return {
          isTerminal: false,
          state: {
            status: "progress",
            step: 3,
            description: withAttention(
              record,
              backend.phase === "FORWARDING"
                ? "Forwarding to the bridge. The gas is sponsored."
                : backend.phase === "DELIVERY_VERIFIED"
                  ? "Swap delivery verified. Preparing the sponsored forward to the bridge."
                  : "Verifying the swap delivery on the bridge network."
            ),
          },
        };
      default:
        return {
          isTerminal: false,
          state: {
            status: "progress",
            step: 2,
            description: withAttention(
              record,
              backend.providerStatus === "SUCCESS"
                ? "Swap reported complete. Verifying the delivery."
                : backend.providerStatus === "PROCESSING"
                  ? "1Click is swapping your funds."
                  : "Deposit seen by 1Click. Starting the swap."
            ),
          },
        };
    }
  }

  switch (record.fundingState) {
    case "prompted":
      return {
        isTerminal: false,
        state: {
          status: "warning",
          title: "Check your wallet",
          description:
            "This transfer was requested in your wallet. If you sent it, tracking continues automatically. Do not send it again.",
        },
      };
    case "unknown":
      return {
        isTerminal: false,
        state: {
          status: "warning",
          title: "Transfer outcome unknown",
          description:
            record.fundingError ??
            "Check your wallet before doing anything else. Tracking continues.",
        },
      };
    case "reverted":
      return {
        isTerminal: true,
        state: {
          status: "warning",
          title: "Transfer failed",
          description:
            record.fundingError ??
            withChain(record, "The transfer failed on {chain}."),
        },
      };
    default:
      return {
        isTerminal: false,
        state:
          backend?.fundingStatus === "EXPIRED"
            ? {
                status: "warning",
                title: "Waiting for 1Click",
                description: `The quote expired before 1Click saw your transfer. A late deposit is reconciled by the service; do not send it again.${support(record)}`,
              }
            : {
                status: "progress",
                step: 1,
                description: withAttention(
                  record,
                  withChain(
                    record,
                    record.fundingState === "confirmed"
                      ? "Transfer confirmed on {chain}. Waiting for 1Click to detect it."
                      : "Waiting for {chain} confirmation."
                  )
                ),
              },
      };
  }
}

export function toIntentWidget(
  record: IntentRecord,
  explorerUrl?: string
): TransactionWidgetModel | null {
  if (!isIntentWidgetVisible(record)) return null;
  const { state, isTerminal } = getIntentWidgetState(record);
  const id = getIntentWidgetId(record);
  const hash = record.sourceHashes.at(-1);
  return {
    kind: "intent",
    operationId: id,
    presentationId: id,
    backendId: id,
    amount: fromRawAmount(
      record.request.amountIn,
      record.source.decimals
    ).toFixed(),
    symbol: record.source.symbol,
    recipient: record.request.recipient,
    sourceExplorerUrl:
      explorerUrl && hash
        ? `${explorerUrl.replace(/\/$/, "")}/tx/${hash}`
        : undefined,
    steps: intentWidgetStepLabels,
    state,
    isTerminal,
    isHistorical: false,
  };
}
