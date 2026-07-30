import { ConnectWallet } from "~/layouts/PageLayout/ConnectWallet";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { RButton } from "~/lib/atoms/RButton";

export function OpenOrdersConnectWalletState() {
  const { changeUser, connect, isLoading, signOut, userAddress } =
    useUserContext();
  
  return (
    <section className={styles.state}>
      <RText size="body-m" weight="medium">
        No Open Orders
      </RText>
      <RText
        className={styles.stateDescription}
        color="neutral-600"
        size="body-sm"
      >
        Connect your wallet to view your active orders.
      </RText>
      <RButton
        onClick={connect}
        size="medium"
        tone="black"
        variant="primary"
      >
        <RText size="body-s" weight="medium" color="neutral-white">
          Connect Wallet
        </RText>
      </RButton>
    </section>
  );
}
