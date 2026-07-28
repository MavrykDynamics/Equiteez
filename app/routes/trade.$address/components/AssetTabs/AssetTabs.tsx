import styles from "./styles.module.css";
import { RTabSwitcher } from "~/lib/organisms/RTabSwitcher";
import { useState } from "react";
const tabs = [
  {
    id: "open_orders",
    label: "Open Orders",
  },
];
export function AssetTabs() {
  const [activeTab, setActiveTab] = useState("open_orders");
  return (
    <div className={styles.wrapper}>
      <div className={styles.tabSwitcher}>
        <RTabSwitcher
          activeTabId={activeTab}
          ariaLabel="Asset Tabs"
          onChange={(id: string) => {
            setActiveTab(id);
          }}
          tabs={tabs}
        />
      </div>
      <div className={styles.content}></div>
    </div>
  );
}
