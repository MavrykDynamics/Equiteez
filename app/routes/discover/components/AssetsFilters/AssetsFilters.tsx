import styles from "./styles.module.css";
import { useState } from "react";
import { RTabSwitcher } from "~/lib/organisms/RTabSwitcher";
import { RInput } from "~/lib/atoms/RInput/RInput";
import { RViewSwitcher, type RViewMode } from "~/lib/atoms/RViewSwitcher/RViewSwitcher";

export function AssetsFilters() {
  const [activeTabId, setActiveTabId] = useState("1");
  const [viewMode, setViewMode] = useState<RViewMode>("grid");

  return (
    <div className={styles.wrapper}>
      <RTabSwitcher
        ariaLabel="tesdt"
        tabs={[
          { id: "1", label: "label 1" },
          { id: "2", label: "label 2" },
        ]}
        activeTabId={activeTabId}
        onChange={setActiveTabId}
      />
      <RInput icon="search" placeholder="Search" className={styles.search} />
      <RViewSwitcher onChange={setViewMode} value={viewMode} />
    </div>
  );
}
