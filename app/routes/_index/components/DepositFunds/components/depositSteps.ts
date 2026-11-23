import type { TransactionWidgetModel } from "~/providers/TransactionsProvider/transactionWidget.helpers";
import { transactionWidgetStepLabels } from "~/providers/TransactionsProvider/components/RTransactionWidget/RTransactionWidget";

export type BridgeProcessStatus = "loading" | "success" | "error";
export type BridgeStepStatus = BridgeProcessStatus | "pending";

export type BridgeStatusStep = {
  description: string;
  status: BridgeStepStatus;
  title: string;
};

// Presentation mapping only: the provider owns all event/status decisions.
export function getDepositSteps(
  { state, steps = transactionWidgetStepLabels }: TransactionWidgetModel,
  pendingDescription = "Waiting for bridge updates"
): BridgeStatusStep[] {
  return steps.map((title, index) => {
    const isCurrent =
      (state.status === "progress" && state.step === index + 1) ||
      (state.status === "waiting" && index === 0);
    const status: BridgeStepStatus =
      state.status === "success" ||
      (state.status === "progress" && index + 1 < state.step)
        ? "success"
        : isCurrent
          ? "loading"
          : "pending";
    return {
      title:
        isCurrent && state.status === "progress"
          ? (state.title ?? title)
          : title,
      status,
      description:
        status === "success"
          ? "Complete"
          : isCurrent
            ? (state.description ?? "In progress")
            : pendingDescription,
    };
  });
}
