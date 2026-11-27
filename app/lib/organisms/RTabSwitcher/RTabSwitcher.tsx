import clsx from "clsx";
import type { ReactNode } from "react";

import { RTab } from "~/lib/atoms/RTab";

import styles from "./RTabSwitcher.module.css";

export type RTabSwitcherItem = {
  count?: number;
  /** Shown after the label, e.g. a status mark */
  icon?: ReactNode;
  id: string;
  label: string;
  type?: "notification";
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
          icon={tab.icon}
          id={tab.id}
          isSelected={tab.id === activeTabId}
          key={tab.id}
          label={tab.label}
          onSelect={onChange}
          variant={tab.type}
        />
      ))}
    </div>
  );
}
