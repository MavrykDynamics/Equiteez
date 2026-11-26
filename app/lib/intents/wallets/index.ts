import type {
  IntentWalletAdapter,
  IntentWalletFamily,
} from "./intentWallet.types";

export * from "./intentWallet.types";

/**
 * Lazy adapter per network family. Each import happens only in the browser,
 * the first time the user picks that network.
 */
const loaders: Partial<
  Record<IntentWalletFamily, () => Promise<IntentWalletAdapter>>
> = {};

const cache = new Map<IntentWalletFamily, Promise<IntentWalletAdapter>>();

export const isIntentWalletFamilySupported = (
  family: string
): family is IntentWalletFamily => family in loaders;

export function loadIntentWalletAdapter(
  family: IntentWalletFamily
): Promise<IntentWalletAdapter> {
  const loader = loaders[family];
  if (!loader)
    return Promise.reject(
      new Error(`Wallets for this network are not supported yet.`)
    );
  let adapter = cache.get(family);
  if (!adapter) {
    adapter = loader();
    // A failed chunk load can be retried later.
    adapter.catch(() => cache.delete(family));
    cache.set(family, adapter);
  }
  return adapter;
}
