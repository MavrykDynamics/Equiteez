import {
  getRelayScopeRevision,
  subscribeRelayScope,
} from "~/lib/relay/relay.scope";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useSyncExternalStore,
} from "react";
import { useLocation } from "@remix-run/react";
import { useQueryClient } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import {
  assertPermitCurrent,
  type PermitRuntime,
  type PermitScope,
  type signPreparedPermit,
} from "~/contracts/permit";
import { useGasPayment } from "~/providers/GasPaymentProvider/GasPaymentProvider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useNotificationsContext } from "~/providers/NotificationsProvider/NotificationsProvider";
import { useNotifierEvent } from "~/providers/NotificationsProvider/hooks/useNotifierEvent";
import {
  NotifierChannel,
  NotifierConnectionStatus,
  NotifierWalletEvent,
} from "~/providers/NotificationsProvider/notifications.const";
import { fetchRelayConfig } from "~/lib/apis/rwa/relay/relay";
import { rwaApiUrl } from "~/lib/apis/rwa/config";
import {
  FreshnessSource,
  useFreshQueryInvalidation,
} from "~/lib/apis/rwa/freshness";
import { forcedUpdateProxy } from "~/providers/ApolloProvider/utils/observeForcedUpdate";
import { relayStoragePrefix } from "~/lib/relay/relay.storage";
import type { RelayRow } from "~/lib/relay/relay.state";
import { RelayLifecycle } from "./relayLifecycle";

