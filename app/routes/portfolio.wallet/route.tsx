/**
 * Portfolio → Wallet (Figma "Settings and key export", 8131:518): the signing
 * key and KYC Info from live data; for email wallets also Security, Backup and
 * Export private key (partly the design's mock until Dynamic backs them) and
 * the "Confirm it's you" dialog their Dynamic actions open.
 */
import { ROUTES } from "~/consts";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { WelcomeBlock } from "~/routes/portfolio/components/WelcomeBlock/WelcomeBlock";

import { ConfirmIdentityModal } from "./components/ConfirmIdentityModal";
import { KycInfo } from "./components/KycInfo";
import { SigningKey } from "./components/SigningKey";
import { EmailWalletSettings } from "./components/WalletSecurity";

import styles from "./styles.module.css";

export default function PortfolioWallet() {
  const { identity } = useWalletContext();
  const isEmailWallet = identity?.provider === "dynamic";

  return (
    <div className={styles.wrapper}>
      <WelcomeBlock activeTab={ROUTES.portfolioWallet} />

      <div className={styles.content}>
        <SigningKey />

        <section className={styles.card}>
          <RText size="body-m" weight="medium">
            KYC Info
          </RText>
          <KycInfo />
        </section>

        {isEmailWallet ? (
          <>
            <EmailWalletSettings />
            <ConfirmIdentityModal />
          </>
        ) : null}
      </div>
    </div>
  );
}
