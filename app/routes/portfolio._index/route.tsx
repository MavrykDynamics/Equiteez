import { useMemo } from "react";

import styles from "./styles.module.css";
import { WelcomeBlock } from "~/routes/portfolio/components/WelcomeBlock/WelcomeBlock";
import { PortfolioGeneralStats } from "~/routes/portfolio._index/components/PortfolioGeneralStats/PortfolioGeneralStats";
import { AssetsStats } from "~/routes/portfolio._index/components/AssetsStats/AssetsStats";
import { ROUTES } from "~/consts";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";
import { usePortfolioOverviewNotifierInvalidation } from "~/routes/portfolio._index/hooks/usePortfolioOverviewNotifierInvalidation";

export default function PortfolioOverview() {
  const { wallet, portfolio } = usePortfolioContext();
  usePortfolioOverviewNotifierInvalidation();

  const portfolioStats = useMemo(
    () => ({
      // TODO remove mock data
      dividendsEarned: 6_853,
      // TODO remove mock data
      totalGrowth: 3,
      estNetYieldPct: portfolio?.est_net_yield_pct ?? 0,
      pnl24h: wallet?.pnl_24h ?? 0,
      pnl24hPercentage: wallet?.pnl_percentage ?? 0,
      totalValue: portfolio?.total_value ?? wallet?.account_value ?? 0,
    }),
    [
      portfolio?.est_net_yield_pct,
      portfolio?.total_value,
      wallet?.account_value,
      wallet?.pnl_24h,
      wallet?.pnl_percentage,
    ]
  );

  return (
    <div className={styles.wrapper}>
      <WelcomeBlock activeTab={ROUTES.portfolio} userName="Josh" />
      <div className={styles.content}>
        <PortfolioGeneralStats stats={portfolioStats} />
        <AssetsStats
          assets={portfolio?.assets ?? []}
          portfolioTotal={portfolioStats.totalValue}
        />
      </div>
    </div>
  );
}
