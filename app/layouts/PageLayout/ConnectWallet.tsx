import { useGasPayment } from "~/providers/GasPaymentProvider/GasPaymentProvider";
import { RButton } from "~/lib/atoms/RButton";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { CustomSuspense } from "~/templates/CustomSuspense";

import styles from "./ConnectWallet.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";
import { MvrkWalletDropdown } from "./WalletDropdown/MvrkWalletDropdown";
import { CreditsWalletDropdown } from "~/layouts/PageLayout/WalletDropdown/CreditsWalletDropdown/CreditsWalletDropdown";

export const ConnectWallet = () => {
  const { method } = useGasPayment();
  const { connect, isLoading, userAddress } = useUserContext();

  const handleConnect = () => {
    // Opening the wallet popup should not trigger RButton's async loading state.
    void Promise.resolve()
      .then(connect)
      .catch(() => {
        console.error("Failed to connect wallet.");
      });
  };

  return (
    <CustomSuspense loading={isLoading}>
      {userAddress ? (
        <>
          {method === "mvrk" ? (
            <MvrkWalletDropdown userAddress={userAddress} />
          ) : (
            <CreditsWalletDropdown userAddress={userAddress} />
          )}
        </>
      ) : (
        <RButton
          onClick={handleConnect}
          className={styles.connectWalletBtn}
          size="medium"
          tone="black"
          variant="primary"
        >
          <RText color="neutral-white" size="body-s" weight="medium">
            Connect Wallet
          </RText>
        </RButton>
      )}
    </CustomSuspense>
  );
};
