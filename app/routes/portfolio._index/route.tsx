import { useQuery } from "@tanstack/react-query";
import styles from "./styles.module.css";
import { FullScreenSpinner } from "~/lib/atoms/Spinner/Spinner";
import { fetchWalletPortfolio } from "~/lib/apis/rwa";
import { WelcomeBlock } from "~/routes/portfolio/components/WelcomeBlock/WelcomeBlock";
import { PortfolioGeneralStats } from "~/routes/portfolio._index/components/PortfolioGeneralStats/PortfolioGeneralStats";
import { AssetsStats } from "~/routes/portfolio._index/components/AssetsStats/AssetsStats";
import { ROUTES } from "~/consts";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useMemo } from "react";

export default function PortfolioOverview() {
  const { isAuthenticated } = useAuthContext();
  const { userAddress } = useUserContext();
  const { wallet, isLoading: isWalletLoading } = usePortfolioContext();

  const portfolioQuery = useQuery({
    queryKey: ["rwa-wallet-portfolio", userAddress],
    queryFn: () =>
      fetchWalletPortfolio({
        walletAddress: userAddress || "",
      }),
    enabled: isAuthenticated && Boolean(userAddress),
  });

  const portfolioStats = useMemo(
    () => ({
      dividendsEarned: 6_853,
      totalGrowth: 3,
      estNetYieldPct: portfolioQuery.data?.est_net_yield_pct ?? 0,
      pnl24h: wallet?.pnl_24h ?? 0,
      pnl24hPercentage: wallet?.pnl_percentage ?? 0,

      totalValue:
        portfolioQuery.data?.total_value ?? wallet?.account_value ?? 0,
    }),
    [
      portfolioQuery.data?.est_net_yield_pct,
      portfolioQuery.data?.total_value,
      wallet?.account_value,
      wallet?.pnl_24h,
      wallet?.pnl_percentage,
    ]
  );

  if (
    isWalletLoading ||
    ((portfolioQuery.isLoading ||
      portfolioQuery.isFetching ||
      portfolioQuery.isPending) &&
      isAuthenticated &&
      Boolean(userAddress))
  ) {
    return <FullScreenSpinner />;
  }

  return (
    <div className={styles.wrapper}>
      <WelcomeBlock activeTab={ROUTES.portfolio} userName="Josh" />
      <div className={styles.content}>
        <PortfolioGeneralStats stats={portfolioStats} />
        <AssetsStats />
      </div>
    </div>
  );
}
