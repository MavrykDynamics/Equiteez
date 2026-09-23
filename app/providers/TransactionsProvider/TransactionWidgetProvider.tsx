import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTransactionsContext } from "./TransactionsProvider";

function useWidgetState() {
  const {
    session,
    transactions,
    storageError,
    reconciliationError,
    lastCheckedAt,
    refresh,
  } = useTransactionsContext();
  const [presentation, setPresentation] = useState<{
    session: object | null;
    dismissed: Set<string>;
    isOpen: boolean;
  }>({ session, dismissed: new Set(), isOpen: false });
  const current =
    presentation.session === session
      ? presentation
      : { session, dismissed: new Set<string>(), isOpen: false };
  return {
    transactions: useMemo(() => [...transactions.values()], [transactions]),
    storageError,
    reconciliationError,
    lastCheckedAt,
    refresh,
    dismissed: current.dismissed,
    isOpen: current.isOpen,
    setIsOpen: (isOpen: boolean) =>
      setPresentation((previous) => ({
        ...(previous.session === session ? previous : current),
        isOpen,
      })),
    dismiss: (operationId: string) =>
      setPresentation((previous) => {
        const next = previous.session === session ? previous : current;
        return {
          ...next,
          dismissed: new Set([...next.dismissed, operationId]),
        };
      }),
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
