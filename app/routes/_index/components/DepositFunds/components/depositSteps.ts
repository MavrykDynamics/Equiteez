import type { TransactionWidgetModel } from "~/providers/TransactionsProvider/transactionWidget.helpers";
import { transactionWidgetStepLabels } from "~/providers/TransactionsProvider/components/RTransactionWidget/RTransactionWidget";

export type DepositProcessStatus = "loading" | "success" | "error";
export type DepositStepStatus = DepositProcessStatus | "pending";

export type DepositStatusStep = {
  description: string;
  status: DepositStepStatus;
  title: string;
};

// Presentation mapping only: the provider owns all event/status decisions.
export function getDepositSteps(
  { state, steps = transactionWidgetStepLabels }: TransactionWidgetModel,
  pendingDescription = "Waiting for bridge updates"
): DepositStatusStep[] {
  return steps.map((title, index) => {
    const isCurrent =
      (state.status === "progress" && state.step === index + 1) ||
      (state.status === "waiting" && index === 0);
    const status: DepositStepStatus =
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
