import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import { PortfolioMetric } from "./PortfolioMetric";
import { PortfolioValueChart } from "./PortfolioValueChart";
import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";
import { RPriceChange } from "~/lib/molecules/RPriceChange";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";
import { RSkeleton, RSkeletonReveal } from "~/lib/atoms/RSkeleton";

function ValueDetailsSkeleton() {
  return (
    <div aria-busy="true" className={styles.valueDetails} role="status">
      <RSkeleton
        radius="none"
        className={styles.skeletonLabel}
        variant="surface"
      />
      <RSkeleton
        radius="none"
        className={styles.skeletonValue}
        variant="surface"
      />
      <RSkeleton
        radius="none"
        className={styles.skeletonChange}
        variant="surface"
      />
    </div>
  );
}

type PortfolioGeneralStatsProps = {
  stats: {
    dividendsEarned: number;
    estNetYieldPct: number;
    pnl24h: number;
    pnl24hPercentage: number;
    totalGrowth: number;
    totalValue: number;
  };
};

export function PortfolioGeneralStats({ stats }: PortfolioGeneralStatsProps) {
  const {
    dividendsEarned,
    estNetYieldPct,
    pnl24h,
    pnl24hPercentage,
    totalGrowth,
    totalValue,
  } = stats;

  const { isWalletLoading, isPortfolioLoading } = usePortfolioContext();

  return (
    <section className={styles.stats} aria-label="Portfolio summary">
      <div className={styles.portfolioValueSection}>
        <RSkeletonReveal
          className={styles.valueDetails}
          isLoading={isWalletLoading || isPortfolioLoading}
          skeleton={<ValueDetailsSkeleton />}
        >
          <RText color="neutral-700" size="body-s" weight="medium">
            Total Portfolio Value
          </RText>
          <RHeading className={styles.portfolioValue} size="h3" weight="medium">
            $
            <Money fiat tooltip={false}>
              {totalValue}
            </Money>
          </RHeading>
          <RPriceChange
            size="body-sm"
            showPeriodLabel={true}
            amount={pnl24h}
            percentage={pnl24hPercentage}
          />
        </RSkeletonReveal>

        <PortfolioValueChart />
      </div>

      <div className={styles.metrics}>
        <PortfolioMetric
          description="Asset growth + dividends"
          label="Total Growth"
          value={
            <>
              {/*{totalGrowth >= 0 ? "+" : "-"}*/}
              {/*<Money fiat tooltip={false}>*/}
              {/*  {totalGrowth}*/}
              {/*</Money>*/}
              {/*%*/}--
            </>
          }
        />
        <PortfolioMetric
          description="Paid in your wallet"
          label="Dividends Earned"
          value={
            <>
              {/*$*/}
              {/*<Money fiat tooltip={false}>*/}
              {/*  {dividendsEarned}*/}
              {/*</Money>*/}
              --
            </>
          }
        />
        <PortfolioMetric
          description="Blended across holdings"
          label="Est. Net Yield"
          color="accent-green-500"
          isLoading={isPortfolioLoading}
          value={
            <>
              <Money fiat tooltip={false}>
                {estNetYieldPct}
              </Money>
              %
            </>
          }
        />
      </div>
    </section>
  );
}
