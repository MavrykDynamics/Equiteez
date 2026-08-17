import { AssetsChart } from "./AssetsChart";
import { AssetsTable } from "./AssetsTable";
import styles from "./styles.module.css";
import type { WalletPortfolioAssetType } from "~/lib/apis/rwa/wallet/wallet.types";

type AssetsStatsProps = {
  assets: WalletPortfolioAssetType[];
  totalValue: number;
};

export function AssetsStats({ assets, totalValue }: AssetsStatsProps) {
  return (
    <section className={styles.stats} aria-label="Portfolio assets">
      <AssetsTable assets={assets} />
      <AssetsChart assets={assets} totalValue={totalValue} />
    </section>
  );
}
