/**
 * Dynamic wallet configuration. Safe to import anywhere (no SDK import), so
 * the UI can decide whether to offer email wallets without loading Dynamic.
 *
 * DYNAMIC_ENVIRONMENT_ID: public environment id from app.dynamic.xyz
 * DYNAMIC_WALLET_ENABLED: "true" to offer email wallets in the UI
 * DYNAMIC_DIRECT_ENABLED: lets email wallets run gated actions (trading,
 *   withdrawals, bridge deposits) before they are marked tested:
 *   "true" for all of them, or a comma-separated list such as
 *   "orderbook.buy,orderbook.sell" to enable them one by one
 * GOOGLE_CLIENT_ID: public Google OAuth client id that asks Google for Drive
 *   access when an email-wallet user backs up to Google Drive (the app's
 *   origins under "Authorized JavaScript origins", Google Drive API enabled)
 * WALLET_CHOICE_ENABLED: "true" to let the user choose between Mavryk Wallet
 *   and the email wallet when signing in; otherwise sign-in opens the email
 *   wallet straight away (Mavryk Wallet stays the only option while email
 *   wallets are off)
 */
const PLACEHOLDER_ENVIRONMENT_ID = "YOUR_DYNAMIC_ENVIRONMENT_ID";

export function getDynamicEnvironmentId(): string | null {
  const environmentId = process.env.DYNAMIC_ENVIRONMENT_ID?.trim();

  return environmentId && environmentId !== PLACEHOLDER_ENVIRONMENT_ID
    ? environmentId
    : null;
}

export function isDynamicWalletEnabled(): boolean {
  return (
    process.env.DYNAMIC_WALLET_ENABLED === "true" &&
    getDynamicEnvironmentId() !== null
  );
}

/** Whether gated `action` is switched on for email wallets. */
export function isDynamicDirectEnabled(action: string): boolean {
  const value = process.env.DYNAMIC_DIRECT_ENABLED?.trim();

  if (!value) return false;
  if (value === "true") return true;

  return value
    .split(",")
    .map((entry) => entry.trim())
    .includes(action);
}

/** Google OAuth client id for the Drive backup token, or null if unset. */
export function getGoogleClientId(): string | null {
  return process.env.GOOGLE_CLIENT_ID?.trim() || null;
}

/** Sign-in offers Mavryk Wallet next to the email wallet. */
export function isWalletChoiceEnabled(): boolean {
  return process.env.WALLET_CHOICE_ENABLED === "true";
}
