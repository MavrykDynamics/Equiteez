import styles from "./styles.module.css";
import { WelcomeBlock } from "~/routes/portfolio/components/WelcomeBlock/WelcomeBlock";
import { PortfolioGeneralStats } from "~/routes/portfolio._index/components/PortfolioGeneralStats/PortfolioGeneralStats";
import { ROUTES } from "~/consts";

export default function PortfolioOverview() {
  return (
    <div className={styles.wrapper}>
      <WelcomeBlock activeTab={ROUTES.portfolio} userName="Josh" />
      <div className={styles.content}>
        <PortfolioGeneralStats />
      </div>
    </div>
  );
}
