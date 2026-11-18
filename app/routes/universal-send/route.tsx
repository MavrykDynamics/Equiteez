import { ConnectWallet } from "~/layouts/PageLayout/ConnectWallet";
import { Container } from "~/lib/atoms/Container/Container";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { INTENTS_DEPOSIT_ENABLED } from "~/consts/intents";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";

import { UniversalSendFlow } from "./components/UniversalSendFlow";
import styles from "./styles.module.css";

/**
 * Test page for the 1Click (NEAR Intents) flow. Same logic as
 * Deposit Funds → Swap From Any Chain; the final design is not ready yet.
 */
export default function UniversalSend() {
  const { isAuthenticated } = useAuthContext();

  return (
    <Container className={styles.page}>
      <div className={styles.column}>
        <div className={styles.intro}>
          <RHeading size="h4" weight="medium">
            Universal Send
          </RHeading>
          <RText color="neutral-700" size="body-sm">
            Send from any supported network and receive on your Mavryk account.
          </RText>
        </div>

        {!INTENTS_DEPOSIT_ENABLED ? (
          <div className={styles.message} role="status">
            <RText color="neutral-700" size="body-sm">
              Universal Send is turned off. Set INTENTS_DEPOSIT_ENABLED=true to
              use it.
            </RText>
          </div>
        ) : !isAuthenticated ? (
          <div className={styles.message}>
            <RText color="neutral-700" size="body-sm">
              Connect your wallet to send to your Equiteez account.
            </RText>
            <ConnectWallet />
          </div>
        ) : (
          <UniversalSendFlow />
        )}
      </div>
    </Container>
  );
}
