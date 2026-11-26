import {
  IntentWalletError,
  type IntentWalletAccount,
  type IntentWalletAdapter,
  type IntentWalletFamily,
  type IntentWalletTransfer,
} from "./intentWallet.types";
import type { IntentWalletsContext } from "~/providers/IntentWalletsProvider/IntentWalletsProvider";

/** In-memory wallet adapter for tests: one installed wallet, scripted sends. */
export function createFakeWalletAdapter(
  family: IntentWalletFamily,
  {
    address,
    balance = 10n ** 30n,
    walletId = "fake",
    walletName = "Fake Wallet",
  }: {
    address: string;
    balance?: bigint;
    walletId?: string;
    walletName?: string;
  }
) {
  const sends: IntentWalletTransfer[] = [];
  let connected: string | null = null;
  let nextSend: (() => Promise<string>) | null = null;
  const adapter: IntentWalletAdapter & {
    sends: IntentWalletTransfer[];
    /** Scripts the next send (e.g. a rejection). */
    onNextSend(run: () => Promise<string>): void;
    /** Simulates the user switching accounts in the wallet. */
    switchAccount(next: string | null): void;
  } = {
    family,
    sends,
    getWallets: () => [{ id: walletId, name: walletName, isInstalled: true }],
    onWalletsChange: () => () => {},
    async connect(id) {
      if (id !== walletId) throw new Error("Unknown wallet.");
      connected = address;
      return { walletId, walletName, address };
    },
    async disconnect() {
      connected = null;
    },
    getAccount: async () => connected,
    getBalance: async () => balance,
    async send(id, transfer) {
      if (id !== walletId)
        throw new IntentWalletError("not_sent", "Unknown wallet.");
      sends.push(transfer);
      const run = nextSend;
      nextSend = null;
      return run ? run() : `${family}-tx-${sends.length}`;
    },
    onNextSend(run) {
      nextSend = run;
    },
    switchAccount(next) {
      connected = next;
    },
  };
  return adapter;
}

/** Context value for components/hooks rendered without the provider. */
export function fakeIntentWalletsContext(
  accounts: Partial<Record<IntentWalletFamily, IntentWalletAccount>> = {},
  adapters: Partial<Record<IntentWalletFamily, IntentWalletAdapter>> = {}
): IntentWalletsContext {
  return {
    isSupported: (family): family is IntentWalletFamily =>
      family !== "evm" && family in adapters,
    getFamily: (family) => ({
      status: adapters[family] ? "ready" : "idle",
      wallets: adapters[family]?.getWallets() ?? [],
      error: null,
    }),
    load: () => {},
    accounts,
    connecting: null,
    connectError: null,
    connect: async (family, walletId) =>
      (await adapters[family]?.connect(walletId)) ?? null,
    disconnect: async () => {},
    getAdapter: async (family) => {
      const adapter = adapters[family];
      if (!adapter) throw new Error("No adapter.");
      return adapter;
    },
  };
}
