import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useNotificationsContext } from "~/providers/NotificationsProvider/NotificationsProvider";
import type { NotifierEventFrame } from "~/providers/NotificationsProvider/notifications.types";
import { useNotifierEvent } from "~/providers/NotificationsProvider/hooks/useNotifierEvent";
import {
  NotifierChannel,
  NotifierConnectionStatus,
  NotifierWalletEvent,
} from "~/providers/NotificationsProvider/notifications.const";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { fetchBridgeDeposits } from "~/lib/apis/rwa/bridge/bridge";
import { INTENTS_ENV } from "~/consts/intents";
import {
  hasIntentArrived,
  type IntentRecord,
} from "~/lib/intents/intentOperation";
import { formatRawAmount } from "~/lib/intents/intentCatalog";
import { getIntentsApi } from "~/lib/apis/intents";
import { IntentOperations, type IntentSnapshot } from "./intentOperations";
import { IntentOperationsTracker } from "./intentOperationsTracker";
import {
  findCorrelatedIntentReceipts,
  getIntentForwardIdMap,
  isIntentOwnedBridgeRecord,
} from "./intentReceipts";
import { recoverBridgeWidgets } from "./bridgeWidgetRecovery";
import { BridgeReconciler } from "./bridgeReconciler";
import {
  BridgeTransactions,
  bridgeNetwork,
  type BridgeTransaction,
  type BridgeSettlementUpdate,
  type TransactionSnapshot,
} from "./bridgeTransactions";

