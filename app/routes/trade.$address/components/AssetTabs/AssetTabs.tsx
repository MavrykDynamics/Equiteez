import styles from "./styles.module.css";
import { RTabSwitcher } from "~/lib/organisms/RTabSwitcher";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { RTabSwitcherItem } from "~/lib/organisms/RTabSwitcher/RTabSwitcher";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { AssetOverviewTab } from "~/routes/trade.$address/components/AssetTabs/AssetOverviewTab/AssetOverviewTab";
import { BlockchainTab } from "~/routes/trade.$address/components/AssetTabs/BlockchainTab/BlockchainTab";
import { OfferingTab } from "~/routes/trade.$address/components/AssetTabs/OfferingTab/OfferingTab";
import { ROICalculator } from "~/routes/trade.$address/components/AssetTabs/RoiCalculatorTab/ROICalculator";
import { OpenOrdersTab } from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OpenOrdersTab";
import { OrderHistoryTab } from "~/routes/trade.$address/components/AssetTabs/OrderHistoryTab/OrderHistoryTab";

type AssetTabId =
  | "open_orders"
  | "order_history"
  | "asset_overview"
  | "offering"
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
    id: "ROI_calculator",
    label: "ROI Calculator",
  },
  {
    id: "offering",
    label: "Offering",
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
      open_orders: <OpenOrdersTab asset={asset} />,
      order_history: <OrderHistoryTab asset={asset} />,
      asset_overview: <AssetOverviewTab asset={asset} />,
      offering: <OfferingTab asset={asset} />,
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
          ariaLabel="Asset Tabs"
          onChange={(id: string) => {
            setActiveTab(id as AssetTabId);
          }}
          tabs={tabs}
        />
        <span className={styles.divider} />
        <RTabSwitcher
          activeTabId={activeTab}
          ariaLabel="Order Tabs"
          onChange={(id: string) => {
            setActiveTab(id as AssetTabId);
          }}
          tabs={orders_tabs}
        />
      </div>
      <div className={styles.content}>
        {content[activeTab] ?? <div>No active tab</div>}
      </div>
    </div>
  );
}
