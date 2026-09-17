import React, { useMemo } from "react";
import styles from "./styles.module.css";
import { Link } from "@remix-run/react";
import { ROUTES } from "~/consts/routes";
import {
  empty_MBG_tier,
  MBG_tiers_with_empty_item,
} from "~/lib/molecules/MbgTier/mbgTier.const";
import { Text } from "~/lib/atoms/Typography/Text";
import Money from "~/lib/atoms/Money";

export function TierProgressLink({ mbgBalance }: { mbgBalance: number }) {
  const currentTierIndex = MBG_tiers_with_empty_item.findIndex(
    (tier) => mbgBalance >= tier.minBalance
  );

  const currentTier =
    currentTierIndex !== -1
      ? MBG_tiers_with_empty_item[currentTierIndex]
      : empty_MBG_tier;

  const nextTier =
    MBG_tiers_with_empty_item[currentTierIndex - 1] || empty_MBG_tier;

  const currentPercent = useMemo(() => {
    let value = 100;

    if (nextTier) {
      const range = nextTier.minBalance - currentTier.minBalance;
      const progress = mbgBalance - currentTier.minBalance;
      value = Math.min((progress / range) * 100, 100);
    }

    return value;
  }, [currentTier.minBalance, mbgBalance, nextTier]);

  const getOpaqueColor = (color: string) => {
    if (color.length === 9) return color.slice(0, 7);
    return color;
  };

  const solidColor = getOpaqueColor(currentTier.color);

  if (currentTier.name === empty_MBG_tier.name)
    return (
      <Link to={ROUTES.rewards} className={styles.tierProgressLinkNoTier}>
        <Text size="smallBody" weight="bold">
          {currentTier.name}
        </Text>
      </Link>
    );

  return (
    <Link
      style={
        {
          "--tier-color": currentTier.color,
          "--tier-progress-color": solidColor,
        } as React.CSSProperties
      }
      to={ROUTES.rewards}
      className={styles.tierProgressLink}
    >
      <span className={styles.tierProgressLinkIcon}>
        <svg className={styles.circularProgress} viewBox="0 0 36 36">
          <path
            className={styles.backgroundCircle}
            d="M18 2
         a 16 16 0 1 1 0 32
         a 16 16 0 1 1 0 -32"
          />
          <path
            className={styles.progressCircle}
            strokeDasharray={`${currentPercent}, 100`}
            d="M18 2
         a 16 16 0 1 1 0 32
         a 16 16 0 1 1 0 -32"
          />
        </svg>
        <span>{currentTier.icon}</span>
      </span>

      <span className={styles.tierProgressLinkContent}>
        <Text size="smallBody" weight="bold">
          {currentTier.name} Tier
        </Text>
        <Text size="extraTinyBody">
          <Money>{mbgBalance}</Money>/<Money>{nextTier.minBalance}</Money> MBG
        </Text>
      </span>
    </Link>
  );
}
