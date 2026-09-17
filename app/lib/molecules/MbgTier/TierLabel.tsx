import React from "react";
import { Text } from "~/lib/atoms/Typography/Text";
import { MBG_tiers_with_empty_item } from "~/lib/molecules/MbgTier/mbgTier.const";

type TierLabelProps = {
  mbgBalance: number;
};

export const TierLabel: React.FC<TierLabelProps> = ({ mbgBalance }) => {
  const currentTier =
    MBG_tiers_with_empty_item.find((tier) => mbgBalance >= tier.minBalance) ||
    MBG_tiers_with_empty_item[MBG_tiers_with_empty_item.length - 1];

  return (
    <div
      style={{ backgroundColor: currentTier.color }}
      className="flex items-center gap-[6px] h-[26px] py-0 px-[8px] rounded-[32px]"
    >
      {currentTier.icon}
      <Text size="tinyBody" weight="semibold">
        {currentTier.name}
      </Text>
    </div>
  );
};
