import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  getIntentWalletErrorMessage,
  isIntentWalletFamilySupported,
  loadIntentWalletAdapter,
  type IntentWalletAccount,
  type IntentWalletAdapter,
  type IntentWalletFamily,
  type IntentWalletOption,
} from "~/lib/intents/wallets";

export type IntentWalletFamilyState = {
  status: "idle" | "loading" | "ready" | "error";
  wallets: IntentWalletOption[];
  error: string | null;
};

export type IntentWalletsContext = {
  /** Whether this app can connect wallets for the family at all. */
  isSupported(family: string): family is IntentWalletFamily;
  getFamily(family: IntentWalletFamily): IntentWalletFamilyState;
  /** Loads the family's adapter and detects its wallets. */
  load(family: IntentWalletFamily): void;
  /** Connected account per family (one wallet per network). */
  accounts: Partial<Record<IntentWalletFamily, IntentWalletAccount>>;
  /** Wallet being connected, as `<family>:<walletId>`. */
  connecting: string | null;
  connectError: string | null;
  connect(
    family: IntentWalletFamily,
    walletId: string
  ): Promise<IntentWalletAccount | null>;
  disconnect(family: IntentWalletFamily): Promise<void>;
  getAdapter(family: IntentWalletFamily): Promise<IntentWalletAdapter>;
};

const idle: IntentWalletFamilyState = {
  status: "idle",
  wallets: [],
  error: null,
};

const context = createContext<IntentWalletsContext | undefined>(undefined);

/**
 * Solana, NEAR, Aptos and Bitcoin wallets for 1Click deposits, next to the
 * wagmi EVM wallet. Adapters load on first use; connections last for the
 * page session (a reload asks the wallet again, tracking never needs it).
 */
export function IntentWalletsProvider({ children }: { children: ReactNode }) {
  const [families, setFamilies] = useState<
    Partial<Record<IntentWalletFamily, IntentWalletFamilyState>>
  >({});
  const [accounts, setAccounts] = useState<
    Partial<Record<IntentWalletFamily, IntentWalletAccount>>
  >({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const listeners = useRef(new Map<IntentWalletFamily, () => void>());
  const loading = useRef(new Set<IntentWalletFamily>());
  const accountsRef = useRef(accounts);
  accountsRef.current = accounts;

  useEffect(() => {
    const subscriptions = listeners.current;
    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
      subscriptions.clear();
    };
  }, []);

  const setFamily = (
    family: IntentWalletFamily,
    state: IntentWalletFamilyState
  ) => setFamilies((current) => ({ ...current, [family]: state }));

  const load = useCallback((family: IntentWalletFamily) => {
    if (loading.current.has(family) || listeners.current.has(family)) return;
    loading.current.add(family);
    setFamily(family, { status: "loading", wallets: [], error: null });
    loadIntentWalletAdapter(family)
      .then((adapter) => {
        const refresh = () =>
          setFamily(family, {
            status: "ready",
            wallets: adapter.getWallets(),
            error: null,
          });
        refresh();
        listeners.current.set(family, adapter.onWalletsChange(refresh));
      })
      .catch((error: unknown) =>
        setFamily(family, {
          status: "error",
          wallets: [],
          error: `Wallets could not be loaded: ${getIntentWalletErrorMessage(error)}`,
        })
      )
      .finally(() => loading.current.delete(family));
  }, []);

  const connect = useCallback(
    async (family: IntentWalletFamily, walletId: string) => {
      setConnecting(`${family}:${walletId}`);
      setConnectError(null);
      try {
        const adapter = await loadIntentWalletAdapter(family);
        const account = await adapter.connect(walletId);
        setAccounts((current) => ({ ...current, [family]: account }));
        return account;
      } catch (error) {
        setConnectError(getIntentWalletErrorMessage(error));
        return null;
      } finally {
        setConnecting(null);
      }
    },
    []
  );

  const disconnect = useCallback(async (family: IntentWalletFamily) => {
    const account = accountsRef.current[family];
    setAccounts((current) => {
      const next = { ...current };
      delete next[family];
      return next;
    });
    if (!account) return;
    try {
      const adapter = await loadIntentWalletAdapter(family);
      await adapter.disconnect(account.walletId);
    } catch {
      // The app forgot the account either way; the wallet keeps its own state.
    }
  }, []);

  const value = useMemo<IntentWalletsContext>(
    () => ({
      isSupported: isIntentWalletFamilySupported,
      getFamily: (family) => families[family] ?? idle,
      load,
      accounts,
      connecting,
      connectError,
      connect,
      disconnect,
      getAdapter: loadIntentWalletAdapter,
    }),
    [accounts, connect, connectError, connecting, disconnect, families, load]
  );

  return <context.Provider value={value}>{children}</context.Provider>;
}

export function useIntentWalletsContext() {
  const value = useContext(context);
  if (!value)
    throw new Error("Intent wallets context requires IntentWalletsProvider");
  return value;
}