const emptySnapshot: TransactionSnapshot = {
  transactions: new Map(),
  storageError: null,
  reconciliationError: null,
  lastCheckedAt: null,
};
const emptySubscribe = () => () => {};
const getEmptySnapshot = () => emptySnapshot;
const emptyIntentSnapshot: IntentSnapshot = {
  records: new Map(),
  storageError: null,
};
const getEmptyIntentSnapshot = () => emptyIntentSnapshot;
type TransactionsContext = TransactionSnapshot & {
  account: string | null;
  network: string;
  session: object | null;
  publish: (record: BridgeTransaction) => void;
  refresh: () => void;
  /** 1Click operations of this account/environment (EQ-FE-02+). */
  intents: readonly IntentRecord[];
  /** Write target captured by intent flows; null when signed out/flag off. */
  intentSession: IntentOperations | null;
  intentStorageError: string | null;
  refreshIntent: (localId?: string) => void;
  /** Forward hash:log → intent localId; such bridge records render on the intent card. */
  intentForwardIds: ReadonlyMap<string, string>;
};
const context = createContext<TransactionsContext | null>(null);
const settlementQueryPrefixes = [
  "rwa-wallet",
  "rwa-wallet-portfolio",
  "rwa-wallet-portfolio-history",
  "fetchWalletTransferHistory",
  "fetchWalletActivitySummary",
  "rwa-wallet-notifications",
  "rwa-wallet-notifications-summary",
];

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const { userAddress } = useUserContext();
  const { status, wallet } = useNotificationsContext();
  const account = isAuthenticated ? userAddress : null;
  const queryClient = useQueryClient();
  const toaster = useToasterContext();
  const store = useMemo(
    () =>
      account
        ? new BridgeTransactions(
            account,
            bridgeNetwork,
            () => window.localStorage
          )
        : null,
    [account]
  );
  const currentStore = useRef(store);
  currentStore.current = store;
  const intentStore = useMemo(
    () =>
      account
        ? new IntentOperations(account, INTENTS_ENV, () => window.localStorage)
        : null,
    [account]
  );
  const currentIntentStore = useRef(intentStore);
  currentIntentStore.current = intentStore;
  const intentTracker = useMemo(
    () =>
      intentStore
        ? new IntentOperationsTracker(
            intentStore,
            getIntentsApi(),
            () => currentIntentStore.current === intentStore
          )
        : null,
    [intentStore]
  );
  const intentSnapshot = useSyncExternalStore(
    intentStore?.subscribe ?? emptySubscribe,
    intentStore?.getSnapshot ?? getEmptyIntentSnapshot,
    getEmptyIntentSnapshot
  );
  const intents = useMemo(
    () => [...intentSnapshot.records.values()],
    [intentSnapshot.records]
  );
  const settlementHandler = useRef<(records: BridgeSettlementUpdate[]) => void>(
    () => {}
  );
  const intentForwardIds = useMemo(
    () => getIntentForwardIdMap(intents),
    [intents]
  );
  const invalidateSettlementData = useCallback(
    () =>
      void queryClient
        .invalidateQueries({
          predicate: (query) =>
            settlementQueryPrefixes.includes(String(query.queryKey[0])) &&
            query.queryKey[1] === account,
        })
        .catch(() => console.warn("Bridge settlement data refresh failed")),
    [account, queryClient]
  );
  settlementHandler.current = (records) => {
    if (!store || currentStore.current !== store) return;
    for (const { record, shouldNotify } of records) {
      if (!shouldNotify) continue;
      // A 1Click operation announces its own arrival once (below).
      if (isIntentOwnedBridgeRecord(record, intentForwardIds)) continue;
      if (record.settlement === "executed")
        toaster.success(
          "Bridge deposit arrived",
          "Your deposit has arrived on Mavryk."
        );
      else
        toaster.warning(
          "Bridge deposit stalled",
          record.backend?.reason ??
            "The bridge has stalled. Check the source transaction for details."
        );
    }
    if (records.some(({ record }) => record.settlement === "executed")) {
      // API retired these caches on mint. No chain-based freshness mark is needed.
      invalidateSettlementData();
    }
  };
  const reconciler = useMemo(
    () =>
      store
        ? new BridgeReconciler(
            store,
            fetchBridgeDeposits,
            (records) => settlementHandler.current(records),
            () => currentStore.current === store,
            (signal, isCurrent) =>
              recoverBridgeWidgets(store, queryClient, signal, isCurrent)
          )
        : null,
    [store, queryClient]
  );
  const snapshot = useSyncExternalStore(
    store?.subscribe ?? emptySubscribe,
    store?.getSnapshot ?? getEmptySnapshot,
    getEmptySnapshot
  );

  // EQ-FE-05: a 1Click operation completes from the backend's confirmed
  // settlement for the expected token, or (fallback) verified bridge data on
  // every forward identity. Balances/activity refresh when the bridge takes
  // over (WRAPPED) and again on arrival; arrival is announced exactly once.
  const refreshedIntents = useRef(new Set<string>());
  useEffect(() => {
    if (!intentStore || currentIntentStore.current !== intentStore) return;
    for (const localId of findCorrelatedIntentReceipts(
      intents,
      snapshot.transactions.values()
    ))
      intentStore.patch(localId, { receipt: "correlated" });
    for (const record of intents) {
      const key = `${intentStore.key}:${record.localId}`;
      if (
        record.backend?.phase === "WRAPPED" &&
        !refreshedIntents.current.has(key)
      ) {
        refreshedIntents.current.add(key);
        invalidateSettlementData();
      }
      // The persisted marker dedupes across reloads, reconnects and Strict Mode.
      if (
        hasIntentArrived(record) &&
        !intentStore.get(record.localId)?.announced &&
        intentStore.patch(record.localId, { announced: true })
      ) {
        const settled = record.backend?.settlement.confirmedAmount;
        toaster.success(
          "Deposit arrived",
          settled && settled !== "0"
            ? `${formatRawAmount(settled, record.destination.decimals)} ${record.destination.symbol} arrived in your Mavryk account.`
            : "Your cross-chain deposit has arrived on Mavryk."
        );
        invalidateSettlementData();
      }
    }
  }, [
    intents,
    intentStore,
    invalidateSettlementData,
    snapshot.transactions,
    toaster,
  ]);

  useEffect(() => {
    currentStore.current = store;
    intentStore?.restore();
    if (document.visibilityState !== "hidden") {
      reconciler?.start();
      intentTracker?.start();
    }
    const handleForeground = () => {
      if (document.visibilityState === "hidden") {
        reconciler?.stop();
        intentTracker?.stop();
      } else {
        reconciler?.stop();
        reconciler?.start();
        intentTracker?.stop();
        intentTracker?.start();
      }
    };
    document.addEventListener("visibilitychange", handleForeground);
    window.addEventListener("online", handleForeground);
    window.addEventListener("pageshow", handleForeground);
    return () => {
      currentStore.current = null;
      reconciler?.stop();
      intentTracker?.stop();
      document.removeEventListener("visibilitychange", handleForeground);
      window.removeEventListener("online", handleForeground);
      window.removeEventListener("pageshow", handleForeground);
    };
  }, [reconciler, store, intentStore, intentTracker]);
  useEffect(() => {
    reconciler?.setConnected(
      status === NotifierConnectionStatus.Connected && wallet === account
    );
  }, [account, reconciler, status, wallet]);
  const handleBridgeEvent = useCallback(
    (frame: NotifierEventFrame, authenticatedWallet: string) => {
      if (
        account &&
        authenticatedWallet === account &&
        currentStore.current === store
      ) {
        store?.observeEvent(frame.payload);
      }
    },
    [account, store]
  );
  // Exactly one adapter, active for the entire authenticated session.
  useNotifierEvent(
    account ? NotifierChannel.Wallet : null,
    NotifierWalletEvent.BridgeDepositUpdated,
    handleBridgeEvent
  );
  const value = useMemo(
    () => ({
      ...snapshot,
      account,
      network: bridgeNetwork,
      session: store,
      intents,
      intentSession: intentStore,
      intentStorageError: intentSnapshot.storageError,
      refreshIntent: (localId?: string) => intentTracker?.refresh(localId),
      intentForwardIds,
      refresh: () => reconciler?.refresh(),
      publish: (record: BridgeTransaction) => {
        if (!store || currentStore.current !== store) return;
        const oldHashes =
          store.getSnapshot().transactions.get(record.operationId)
            ?.sourceHashes ?? [];
        store.update(record);
        if (
          record.sourceHashes.some(
            (hash) => !oldHashes.includes(hash.toLowerCase())
          )
        )
          reconciler?.refresh();
      },
    }),
    [
      account,
      snapshot,
      store,
      reconciler,
      intents,
      intentStore,
      intentTracker,
      intentForwardIds,
      intentSnapshot.storageError,
    ]
  );
  return <context.Provider value={value}>{children}</context.Provider>;
}

export function useTransactionsContext() {
  const value = useContext(context);
  if (!value)
    throw new Error("Transactions context requires TransactionsProvider");
  return value;
}
