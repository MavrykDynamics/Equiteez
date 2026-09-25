import { useTransactionWidget } from "../../TransactionWidgetProvider";
import { RTransactionWidget } from "./RTransactionWidget";
import styles from "./RTransactionWidgetHost.module.css";

/** Presentation only; received deposit events own widget progress. */
export function RTransactionWidgetHost() {
  const { visibleModels, isOpen } = useTransactionWidget();
  if (!isOpen || !visibleModels.length) return null;
  return (
    <section aria-label="Bridge deposits" className={styles.panel}>
      {visibleModels.map((model) => (
        <RTransactionWidget
          key={model.backendId ?? model.operationId}
          amount={model.amount}
          amountMode="token"
          symbol={model.symbol}
          recipient={model.recipient}
          sourceExplorerUrl={model.sourceExplorerUrl}
          state={model.state}
        />
      ))}
    </section>
  );
}
