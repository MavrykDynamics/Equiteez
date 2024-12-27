import { useMemo, type FC } from "react";
import clsx from "clsx";

// components
import { Tab, TabType, TabVariant } from "~/lib/atoms/Tab";

import styles from "./tabSwitcher.module.css";
import { getGliderDistance } from "./utils";

type TabSwitcherProps = {
  tabs: TabType[];
  activeTabId?: string;
  grow?: boolean;
  variant?: TabVariant;
  className?: string;
  gliderWidth?: number; // used for glider width & for Tabs to ne the same width
};

const variants = {
  primary: "gap-3",
  secondary: "gap-2",
  tertiary: "gap-4",
};

const gliderDistances = {
  primary: (idx: number) => `${getGliderDistance(idx, 12)}`,
  secondary: (idx: number) => `${getGliderDistance(idx, 8)}`,
  tertiary: (idx: number) => `${getGliderDistance(idx, 16)}`,
  hoverable: (idx: number) => `${getGliderDistance(idx, 3)}`,
};

export const TabSwitcher: FC<TabSwitcherProps> = ({
  tabs,
  activeTabId,
  grow,
  className,
  gliderWidth,
  variant = "primary",
}) => {
  const activeIdx = useMemo(
    () => tabs.findIndex((tab) => tab.id === activeTabId) ?? 0,
    [activeTabId, tabs]
  );

  return (
    <div
      className={clsx(
        "flex items-center relative",
        variants[variant],
        className
      )}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          {...tab}
          active={tab.id === activeTabId}
          grow={grow}
          variant={variant}
          minWidth={gliderWidth}
          noActiveBg={Boolean(gliderWidth)}
        />
      ))}

      {variant !== "tertiary" && (
        <span
          style={
            {
              "--tx": gliderDistances[variant](activeIdx),
              "--glider-width": `${gliderWidth}px`,
            } as React.CSSProperties
          }
          className={clsx(styles.glider, styles.active)}
        />
      )}
    </div>
  );
};
