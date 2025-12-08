import styles from "./styles.module.css";
import { MBG_tiers } from "~/lib/molecules/MbgTier/mbgTier.const";
import { Text } from "~/lib/atoms/Typography/Text";
import React from "react";
import Money from "~/lib/atoms/Money";

function TierItem({
  item,
}: {
  item: {
    name: string;
    minBalance: number;
    discount: number;
    color: string;
    icon: React.ReactNode;
  };
}) {
  return (
    <div className={styles.tierItem} key={item.minBalance}>
      <div className={styles.tierItemNameBlock}>
        {item.icon}
        <div className={styles.tierItemContent}>
          <Text size="tinyBody" weight="semibold" color="lightBlue">
            Tier
          </Text>
          <Text size="tinyBody" weight="semibold">
            {item.name}
          </Text>
        </div>
      </div>
      <div className={styles.tierItemContent}>
        <Text size="tinyBody" weight="semibold" color="lightBlue">
          Holdings
        </Text>
        <Text size="tinyBody" weight="semibold">
          <Money>{item.minBalance}</Money> MBG
        </Text>
      </div>
      <div className={styles.tierItemContent}>
        <Text size="tinyBody" weight="semibold" color="lightBlue">
          Discount
        </Text>
        <span
          style={{ backgroundColor: item.color }}
          className={styles.tierItemDiscount}
        >
          <Text size="tinyBody" weight="semibold">
            {item.discount}%
          </Text>
        </span>
      </div>
    </div>
  );
}

export function TierTable() {
  const reversedTiers = [...MBG_tiers].reverse();
  const middleIndex = Math.ceil(reversedTiers.length / 2);
  const leftColumn = reversedTiers.slice(0, middleIndex);
  const rightColumn = reversedTiers.slice(middleIndex);

  return (
    <div className={styles.wrapper}>
      <div className={styles.column}>
        {leftColumn.map((item) => (
          <TierItem item={item} key={item.minBalance} />
        ))}
      </div>
      <div className={styles.line} />
      <div className={styles.column}>
        {rightColumn.map((item) => (
          <TierItem item={item} key={item.minBalance} />
        ))}
      </div>
    </div>
  );
}
