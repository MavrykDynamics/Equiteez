import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useTransactionsContext } from "./TransactionsProvider";
import { WidgetRemovals } from "./widgetRemovals";
import { toIntentWidget } from "./intentWidget";
import { isIntentOwnedBridgeRecord } from "./intentReceipts";

const noForwardIds: ReadonlyMap<string, string> = new Map();

import {
  createWidgetPresentation,
  reconcileWidgetPresentation,
  toTransactionWidget,
} from "./transactionWidget.helpers";

function useWidgetState() {
  const {
    session,
    account,
    network,
    transactions,
    storageError,
    reconciliationError,
    lastCheckedAt,
    refresh,
    intents = [],
    intentForwardIds = noForwardIds,
  } = useTransactionsContext();
  const removals = useMemo(
    () => new WidgetRemovals(account, network, () => window.localStorage),
    [account, network]
  );
  const removalState = useSyncExternalStore(
    removals.subscribe,
    removals.getSnapshot,
    removals.getSnapshot
  );
  useEffect(() => {
    removals.start();
    document.addEventListener("visibilitychange", removals.expire);
    window.addEventListener("pageshow", removals.expire);
    return () => {
      removals.stop();
      document.removeEventListener("visibilitychange", removals.expire);
      window.removeEventListener("pageshow", removals.expire);
    };
  }, [removals]);
  const records = useMemo(() => [...transactions.values()], [transactions]);
  const models = useMemo(
    () => [
      ...records.flatMap((record) => {
        // The forwarded deposit of a 1Click operation is shown on its card.
        if (isIntentOwnedBridgeRecord(record, intentForwardIds)) return [];
        if (
          record.widgetRecovery === "pending" ||
          record.widgetRecovery === "suppressed"
        )
          return [];
        // Popup submissions may wait before WSS arrives; only WSS advances steps.
        if (!record.signerEvents?.length && !record.isWidgetRequested)
          return [];
        const model = toTransactionWidget(record);
        if (!model) return [];
        // A persisted deadline is evidence of previously received terminal WSS events.
        if (removalState.entries.get(model.backendId!) != null)
          return [
            {
              ...model,
              isTerminal: true,
              state: { status: "success" as const },
            },
          ];
        return [model];
      }),
      // 1Click operations share the stack, holds and removals under a
      // composite `intent:<localId>` identity.
      ...intents.flatMap((record) => {
        const model = toIntentWidget(record);
        if (!model) return [];
        if (removalState.entries.get(model.backendId!) != null)
          return [
            {
              ...model,
              isTerminal: true,
              // Keep the card's own success copy (received amount).
              state:
                model.state.status === "success"
                  ? model.state
                  : { status: "success" as const },
            },
          ];
        return [model];
      }),
    ],
    [records, intents, intentForwardIds, removalState.entries]
  );
  const [presentation, setPresentation] = useState(
    createWidgetPresentation(session)
  );
  const current = useMemo(() => {
    let next = reconcileWidgetPresentation(
      presentation,
      session,
      models.filter(
        (model) =>
          !model.backendId || removalState.entries.get(model.backendId) !== null
      )
    );
    for (const [id, item] of next.discovered) {
      if (!item.backendId || removalState.entries.get(item.backendId) !== null)
        continue;
      if (next === presentation)
        next = {
          ...next,
          discovered: new Map(next.discovered),
          dismissed: new Set(next.dismissed),
        };
      next.discovered.delete(id);
      next.dismissed.delete(id);
    }
    return next;
  }, [presentation, session, models, removalState.entries]);
  if (current !== presentation) setPresentation(current);
  useEffect(() => {
    for (const model of models) {
      if (
        model.isTerminal &&
        model.state.status === "success" &&
        model.backendId &&
        !current.heldOperationIds.has(model.operationId)
      )
        removals.confirmSuccess(model.backendId);
    }
  }, [models, removals, current.heldOperationIds]);
  // A popup owns a temporary visibility hold, never the transaction's tracking.
  const holdDeposit = useCallback(
    (operationId: string) => {
      setPresentation((previous) =>
        previous.session !== session ||
        previous.heldOperationIds.has(operationId)
          ? previous
          : {
              ...previous,
              heldOperationIds: new Set([
                ...previous.heldOperationIds,
                operationId,
              ]),
            }
      );
      return () =>
        setPresentation((previous) => {
          if (
            previous.session !== session ||
            !previous.heldOperationIds.has(operationId)
          )
            return previous;
          const heldOperationIds = new Set(previous.heldOperationIds);
          heldOperationIds.delete(operationId);
          return { ...previous, heldOperationIds, isOpen: true };
        });
    },
    [session]
  );
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
    (operationId: string) => {
      // Keep operation-ID callers compatible; the host uses the canonical hash/log ID.
      const model = models.find(
        (item) =>
          item.operationId === operationId || item.backendId === operationId
      );
      if (model?.isTerminal && model.backendId)
        removals.dismiss(model.backendId);
      const id = model?.operationId ?? operationId;
      setPresentation((previous) =>
        previous.session !== session || previous.dismissed.has(id)
          ? previous
          : {
              ...previous,
              dismissed: new Set([...previous.dismissed, id]),
            }
      );
    },
    [session, models, removals]
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
            (!account || removalState.isReady) &&
            !current.heldOperationIds.has(model.operationId) &&
            removalState.entries.get(model.backendId!) !== null &&
            current.discovered.get(model.operationId)?.visible &&
            !current.dismissed.has(model.operationId)
        )
        .sort(
          (a, b) =>
            current.discovered.get(a.operationId)!.order -
              current.discovered.get(b.operationId)!.order ||
            a.operationId.localeCompare(b.operationId)
        ),
    [models, current, account, removalState]
  );
  return {
    transactions: records,
    storageError: storageError ?? removalState.storageError,
    reconciliationError,
    lastCheckedAt,
    refresh,
    dismissed: current.dismissed,
    isOpen: current.isOpen,
    models,
    visibleModels,
    holdDeposit,
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
