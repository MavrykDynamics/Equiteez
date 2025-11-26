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
};

export const TabSwitcherV2: FC<TabSwitcherProps> = ({
  tabs,
  activeTabId,
  className,
  tabClassName,
}) => {
  return (
    <div className={clsx(styles.wrapper, className)}>
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          {...tab}
          className={tabClassName}
          active={tab.id === activeTabId}
        />
      ))}
    </div>
  );
};