export function relayOutcomeText(row: RelayRow) {
  if (row.status !== "confirmed")
    return `Relay action ${row.status}. Review details before trying again.`;
  switch (row.intentKind) {
    case "update_operators":
      return "Operator permission confirmed. No order was placed by this setup action.";
    case "fee_top_up":
      return "Top-up confirmed. Refreshing the authoritative balance.";
    case "place_buy_order":
    case "place_sell_order":
      return "Order placement confirmed. This does not mean the order has filled.";
    case "cancel_orders":
      return "Cancellation transaction confirmed. Order data is updating.";
    case "process_refund":
      return "Refund transaction confirmed. Balances are updating.";
    default:
      return "Relay transaction confirmed.";
  }
}
function useRelayOwner() {
  const payment = useGasPayment();
  const { dapp } = useWalletContext();
  const auth = useAuthContext();
  const user = useUserContext();
  const notifier = useNotificationsContext();
  const toaster = useToasterContext();
  const queryClient = useQueryClient();
  const invalidateFresh = useFreshQueryInvalidation();
  const location = useLocation();
  const [, render] = useReducer((n: number) => n + 1, 0);
  const transitionRevision = useSyncExternalStore(
    subscribeRelayScope,
    getRelayScopeRevision,
    () => 0
  );
  const identity = JSON.stringify([
    transitionRevision,
    payment.scope,
    payment.wallet,
    auth.authenticatedWalletAddress,
    auth.isAuthenticated,
    auth.isAuthLoading,
  ]);
  const current = useRef({ identity, revision: 0 });
  if (current.current.identity !== identity)
    current.current = { identity, revision: current.current.revision + 1 };
  const revision = current.current.revision;
  const scope =
    payment.scope &&
    auth.isAuthenticated &&
    !auth.isAuthLoading &&
    auth.authenticatedWalletAddress === payment.wallet
      ? payment.scope
      : null;
  const scopeReader = useRef<PermitScope | null>(null);
  scopeReader.current =
    scope && payment.toolkit && payment.wallet && payment.chainId
      ? {
          wallet: payment.wallet,
          authenticatedWallet: auth.authenticatedWalletAddress!,
          network: "basenet",
          rpcUrl: payment.toolkit.rpc.getRpcUrl(),
          chainId: payment.chainId,
          apiUrl: rwaApiUrl,
          revision,
        }
      : null;
  const runtime = useMemo<PermitRuntime | null>(
    () =>
      payment.toolkit && dapp
        ? {
            tezos: payment.toolkit,
            client: dapp.getDAppClient(),
            getScope: () => {
              if (!scopeReader.current)
                throw new Error(
                  "Connect and sign in to the same wallet first."
                );
              return {
                ...scopeReader.current,
                revision: current.current.revision + getRelayScopeRevision(),
              };
            },
            refreshConfig: async () => (await fetchRelayConfig()).config,
          }
        : null,
    [dapp, payment.toolkit]
  );
  const effects = useRef({ user, toaster, invalidateFresh });
  effects.current = { user, toaster, invalidateFresh };
  const owner = useRef<RelayLifecycle | null>(null);
  const ownerIdentity = useRef<string | null>(null);
  const [storageError, setStorageError] = useReducer(
    (_old: string | null, next: string | null) => next,
    null
  );
  useEffect(() => {
    if (!scope || !payment.wallet) return;
    let lifecycle: RelayLifecycle;
    try {
      lifecycle = new RelayLifecycle({
        scope,
        wallet: payment.wallet,
        storage: window.localStorage,
        queryClient,
        isCurrent: () =>
          current.current.identity === identity &&
          current.current.revision === revision &&
          getRelayScopeRevision() === transitionRevision,
        changed: render,
        outcome: (row) => {
          void queryClient.invalidateQueries({
            queryKey: ["relay", scope, "credits"],
          });
          void queryClient.invalidateQueries({
            queryKey: ["relay", scope, "list"],
          });
          if (row.status !== "confirmed") return;
          if (
            [
              "place_buy_order",
              "place_sell_order",
              "cancel_orders",
              "process_refund",
            ].includes(row.intentKind ?? "")
          ) {
            for (const key of [
              "fetchWalletOpenOrders",
              "fetchWalletOrderHistory",
              "fetchWalletActivitySummary",
            ])
              void effects.current.invalidateFresh(key, {
                source: FreshnessSource.Orderbook,
              });
          }
          forcedUpdateProxy.hasForcedUpdate = true;
          void queryClient.invalidateQueries({
            predicate: (query) =>
              ["direct-order-fee", "token-balance", "relay-balance"].includes(
                String(query.queryKey[0])
              ),
          });
          void Promise.all([
            effects.current.user.refetchUserAccountStatus(),
            effects.current.user.refetchUserBalances?.(),
          ]).catch(() => {
            if (
              current.current.identity !== identity ||
              getRelayScopeRevision() !== transitionRevision
            )
              return;
            setStorageError(
              "Transaction confirmed; account refresh failed. Refresh account data before another action."
            );
          });
        },
        notify: (row) => {
          const text = relayOutcomeText(row);
          if (row.status === "confirmed")
            effects.current.toaster.success("Relay confirmed", text);
          else effects.current.toaster.warning("Relay action ended", text);
        },
      });
      owner.current = lifecycle;
      ownerIdentity.current = identity;
      setStorageError(null);
      lifecycle.start();
      render();
    } catch {
      setStorageError(
        "Relay recovery storage is unavailable. Allow browser storage before submitting."
      );
      return;
    }
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key.startsWith(relayStoragePrefix(scope))
      ) {
        lifecycle.restore();
        void lifecycle.reconcile();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      lifecycle.stop();
      owner.current = null;
      ownerIdentity.current = null;
      window.removeEventListener("storage", handleStorage);
    };
  }, [
    identity,
    payment.wallet,
    queryClient,
    revision,
    scope,
    transitionRevision,
  ]);
  const lifecycle = ownerIdentity.current === identity ? owner.current : null;
  const authenticatedNotifier = Boolean(
    scope &&
      notifier.wallet === payment.wallet &&
      notifier.status === NotifierConnectionStatus.Connected
  );
  useEffect(() => {
    lifecycle?.setNotifier(authenticatedNotifier);
  }, [authenticatedNotifier, lifecycle]);
  useEffect(() => {
    if (
      location.pathname.startsWith("/trade") ||
      location.pathname.startsWith("/portfolio")
    )
      void lifecycle?.reconcile();
  }, [lifecycle, location.pathname]);
  useNotifierEvent(
    NotifierChannel.Wallet,
    NotifierWalletEvent.RelayOperationUpdated,
    (frame, wallet) => {
      lifecycle?.event(frame.event_id, wallet, frame.payload);
    }
  );
  return {
    runtime,
    lifecycle,
    records: lifecycle?.records ?? [],
    error: storageError ?? lifecycle?.error ?? null,
    isReady: Boolean(lifecycle?.isReconciled && !lifecycle.error),
    isLocked: (contract: string) => !lifecycle || lifecycle.locked(contract),
    submit: async (signed: Awaited<ReturnType<typeof signPreparedPermit>>) => {
      if (!runtime || !lifecycle || !signed.ordinary)
        throw new Error(
          "Ordinary relay submission is unavailable. Top-up submission remains blocked."
        );
      return lifecycle.submit(
        { ...signed.ordinary, idempotencyKey: uuid() },
        () => assertPermitCurrent(runtime, signed.prepared)
      );
    },
  };
}
const RelayContext = createContext<ReturnType<typeof useRelayOwner> | null>(
  null
);
export function RelayProvider({ children }: React.PropsWithChildren) {
  const value = useRelayOwner();
  return (
    <RelayContext.Provider value={value}>{children}</RelayContext.Provider>
  );
}
export function useRelay() {
  const value = useContext(RelayContext);
  if (!value) throw new Error("useRelay requires RelayProvider");
  return value;
}
