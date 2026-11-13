/**
 * Which wallet the user chose last, so a reload restores that one. Users from
 * before email wallets have nothing saved and get Mavryk Wallet, as before.
 */
import type { WalletProviderKind } from "~/services/direct/attempt.types";

const STORAGE_KEY = "equiteez:wallet-provider";

export function readSavedWalletProvider(): WalletProviderKind | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);

    return value === "dynamic" || value === "mavryk_extension" ? value : null;
  } catch {
    return null;
  }
}

export function saveWalletProvider(provider: WalletProviderKind | null) {
  try {
    if (provider) window.localStorage.setItem(STORAGE_KEY, provider);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Without storage the next visit falls back to Mavryk Wallet
  }
}
