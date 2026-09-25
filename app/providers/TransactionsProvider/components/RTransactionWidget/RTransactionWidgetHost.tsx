import { memo } from "react";
import { Container } from "~/lib/atoms/Container/Container";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useTransactionWidget } from "../../TransactionWidgetProvider";
import type { TransactionWidgetModel } from "../../transactionWidget.helpers";
import { RTransactionWidget } from "./RTransactionWidget";
import styles from "./RTransactionWidgetHost.module.css";

type CardProps = Omit<
  TransactionWidgetModel,
  "state" | "backendId" | "isHistorical"
> & {
  status: TransactionWidgetModel["state"]["status"];
  step?: 1 | 2 | 3 | 4;
  title?: string;
  description?: string;
  dismiss: (operationId: string) => void;
};
const DepositCard = memo(function DepositCard({
  operationId,
  amount,
  symbol,
  recipient,
  sourceExplorerUrl,
  status,
  step,
  title,
  description,
  dismiss,
}: CardProps) {
  const state =
    status === "progress"
      ? ({ status, step: step ?? 1, title, description } as const)
      : status === "success"
        ? ({ status, description } as const)
        : {
            status,
            title,
            description: description ?? "Deposit status needs verification.",
          };
  return (
    <div className={styles.card}>
      <RTransactionWidget
        amount={amount}
        amountMode="token"
        symbol={symbol}
        recipient={recipient}
        sourceExplorerUrl={sourceExplorerUrl}
        state={state}
      />
      <RButton
        size="small"
        tone="black"
        variant="secondary"
        aria-label={`Dismiss deposit ${operationId}`}
        onClick={() => dismiss(operationId)}
      >
        Dismiss
      </RButton>
    </div>
  );
});

/** Presentation only: transport, reconciliation and settlement effects remain upstream. */
export function RTransactionWidgetHost() {
  const {
    models,
    visibleModels,
    isOpen,
    setIsOpen,
    showDeposits,
    dismiss,
    refresh,
    storageError,
    reconciliationError,
  } = useTransactionWidget();
  if (!models.length && !storageError && !reconciliationError) return null;
  return (
    <section aria-label="Bridge deposits" className={styles.panel}>
      <Container className={styles.content}>
        <div className={styles.controls}>
          {models.length > 0 && (
            <RButton
              size="small"
              tone="black"
              variant="secondary"
              onClick={showDeposits}
            >
              Show deposits ({models.length})
            </RButton>
          )}
          {isOpen && (
            <RButton
              size="small"
              tone="black"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Hide deposits
            </RButton>
          )}
          <RButton
            size="small"
            tone="black"
            variant="secondary"
            onClick={refresh}
          >
            Refresh status
          </RButton>
        </div>
        {(storageError || reconciliationError) && (
          <div role="status" className={styles.messages}>
            {storageError && <RText size="body-s">{storageError}</RText>}
            {reconciliationError && (
              <RText size="body-s">{reconciliationError}</RText>
            )}
          </div>
        )}
        {isOpen && (
          <div className={styles.cards}>
            {visibleModels.map(
              ({
                operationId,
                amount,
                symbol,
                recipient,
                state,
                sourceExplorerUrl,
              }) => (
                <DepositCard
                  key={operationId}
                  operationId={operationId}
                  amount={amount}
                  symbol={symbol}
                  recipient={recipient}
                  sourceExplorerUrl={sourceExplorerUrl}
                  status={state.status}
                  step={state.status === "progress" ? state.step : undefined}
                  title={state.status !== "success" ? state.title : undefined}
                  description={state.description}
                  dismiss={dismiss}
                />
              )
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
