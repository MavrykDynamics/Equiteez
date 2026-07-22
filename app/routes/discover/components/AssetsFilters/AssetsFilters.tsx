import styles from "./styles.module.css";
import { useState } from "react";
import { RTabSwitcher } from "~/lib/organisms/RTabSwitcher";
import { RInput } from "~/lib/atoms/RInput/RInput";
import {
  RViewSwitcher,
  type RViewMode,
} from "~/lib/atoms/RViewSwitcher/RViewSwitcher";
import { AssetsSort } from "./AssetsSort";

export function AssetsFilters() {
  const [activeTabId, setActiveTabId] = useState("1");
  const [sort, setSort] = useState("trending");
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
      <div className={styles.rightBlock}>
        <RInput icon="search" placeholder="Search" className={styles.search} />
        <AssetsSort
          onChange={setSort}
          options={[
            { label: "Trending", value: "trending" },
            { label: "Top Gainers", value: "top-gainers" },
            { label: "Newest", value: "newest" },
          ]}
          value={sort}
        />
        <RViewSwitcher onChange={setViewMode} value={viewMode} />
      </div>
    </div>
  );
}
