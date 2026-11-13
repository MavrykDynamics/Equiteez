import {
  isFailedIntentStatus,
  type IntentRecord,
} from "~/lib/intents/intentOperation";
import { fromRawAmount } from "~/lib/intents/intentRoute";
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
 * wallet, or the backend saw a deposit. Unfunded, declined or abandoned
 * operations stay in the modal only.
 */
export function isIntentWidgetVisible(record: IntentRecord) {
  if (!record.operationId) return false;
  const status = record.backend?.status;
  // The backend saw funds (even if the modal had abandoned the quote).
  if (status && status !== "awaiting_deposit" && status !== "expired")
    return true;
  return ["prompted", "broadcast", "confirmed", "unknown", "reverted"].includes(
    record.fundingState
  );
}

const withChain = (record: IntentRecord, text: string) =>
  text.replace("{chain}", record.source.chainName);

/**
 * Truthful stages. EVM WRAPPED (backend authority ends) is shown as the
 * neutral last step, never as success: only a verified forward-event
 * correlation (EQ-FE-05) completes the card.
 */
export function getIntentWidgetState(record: IntentRecord): {
  state: RTransactionWidgetState;
  isTerminal: boolean;
} {
  const backend = record.backend;
  const status = backend?.status;
  if (status && status !== "awaiting_deposit") {
    if (status === "wrapped")
      return record.receipt === "correlated"
        ? { state: { status: "success" }, isTerminal: true }
        : {
            state: {
              status: "progress",
              step: 4,
              description:
                "Handed to the Mavryk bridge. Tokens will appear in your balance shortly; arrival is not confirmed yet.",
            },
            // Backend authority ended; the card may be dismissed.
            isTerminal: true,
          };
    if (isFailedIntentStatus(status))
      return {
        isTerminal: true,
        state: {
          status: "warning",
          title:
            status === "refunded"
              ? "Deposit refunded"
              : status === "expired"
                ? "Deposit expired"
                : "Deposit failed",
          description:
            status === "refunded"
              ? withChain(
                  record,
                  `${backend.refund?.reason ? `${backend.refund.reason} ` : ""}Funds are returned to your wallet on {chain}.`
                )
              : status === "expired"
                ? "The deposit was not received before the quote expired. Anything sent late is refunded by 1Click."
                : (backend.error?.message ??
                  "The deposit could not be completed. Contact support with the operation ID."),
        },
      };
    return {
      isTerminal: false,
      state:
        status === "deposit_detected" || status === "swapping"
          ? {
              status: "progress",
              step: 2,
              description:
                status === "deposit_detected"
                  ? "Deposit received by 1Click. Starting the swap."
                  : "1Click is swapping your funds.",
            }
          : {
              status: "progress",
              step: 3,
              description:
                status === "delivered"
                  ? "Swap delivered. Waiting for the sponsored forward to the bridge."
                  : "Forwarding to the bridge. The gas is sponsored.",
            },
    };
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
        state: {
          status: "progress",
          step: 1,
          description: withChain(
            record,
            record.fundingState === "confirmed"
              ? "Transfer confirmed on {chain}. Waiting for 1Click to detect it."
              : "Waiting for {chain} confirmation."
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
    amount: fromRawAmount(record.amountIn, record.source.decimals).toFixed(),
    symbol: record.source.symbol,
    recipient: record.recipient,
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
