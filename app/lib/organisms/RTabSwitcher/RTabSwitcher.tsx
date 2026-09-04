import clsx from "clsx";

import { RTab } from "~/lib/atoms/RTab";

import styles from "./RTabSwitcher.module.css";

export type RTabSwitcherItem = {
  count?: number;
  id: string;
  label: string;
};

export type RTabSwitcherProps = {
  activeTabId: string;
  ariaLabel: string;
  className?: string;
  onChange: (id: string) => void;
  tabs: RTabSwitcherItem[];
};

export function RTabSwitcher({
  activeTabId,
  ariaLabel,
  className,
  onChange,
  tabs,
}: RTabSwitcherProps) {
  return (
    <div
      aria-label={ariaLabel}
      className={clsx(styles.switcher, className)}
      role="tablist"
    >
      {tabs.map((tab) => (
        <RTab
          count={tab.count}
          id={tab.id}
          isSelected={tab.id === activeTabId}
          key={tab.id}
          label={tab.label}
          onSelect={onChange}
        />
      ))}
    </div>
  );
}
