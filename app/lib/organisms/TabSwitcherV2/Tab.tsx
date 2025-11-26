import clsx from "clsx";
import { FC } from "react";
import { TabType } from "~/lib/organisms/TabSwitcherV2/TabSwitcherV2";
import styles from "./styles.module.css";

type TabProps = {
  active?: boolean;
  className?: string;
} & TabType;

export const Tab: FC<TabProps> = ({
  active,
  disabled,
  label,
  id,
  handleClick,
  className,
}) => {
  const handleInternalClick = () => handleClick?.(id);

  return (
    <button
      disabled={disabled}
      onClick={handleInternalClick}
      className={clsx(
        styles.tab,
        !active && "hover:bg-sand-300",
        active && "bg-sand-800 ",
        className
      )}
    >
      <p
        className={clsx(
          active ? "text-white" : "text-sand-700",
          "text-base font-semibold"
        )}
      >
        {label}
      </p>
    </button>
  );
};
