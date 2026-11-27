/**
 * KYC_SELF_SERVICE_ENABLED: "true" to offer "Start KYC" in Portfolio → Wallet
 * (registration through POST /api/kyc). Without it the page only shows the
 * KYC status.
 */
export function isKycSelfServiceEnabled(): boolean {
  return process.env.KYC_SELF_SERVICE_ENABLED === "true";
}
