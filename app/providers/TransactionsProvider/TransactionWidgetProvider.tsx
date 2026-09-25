import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTransactionsContext } from "./TransactionsProvider";

import {
  createWidgetPresentation,
  reconcileWidgetPresentation,
  toTransactionWidget,
} from "./transactionWidget.helpers";

function useWidgetState() {
  const {
    session,
    transactions,
    storageError,
    reconciliationError,
    lastCheckedAt,
    refresh,
  } = useTransactionsContext();
  const records = useMemo(() => [...transactions.values()], [transactions]);
  const models = useMemo(
    () =>
      records.flatMap((record) => {
        const model = toTransactionWidget(record, {
          reconciliationError,
          lastCheckedAt,
        });
        return model ? [model] : [];
      }),
    [records, reconciliationError, lastCheckedAt]
  );
  const [presentation, setPresentation] = useState(
    createWidgetPresentation(session)
  );
  const current = useMemo(
    () => reconcileWidgetPresentation(presentation, session, models),
    [presentation, session, models]
  );
  if (current !== presentation) setPresentation(current);
  const setIsOpen = useCallback(
    (isOpen: boolean) =>
      setPresentation((previous) =>
        previous.session !== session || previous.isOpen === isOpen
          ? previous
          : { ...previous, isOpen }
      ),
    [session]
  );
  const dismiss = useCallback(
    (operationId: string) =>
      setPresentation((previous) =>
        previous.session !== session || previous.dismissed.has(operationId)
          ? previous
          : {
              ...previous,
              dismissed: new Set([...previous.dismissed, operationId]),
            }
      ),
    [session]
  );
  const showDeposits = useCallback(
    () =>
      setPresentation((previous) => {
        if (previous.session !== session) return previous;
        return {
          ...previous,
          isOpen: true,
          dismissed: new Set<string>(),
          discovered: new Map(
            [...previous.discovered].map(([id, item]) => [
              id,
              { ...item, visible: true },
            ])
          ),
        };
      }),
    [session]
  );
  const visibleModels = useMemo(
    () =>
      models
        .filter(
          (model) =>
            current.discovered.get(model.operationId)?.visible &&
            !current.dismissed.has(model.operationId)
        )
        .sort(
          (a, b) =>
            current.discovered.get(a.operationId)!.order -
              current.discovered.get(b.operationId)!.order ||
            a.operationId.localeCompare(b.operationId)
        ),
    [models, current]
  );
  return {
    transactions: records,
    storageError,
    reconciliationError,
    lastCheckedAt,
    refresh,
    dismissed: current.dismissed,
    isOpen: current.isOpen,
    models,
    visibleModels,
    showDeposits,
    setIsOpen,
    dismiss,
  };
}
const context = createContext<ReturnType<typeof useWidgetState> | null>(null);
export function TransactionWidgetProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <context.Provider value={useWidgetState()}>{children}</context.Provider>
  );
}
export function useTransactionWidget() {
  const value = useContext(context);
  if (!value)
    throw new Error("Transaction widget requires TransactionWidgetProvider");
  return value;
}
