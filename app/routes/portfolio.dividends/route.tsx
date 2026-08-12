import styles from "./styles.module.css";
import { WelcomeBlock } from "~/routes/portfolio/components/WelcomeBlock/WelcomeBlock";
import { ROUTES } from "~/consts";
import { DividendsStats } from "~/routes/portfolio.dividends/components/DividendsStats/DividendsStats";
import { dividendsStatsMock } from "~/routes/portfolio.dividends/components/DividendsStats/DividendsStats.constants";
import { MonthlyIncome } from "~/routes/portfolio.dividends/components/MonthlyIncome/MonthlyIncome";
import { monthlyIncomeMock } from "~/routes/portfolio.dividends/components/MonthlyIncome/MonthlyIncome.constants";

export default function PortfolioOverview() {
  return (
    <div className={styles.wrapper}>
      <WelcomeBlock activeTab={ROUTES.portfolioDividends} userName="Josh" />
      <div className={styles.content}>
        <DividendsStats data={dividendsStatsMock} />
        <MonthlyIncome data={monthlyIncomeMock} />
      </div>
    </div>
  );
}
