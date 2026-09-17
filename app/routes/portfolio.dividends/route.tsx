import styles from "./styles.module.css";
import { WelcomeBlock } from "~/routes/portfolio/components/WelcomeBlock/WelcomeBlock";
import { ROUTES } from "~/consts";
import { DividendsStats } from "~/routes/portfolio.dividends/components/DividendsStats/DividendsStats";
import { dividendsStatsMock } from "~/routes/portfolio.dividends/components/DividendsStats/DividendsStats.constants";
import { MonthlyIncome } from "~/routes/portfolio.dividends/components/MonthlyIncome/MonthlyIncome";
import { monthlyIncomeMock } from "~/routes/portfolio.dividends/components/MonthlyIncome/MonthlyIncome.constants";
import { Distribution } from "~/routes/portfolio.dividends/components/Distribution/Distribution";
import { distributionMock } from "~/routes/portfolio.dividends/components/Distribution/Distribution.constants";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";

export default function PortfolioDividends() {
  const { assets } = useAssetsContext();
  const distributionData = assets
    .slice(0, distributionMock.length)
    .map((asset, index) => ({
      ...distributionMock[index],
      assetImage: asset.metadata.icon ?? asset.profile.image_url ?? "",
      assetName: asset.metadata.name,
      assetSymbol: asset.metadata.symbol,
      id: asset.address,
    }));

  return (
    <div className={styles.wrapper}>
      <WelcomeBlock activeTab={ROUTES.portfolioDividends} userName="Josh" />
      <div className={styles.content}>
        <DividendsStats data={dividendsStatsMock} />
        <MonthlyIncome data={monthlyIncomeMock} />
        <Distribution data={distributionData} />
      </div>
    </div>
  );
}
