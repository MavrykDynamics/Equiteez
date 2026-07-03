import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

import styles from "./RTab.module.css";

export type RTabProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick" | "onSelect" | "role"
> & {
  id: string;
  isSelected?: boolean;
  label: string;
  onSelect: (id: string) => void;
};

export function RTab({
  className,
  disabled = false,
  id,
  isSelected = false,
  label,
  onSelect,
  ...props
}: RTabProps) {
  const handleClick = () => {
    if (!disabled) {
      onSelect(id);
    }
  };

  return (
    <button
      aria-selected={isSelected}
      className={clsx(styles.tab, isSelected && styles.selected, className)}
      disabled={disabled}
      onClick={handleClick}
      role="tab"
      type="button"
      {...props}
    >
      {label}
    </button>
  );
}
