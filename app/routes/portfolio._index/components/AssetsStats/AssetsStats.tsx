import { useState } from "react";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";

import { AssetsChart } from "./AssetsChart";
import { AssetsTable } from "./AssetsTable";
import styles from "./styles.module.css";
import { useAssetsStats } from "~/routes/portfolio._index/components/AssetsStats/useAssetsStats";

export function AssetsStats() {
  const { wallet } = usePortfolioContext();
  const [search, setSearch] = useState("");
  
const { portfolioAssets } = useAssetsStats();

  const filteredAssets = portfolioAssets.filter((asset) => {
    const normalizedSearch = search.trim().toLowerCase();

    return (
      !normalizedSearch ||
      asset.name.toLowerCase().includes(normalizedSearch) ||
      asset.symbol.toLowerCase().includes(normalizedSearch)
    );
  });

  const totalValue = wallet?.account_value ?? 0;

  return (
    <section className={styles.stats} aria-label="Portfolio assets">
      <AssetsTable
        assets={filteredAssets}
        onSearchChange={setSearch}
        search={search}
      />
      <AssetsChart assets={portfolioAssets} totalValue={totalValue} />
    </section>
  );
}
