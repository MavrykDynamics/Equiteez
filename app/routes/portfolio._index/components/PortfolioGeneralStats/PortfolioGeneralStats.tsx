import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import { PortfolioMetric } from "./PortfolioMetric";
import { PortfolioValueChart } from "./PortfolioValueChart";
import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";
import { RPriceChange } from "~/lib/molecules/RPriceChange";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";

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
  const isPositivePnl = pnl24h >= 0;

  const { isLoading } = usePortfolioContext();

  return (
    <section className={styles.stats} aria-label="Portfolio summary">
      <div className={styles.portfolioValueSection}>
        <div className={styles.valueDetails}>
          <RText color="neutral-700" size="body-s" weight="medium">
            Total Portfolio Value
          </RText>
          <RHeading className={styles.portfolioValue} size="h3" weight="medium">
            {isLoading ? (
              "--"
            ) : (
              <>
                $
                <Money fiat tooltip={false}>
                  {totalValue}
                </Money>
              </>
            )}
          </RHeading>
          <RPriceChange
            size="body-sm"
            showPeriodLabel={true}
            amount={pnl24h}
            percentage={pnl24hPercentage}
          />
        </div>

        <PortfolioValueChart />
      </div>

      <div className={styles.metrics}>
        <PortfolioMetric
          description="Asset growth + dividends"
          label="Total Growth"
          value={
            <RHeading
              // color={totalGrowth >= 0 ? "green-500" : "red-500"}
              size="h4"
              weight="medium"
            >
              {/*{totalGrowth >= 0 ? "+" : "-"}*/}
              {/*<Money fiat tooltip={false}>*/}
              {/*  {totalGrowth}*/}
              {/*</Money>*/}
              {/*%*/}--
            </RHeading>
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
