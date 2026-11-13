/**
 * Portfolio → Profile. For now only "KYC Info": the wallet's KYC status and,
 * with KYC_SELF_SERVICE_ENABLED, "Start KYC" (registration through
 * POST /api/kyc, as "Get Pro" does in Mavryk Wallet).
 */
import { ROUTES } from "~/consts";
import { RText } from "~/lib/atoms/RTypography/RText";
import { WelcomeBlock } from "~/routes/portfolio/components/WelcomeBlock/WelcomeBlock";

import { KycInfo } from "./components/KycInfo";

import styles from "./styles.module.css";

export default function PortfolioProfile() {
  return (
    <div className={styles.wrapper}>
      <WelcomeBlock activeTab={ROUTES.portfolioProfile} />

      <section className={styles.card}>
        <div className={styles.section}>
          <RText size="body-m" weight="medium">
            KYC Info
          </RText>
          <KycInfo />
        </div>
      </section>
    </div>
  );
}
