import React from "react";
import styles from "./styles.module.css";
import {
  empty_MBG_tier,
  MBG_tiers_with_empty_item,
} from "~/lib/molecules/MbgTier/mbgTier.const";
import { Text } from "~/lib/atoms/Typography/Text";
import Money from "~/lib/atoms/Money";

export function TierProgressBar({ mbgBalance }: { mbgBalance: number }) {
  const currentTierIndex = MBG_tiers_with_empty_item.findIndex(
    (tier) => mbgBalance >= tier.minBalance
  );

  const currentTier =
    currentTierIndex !== -1
      ? MBG_tiers_with_empty_item[currentTierIndex]
      : empty_MBG_tier;

  const nextTier =
    MBG_tiers_with_empty_item[currentTierIndex - 1] || empty_MBG_tier;

  let currentPercent = 100;
  let leftValueToNew = 0;

  if (nextTier) {
    const range = nextTier.minBalance - currentTier.minBalance;
    const progress = mbgBalance - currentTier.minBalance;
    currentPercent = Math.min((progress / range) * 100, 100);
    leftValueToNew = nextTier.minBalance - mbgBalance;
  }

  return (
    <div
      style={{ backgroundColor: currentTier.color }}
      className={styles.tierWrapper}
    >
      <div className={styles.tierNameBlock}>
        <div className={styles.tierName}>
          {currentTier.icon}
          <Text size="largeBody" weight="extraBold">
            {currentTier.name} {!!mbgBalance && "Tier"}
          </Text>
        </div>
        <span className={styles.tierLabelDiscount}>
          <Text size="tinyBody" weight="semibold">
            {currentTier.discount}% Discount
          </Text>
        </span>
      </div>
      <div className={styles.tierContent}>
        <div className={styles.tierProgressBarWrapper}>
          <Text size="smallBody">
            <Money>{mbgBalance}</Money>
          </Text>
          <div className={styles.tierProgressBar}>
            <div
              style={{ width: `${currentPercent}%` }}
              className={styles.tierProgressBarLine}
            />
          </div>
          <Text size="smallBody">
            <Money>{nextTier.minBalance}</Money>
          </Text>
        </div>
        <Text size="smallBody" weight="bold">
          You need <Money>{leftValueToNew}</Money> MBG to reach next Tier
        </Text>
      </div>
    </div>
  );
}
