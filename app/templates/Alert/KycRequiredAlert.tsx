/**
 * Trading needs KYC. With self-service KYC the user verifies in Portfolio →
 * Wallet; otherwise through Mavryk Pro in Mavryk Wallet, as before.
 */
import { Link } from "@remix-run/react";

import { ROUTES } from "~/consts";
import { isKycSelfServiceEnabled } from "~/lib/kyc/kyc.config";

import { RAlert } from "./RAlert";
import styles from "./RAlert.module.css";

export function KycRequiredAlert() {
  if (!isKycSelfServiceEnabled()) {
    return (
      <RAlert type="warning" header="Verify with Mavryk Pro to Trade">
        Trading on Equiteez requires the Mavryk Pro wallet for enhanced security
        and regulatory compliance. Upgrade to Mavryk Pro inside your Mavryk
        Wallet.
      </RAlert>
    );
  }

  return (
    <RAlert type="warning" header="Verify Your Wallet to Trade">
      Trading on Equiteez requires KYC verification.{" "}
      <Link className={styles.link} to={ROUTES.portfolioWallet}>
        Start KYC
      </Link>{" "}
      in your wallet settings.
    </RAlert>
  );
}
