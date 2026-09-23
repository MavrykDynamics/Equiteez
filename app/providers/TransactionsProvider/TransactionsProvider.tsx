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
import { useNotifierEvent } from "~/providers/NotificationsProvider/hooks/useNotifierEvent";
import {
  NotifierChannel,
  NotifierConnectionStatus,
  NotifierWalletEvent,
} from "~/providers/NotificationsProvider/notifications.const";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { fetchBridgeDeposits } from "~/lib/apis/rwa/bridge/bridge";
import { hasBridgeDeploymentBinding } from "~/lib/apis/rwa/bridge/bridge.config";
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
type TransactionsContext = TransactionSnapshot & {
  account: string | null;
  network: string;
  session: object | null;
  publish: (record: BridgeTransaction) => void;
  refresh: () => void;
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
  const settlementHandler = useRef<(records: BridgeSettlementUpdate[]) => void>(
    () => {}
  );
  settlementHandler.current = (records) => {
    if (!store || currentStore.current !== store) return;
    for (const { record, shouldNotify } of records) {
      if (!shouldNotify) continue;
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
      void queryClient
        .invalidateQueries({
          predicate: (query) =>
            settlementQueryPrefixes.includes(String(query.queryKey[0])) &&
            query.queryKey[1] === account,
        })
        .catch(() => console.warn("Bridge settlement data refresh failed"));
    }
  };
  const reconciler = useMemo(
    () =>
      store
        ? new BridgeReconciler(
            store,
            fetchBridgeDeposits,
            hasBridgeDeploymentBinding(
              process.env.RWA_BRIDGE_DEPLOYMENT,
              process.env.RWA_API
            ),
            (records) => settlementHandler.current(records),
            () => currentStore.current === store
          )
        : null,
    [store]
  );
  const snapshot = useSyncExternalStore(
    store?.subscribe ?? emptySubscribe,
    store?.getSnapshot ?? getEmptySnapshot,
    getEmptySnapshot
  );

  useEffect(() => {
    currentStore.current = store;
    if (document.visibilityState !== "hidden") reconciler?.start();
    const handleForeground = () => {
      if (document.visibilityState === "hidden") reconciler?.stop();
      else {
        reconciler?.stop();
        reconciler?.start();
      }
    };
    document.addEventListener("visibilitychange", handleForeground);
    window.addEventListener("online", handleForeground);
    window.addEventListener("pageshow", handleForeground);
    return () => {
      currentStore.current = null;
      reconciler?.stop();
      document.removeEventListener("visibilitychange", handleForeground);
      window.removeEventListener("online", handleForeground);
      window.removeEventListener("pageshow", handleForeground);
    };
  }, [reconciler, store]);
  useEffect(() => {
    reconciler?.setConnected(
      status === NotifierConnectionStatus.Connected && wallet === account
    );
  }, [account, reconciler, status, wallet]);
  const handleBridgeEvent = useCallback(
    (_frame: unknown, authenticatedWallet: string) => {
      if (
        account &&
        authenticatedWallet === account &&
        currentStore.current === store
      )
        reconciler?.refresh();
    },
    [account, reconciler, store]
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
    [account, snapshot, store, reconciler]
  );
  return <context.Provider value={value}>{children}</context.Provider>;
}

export function useTransactionsContext() {
  const value = useContext(context);
  if (!value)
    throw new Error("Transactions context requires TransactionsProvider");
  return value;
}
