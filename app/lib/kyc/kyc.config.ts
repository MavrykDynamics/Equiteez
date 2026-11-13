/**
 * KYC_SELF_SERVICE_ENABLED: "true" to offer "Start KYC" in the Portfolio
 * profile (registration through POST /api/kyc). Without it the profile only
 * shows the KYC status.
 */
export function isKycSelfServiceEnabled(): boolean {
  return process.env.KYC_SELF_SERVICE_ENABLED === "true";
}
