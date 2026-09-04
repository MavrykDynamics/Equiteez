import { useState } from "react";

import type { WalletPortfolioAssetType } from "~/lib/apis/rwa/wallet/wallet.types";
import { RText } from "~/lib/atoms/RTypography/RText";
import { Spinner } from "~/lib/atoms/Spinner";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";

import { AssetClassChartView } from "./AssetClassChartView";
import { WalletChartView } from "./WalletChartView";
import styles from "./styles.module.css";

type AllAssetsChartProps = {
  assets: WalletPortfolioAssetType[];
  portfolioTotal: number;
};

type AssetsChartView = "wallet" | "asset-class";

export function AssetsChart({ assets, portfolioTotal }: AllAssetsChartProps) {
  const { isLoading } = usePortfolioContext();
  const [chartView, setChartView] = useState<AssetsChartView>("wallet");

  return (
    <aside className={styles.chartPanel} aria-label="Portfolio allocation">
      <div className={styles.chartSwitcher}>
        <RText size="body-s">By Wallet</RText>
        <button
          aria-checked={chartView === "asset-class"}
          aria-label="Group portfolio allocation by asset class"
          className={styles.chartViewToggle}
          onClick={() =>
            setChartView((view) =>
              view === "wallet" ? "asset-class" : "wallet"
            )
          }
          role="switch"
          type="button"
        >
          <span aria-hidden="true" className={styles.chartViewToggleThumb} />
        </button>
        <RText size="body-s">By Asset Class</RText>
      </div>
      {isLoading ? (
        <div className={styles.chartSectionLoader} role="status" aria-live="polite">
          <Spinner size={32} />
        </div>
      ) : chartView === "wallet" ? (
        <WalletChartView assets={assets} portfolioTotal={portfolioTotal} />
      ) : (
        <AssetClassChartView assets={assets} portfolioTotal={portfolioTotal} />
      )}
    </aside>
  );
}
