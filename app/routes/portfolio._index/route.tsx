import styles from "./styles.module.css";
import { FullScreenSpinner } from "~/lib/atoms/Spinner/Spinner";
import { WelcomeBlock } from "~/routes/portfolio/components/WelcomeBlock/WelcomeBlock";
import { PortfolioGeneralStats } from "~/routes/portfolio._index/components/PortfolioGeneralStats/PortfolioGeneralStats";
import { AssetsStats } from "~/routes/portfolio._index/components/AssetsStats/AssetsStats";
import { ROUTES } from "~/consts";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useMemo } from "react";

export default function PortfolioOverview() {
  const { isAuthenticated } = useAuthContext();
  const { wallet, portfolio, isLoading } = usePortfolioContext();

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

  if (isLoading && isAuthenticated) {
    return <FullScreenSpinner />;
  }

  return (
    <div className={styles.wrapper}>
      <WelcomeBlock activeTab={ROUTES.portfolio} userName="Josh" />
      <div className={styles.content}>
        <PortfolioGeneralStats stats={portfolioStats} />
        <AssetsStats assets={portfolio?.assets ?? []} portfolioTotal={portfolioStats.totalValue} />
      </div>
    </div>
  );
}
