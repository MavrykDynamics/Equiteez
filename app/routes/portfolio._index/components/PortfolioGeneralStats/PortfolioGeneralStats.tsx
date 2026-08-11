import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";

import { PortfolioMetric } from "./PortfolioMetric";
import { PortfolioValueChart } from "./PortfolioValueChart";
import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";

export function PortfolioGeneralStats() {
  const { wallet } = usePortfolioContext();

  const portfolioValue = wallet?.account_value ?? 0;
  const pnl24h = wallet?.pnl_24h ?? 0;
  const pnl24hPercentage =
    portfolioValue > 0 && pnl24h > 0
      ? (pnl24h / (portfolioValue - pnl24h)) * 100
      : 0;

  const isPositivePnl = pnl24h >= 0;

  // TODO remove mock data
  const totalGrowth = 3;
  const dividendsEarned = 6_853;
  const netYield = 7.83;

  return (
    <section className={styles.stats} aria-label="Portfolio summary">
      <div className={styles.portfolioValueSection}>
        <div className={styles.valueDetails}>
          <RText color="neutral-700" size="body-s" weight="medium">
            Total Portfolio Value
          </RText>
          <RHeading className={styles.portfolioValue} size="h3" weight="medium">
            $
            <Money fiat tooltip={false}>
              {wallet?.account_value ?? 0}
            </Money>
          </RHeading>
          <div className={styles.dailyChange}>
            <span
              aria-hidden="true"
              className={
                isPositivePnl ? styles.positiveMarker : styles.negativeMarker
              }
            />
            <RText
              color={isPositivePnl ? "green-500" : "red-500"}
              size="body-sm"
            >
              $
              <Money fiat tooltip={false}>
                {pnl24h}
              </Money>{" "}
              ({isPositivePnl ? "+" : "-"}
              <Money fiat tooltip={false}>
                {pnl24hPercentage}
              </Money>
              % )
            </RText>
            <RText color="neutral-700" size="body-sm">
              24h
            </RText>
          </div>
        </div>

        <PortfolioValueChart />
      </div>

      <div className={styles.metrics}>
        <PortfolioMetric
          description="Asset growth + dividends"
          label="Total Growth"
          value={
            <RHeading
              color={totalGrowth >= 0 ? "green-500" : "red-500"}
              size="h4"
              weight="medium"
            >
              {totalGrowth >= 0 ? "+" : "-"}
              <Money fiat tooltip={false}>
                {totalGrowth}
              </Money>
              %
            </RHeading>
          }
        />
        <PortfolioMetric
          description="Paid in your wallet"
          label="Dividends Earned"
          value={
            <>
              $
              <Money fiat tooltip={false}>
                {dividendsEarned}
              </Money>
            </>
          }
        />
        <PortfolioMetric
          description="Blended across holdings"
          label="Est. Net Yield"
          value={
            <>
              <Money fiat tooltip={false}>
                {netYield}
              </Money>
              %
            </>
          }
        />
      </div>
    </section>
  );
}
