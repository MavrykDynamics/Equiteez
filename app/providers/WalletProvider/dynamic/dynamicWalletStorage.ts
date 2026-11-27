/**
 * Remembers which embedded wallet a Dynamic user selected, so a restored
 * session binds to the same key instead of guessing. Holds ids only, never
 * key material. Storage can be unavailable (private mode), so every access is
 * best-effort.
 */
const STORAGE_KEY = "equiteez:dynamic-wallet-selection";

type Selections = Record<string, string>;

function readSelections(): Selections {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};

    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Selections)
      : {};
  } catch {
    return {};
  }
}

export function getSavedDynamicWalletId(userId: string): string | null {
  const walletId = readSelections()[userId];

  return typeof walletId === "string" ? walletId : null;
}

export function saveDynamicWalletId(userId: string, walletId: string) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readSelections(), [userId]: walletId })
    );
  } catch {
    // Selection is only a convenience; the wallet still works without it
  }
}
