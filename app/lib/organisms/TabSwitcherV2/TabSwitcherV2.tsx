import { type FC } from "react";
import clsx from "clsx";

export type TabType<G = string> = {
  id: G;
  label: string;
  grow?: boolean;
  disabled?: boolean;
  handleClick?: (id: G) => void;
};

import styles from "./styles.module.css";
import { Tab } from "~/lib/organisms/TabSwitcherV2/Tab";

type TabSwitcherProps = {
  tabs: TabType[];
  activeTabId?: string;
  className?: string;
  tabClassName?: string;
  activeClassName?: string;
};

export const TabSwitcherV2: FC<TabSwitcherProps> = ({
  tabs,
  activeTabId,
  className,
  tabClassName,
  activeClassName,
}) => {
  return (
    <div className={clsx(styles.wrapper, "bg-sand-200", className)}>
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          {...tab}
          activeClassName={activeClassName}
          className={tabClassName}
          active={tab.id === activeTabId}
        />
      ))}
    </div>
  );
};
