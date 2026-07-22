import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

import { RIcon, type RIconName } from "~/lib/atoms/RIcon";

import styles from "./RViewSwitcher.module.css";

export type RViewMode = "grid" | "list";

export type RViewSwitcherProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onChange" | "type"
> & {
  ariaLabel?: string;
  onChange: (value: RViewMode) => void;
  value: RViewMode;
};

const iconByView: Record<RViewMode, RIconName> = {
  grid: "grid",
  list: "list",
};

const viewModes: RViewMode[] = ["grid", "list"];

export function RViewSwitcher({
  ariaLabel = "View mode",
  className,
  disabled,
  onChange,
  value,
  ...props
}: RViewSwitcherProps) {
  return (
    <div
      aria-label={ariaLabel}
      className={clsx(styles.switcher, className)}
      role="group"
    >
      {viewModes.map((view) => {
        const isSelected = view === value;

        return (
          <button
            {...props}
            aria-label={`${view} view`}
            aria-pressed={isSelected}
            className={clsx(styles.option, isSelected && styles.selected)}
            disabled={disabled}
            key={view}
            onClick={() => onChange(view)}
            type="button"
          >
            <RIcon name={iconByView[view]} size="medium" />
          </button>
        );
      })}
    </div>
  );
}
