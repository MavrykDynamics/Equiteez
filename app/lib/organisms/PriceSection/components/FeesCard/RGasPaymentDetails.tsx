import { useState } from "react";
import { RButton } from "~/lib/atoms/RButton";
import { AddCreditsModal } from "~/layouts/PageLayout/WalletDropdown/AddCreditsModal/AddCreditsModal";
import { useCredits } from "~/layouts/PageLayout/WalletDropdown/CreditsWalletDropdown/useCredits";
import { getCreditFeeText } from "~/layouts/PageLayout/WalletDropdown/CreditsWalletDropdown/credits.utils";
import styles from "./styles.module.css";

export function RGasPaymentDetails({
  method,
  variant,
  networkFee,
  storageCost,
}: {
  method: "credits" | "mvrk";
  variant: string;
  networkFee?: string;
  storageCost?: string;
}) {
  const credits = useCredits(method === "credits");
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  return (
    <div className={styles.paymentDetails}>
      <p>Payment method: {method === "mvrk" ? "MVRK" : "Credits"}</p>
      {method === "mvrk" ? (
        <p>
          {networkFee === undefined
            ? "Network fee estimate unavailable."
            : `Estimated network fee: ${networkFee} MVRK. Storage cost: ${storageCost} MVRK. Paid by your wallet.`}
        </p>
      ) : (
        <>
          <p role="status">
            {credits.status === "unknown"
              ? "Connect and sign in to view the service fee."
              : getCreditFeeText(credits.config, variant)}
          </p>
          {credits.canTopUp && (
            <RButton
              size="small"
              variant="secondary"
              onClick={() => setIsTopUpOpen(true)}
            >
              Top Up
            </RButton>
          )}
          <AddCreditsModal
            isOpen={isTopUpOpen && credits.canTopUp}
            onClose={() => setIsTopUpOpen(false)}
          />
        </>
      )}
    </div>
  );
}
