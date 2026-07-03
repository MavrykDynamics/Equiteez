import React from "react";
import { TableHeader } from "~/routes/wallet.assets/components/TableHeader/TableHeader";
import { WalletAssetItem } from "~/routes/wallet.assets/components/AssetItem/AssetItem";
import { AssetType } from "~/providers/UserAssets/userAssets.types";
import { ActiveSort } from "~/lib/types/sort";
import { AssetCardItem } from "~/routes/wallet.assets/components/AssetCardItem/AssetCardItem";
import styles from "./styles.module.css";

const columns = [
  {
    name: "Asset",
    value: "asset",
    isSortable: false,
    width: "220px",
  },
  {
    name: "Market",
    value: "market",
    isSortable: true,
    width: "100px",
  },
  {
    name: "Price/token",
    value: "token_price",
    isSortable: true,
    width: "130px",
  },
  {
    name: "Avl Balance",
    value: "available_balance_usd",
    isSortable: true,
    width: "130px",
  },
  {
    name: "In Orders",
    value: "in_orders_usd",
    isSortable: true,
    width: "130px",
  },
  {
    name: "Total",
    value: "total_balance_usd",
    isSortable: true,
    width: "130px",
  },
];

export function AssetsList({
  handleSort,
  data,
  activeSort,
  isCardView,
}: {
  activeSort: ActiveSort | null;
  data: AssetType[];
  handleSort: (value: string) => void;
  isCardView: boolean;
}) {
  if (isCardView)
    return (
      <div className={styles.wrapper}>
        {data.map((asset, index) => (
          <AssetCardItem asset={asset} key={index} />
        ))}
      </div>
    );

  return (
    <div className="flex flex-col">
      <TableHeader
        handleSort={handleSort}
        activeSort={activeSort}
        columns={columns}
      />
      {data.map((asset, index) => (
        <WalletAssetItem asset={asset} key={index} />
      ))}
    </div>
  );
}
