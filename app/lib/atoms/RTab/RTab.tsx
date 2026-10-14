import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./RTab.module.css";

export type RTabProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick" | "onSelect" | "role"
> & {
  count?: number;
  id: string;
  isSelected?: boolean;
  label: string;
  onSelect: (id: string) => void;
  variant?: "notification";
};

export function RTab({
  className,
  count,
  disabled = false,
  id,
  isSelected = false,
  label,
  onSelect,
  variant,
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
      className={clsx(
        styles.tab,
        isSelected && styles.selected,
        variant === "notification" && styles.notification,
        className
      )}
      disabled={disabled}
      onClick={handleClick}
      role="tab"
      type="button"
      {...props}
    >
      <RText
        color={isSelected ? "neutral-white" : "neutral-black"}
        size="body-sm"
      >
        {label}
      </RText>
      {count !== undefined ? (
        <span className={styles.count}>
          <RText
            color={
              variant === "notification" && isSelected
                ? "neutral-white"
                : isSelected
                  ? "neutral-200"
                  : "neutral-700"
            }
            size="body-s"
          >
            {count}
          </RText>
        </span>
      ) : null}
    </button>
  );
}
