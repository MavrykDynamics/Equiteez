/**
 * Dynamic wallet configuration. Safe to import anywhere (no SDK import), so
 * the UI can decide whether to offer email wallets without loading Dynamic.
 *
 * DYNAMIC_ENVIRONMENT_ID: public environment id from app.dynamic.xyz
 * DYNAMIC_WALLET_ENABLED: "true" to offer email wallets in the UI
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
