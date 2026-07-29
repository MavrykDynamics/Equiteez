import styles from "./styles.module.css";
import { RTabSwitcher } from "~/lib/organisms/RTabSwitcher";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { RTabSwitcherItem } from "~/lib/organisms/RTabSwitcher/RTabSwitcher";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { AssetOverviewTab } from "~/routes/trade.$address/components/AssetTabs/AssetOverviewTab/AssetOverviewTab";
import { BlockchainTab } from "~/routes/trade.$address/components/AssetTabs/BlockchainTab/BlockchainTab";
import { DetailsTab } from "~/routes/trade.$address/components/AssetTabs/DetailsTab/DetailsTab";
import { ROICalculator } from "~/routes/trade.$address/components/AssetTabs/RoiCalculatorTab/ROICalculator";

type AssetTabId =
  | "open_orders"
  | "order_history"
  | "asset_overview"
  | "details"
  | "ROI_calculator"
  | "blockchain";

const orders_tabs: RTabSwitcherItem[] = [
  {
    id: "open_orders",
    label: "Open Orders",
  },
  {
    id: "order_history",
    label: "Order History",
  },
];
const tabs: RTabSwitcherItem[] = [
  {
    id: "asset_overview",
    label: "Asset Overview",
  },
  {
    id: "details",
    label: "Details",
  },
  {
    id: "ROI_calculator",
    label: "ROI Calculator",
  },
  {
    id: "blockchain",
    label: "Blockchain",
  },
];

export function AssetTabs({ asset }: { asset: AssetType }) {
  const [activeTab, setActiveTab] = useState<AssetTabId>("asset_overview");

  const content = useMemo(
    (): Record<AssetTabId, ReactNode> => ({
      open_orders: <div>open_orders</div>,
      order_history: <div>order_history</div>,
      asset_overview: <AssetOverviewTab asset={asset} />,
      details: <DetailsTab />,
      ROI_calculator: <ROICalculator />,
      blockchain: <BlockchainTab asset={asset} />,
    }),
    [asset]
  );
  return (
    <div className={styles.wrapper}>
      <div className={styles.tabSwitcher}>
        <RTabSwitcher
          activeTabId={activeTab}
          ariaLabel="Order Tabs"
          onChange={(id: string) => {
            setActiveTab(id as AssetTabId);
          }}
          tabs={orders_tabs}
        />
        <span className={styles.divider} />
        <RTabSwitcher
          activeTabId={activeTab}
          ariaLabel="Asset Tabs"
          onChange={(id: string) => {
            setActiveTab(id as AssetTabId);
          }}
          tabs={tabs}
        />
      </div>
      <div className={styles.content}>
        {content[activeTab] ?? <div>No active tab</div>}
      </div>
    </div>
  );
}
