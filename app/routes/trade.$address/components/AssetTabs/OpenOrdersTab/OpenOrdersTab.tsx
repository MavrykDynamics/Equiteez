import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { OpenOrdersTab as PortfolioOpenOrdersTab } from "~/routes/portfolio.activity/components/OpenOrdersTab/OpenOrdersTab";

type OpenOrdersTabProps = {
  asset: AssetType;
};

export function OpenOrdersTab({ asset }: OpenOrdersTabProps) {
  return <PortfolioOpenOrdersTab tokenAddress={asset.address} />;
}
