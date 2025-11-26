import clsx from "clsx";
import { FC } from "react";
import { TabType } from "~/lib/organisms/TabSwitcherV2/TabSwitcherV2";
import styles from "./styles.module.css";
import { Text } from "~/lib/atoms/Typography/Text";

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
      className={clsx(styles.tab, { [styles.tabActive]: active }, className)}
    >
      <Text weight="bold" color={active ? "yellow" : "lightBlue"}>
        {label}
      </Text>
    </button>
  );
};
