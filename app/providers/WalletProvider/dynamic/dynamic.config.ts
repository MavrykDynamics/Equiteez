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
