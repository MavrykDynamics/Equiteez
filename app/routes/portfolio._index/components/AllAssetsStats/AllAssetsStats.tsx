import { useState } from "react";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";

import { AllAssetsChart } from "./AllAssetsChart";
import { AllAssetsTable } from "./AllAssetsTable";
import styles from "./styles.module.css";
import { useAllAssetsStats } from "~/routes/portfolio._index/components/AllAssetsStats/useAllAssetsStats";

export function AllAssetsStats() {
  const { wallet } = usePortfolioContext();
  const [search, setSearch] = useState("");
  
const { portfolioAssets } = useAllAssetsStats(); 

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
      <AllAssetsTable
        assets={filteredAssets}
        onSearchChange={setSearch}
        search={search}
      />
      <AllAssetsChart assets={portfolioAssets} totalValue={totalValue} />
    </section>
  );
}
