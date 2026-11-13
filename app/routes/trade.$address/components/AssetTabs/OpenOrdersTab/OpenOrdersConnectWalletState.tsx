import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";
import { useConnectWallet } from "~/templates/ConnectWalletModal/connectWalletModal.context";
import { RButton } from "~/lib/atoms/RButton";

export function OpenOrdersConnectWalletState({
  title = "No Open Orders",
  description = "Connect your wallet to view your active orders.",
}: {
  title?: string;
  description?: string;
}) {
  const openConnectWallet = useConnectWallet();

  return (
    <section className={styles.state}>
      <RText size="body-m" weight="medium">
        {title}
      </RText>
      <RText
        className={styles.stateDescription}
        color="neutral-600"
        size="body-sm"
      >
        {description}
      </RText>
      <RButton
        onClick={() => openConnectWallet()}
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
