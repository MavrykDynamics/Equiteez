import React, { useMemo } from "react";
import { AssetType } from "~/providers/UserAssets/userAssets.types";
import styles from "./styles.module.css";
import { Text } from "~/lib/atoms/Typography/Text";
import Money from "~/lib/atoms/Money";
import { assetImagesMock } from "~/routes/wallet.assets/components/MobileAssetPopup/MobileAssetPopup";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import {
  AssetActionsCard,
  getAssetByAddress,
} from "~/routes/wallet.assets/components/AssetItem/AssetActions";
import { AssetMarket } from "~/providers/UserAssets/userAssets.const";
import { Icon } from "~/lib/atoms/Icon";

export function AssetCardItem({ asset }: { asset: AssetType }) {
  const { marketsArr } = useMarketsContext();

  const isSecondaryEstate = asset.market === AssetMarket.secondary;
  const currentMarket = getAssetByAddress(marketsArr, asset.token.address);

  const imageSrc =
    assetImagesMock[asset.token.address]?.tablet ||
    currentMarket?.assetDetails.assetImages[0];

  return (
    <div className={styles.wrapper}>
      <div className="relative z-0">
        <img className={styles.img} src={imageSrc} alt={asset.token.name} />
        {asset.market === AssetMarket.empty ? null : (
          <div
            className={
              isSecondaryEstate ? styles.tabBadgeSecondary : styles.tabBadge
            }
          >
            {isSecondaryEstate ? "Secondary Market" : "Primary"}
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.titleBlockWrapper}>
          <div className={styles.titleBlock}>
            <Text weight="semibold" size="largeBody">
              {asset.token.name}
            </Text>
            <AssetActionsCard asset={asset} />
          </div>
          <div className={styles.titleBlockPrice}>
            <Text size="smallBody" weight="semibold" className="flex gap-[4px]">
              <span>
                $<Money tooltip={false}>{asset.token_price}</Money>
              </span>{" "}
              <Text
                size="tinyBody"
                weight="semibold"
                color={asset.price_change24h_percent >= 0 ? "green" : "red"}
                className="flex items-center"
              >
                <Icon
                  icon="upArrow"
                  className={
                    asset.price_change24h_percent < 0 ? "rotate-180" : ""
                  }
                />
                <span>
                  <Money>{asset.price_change24h_percent}</Money>%
                </span>
              </Text>
            </Text>
            <Text weight="semibold" size="tinyBody" color="orange">
              APY {asset.token.apy}%
            </Text>
          </div>
        </div>
        <div className={styles.priceBlock}>
          <Text size="smallBody">Total</Text>
          <div className="flex flex-col items-end relative">
            <Text weight="semibold" size="smallBody">
              $<Money tooltip={false}>{asset.total_balance_usd}</Money>
            </Text>
            <Text color="lightSand" size="tinyBody">
              <Money tooltip={false}>{asset.total_balance_usd}</Money>{" "}
              {asset.token.symbol}
            </Text>
            <div className={styles.tooltipWrapper}>
              <div className={styles.tooltipContent}>
                <Text size="tinyBody">Avl Balance</Text>
                <div className="flex flex-col items-end">
                  <Text size="tinyBody" weight="semibold">
                    $
                    <Money tooltip={false}>{asset.available_balance_usd}</Money>
                  </Text>
                  <Text size="extraTinyBody" color="lightSand">
                    <Money tooltip={false}>{asset.available_balance}</Money>{" "}
                    {asset.token.symbol}
                  </Text>
                </div>
              </div>

              <div className={styles.tooltipContent}>
                <Text size="tinyBody">In Orders</Text>
                {asset.market ? (
                  <div className="flex flex-col items-end">
                    <Text size="tinyBody" weight="semibold">
                      $<Money tooltip={false}>{asset.in_orders_usd}</Money>
                    </Text>
                    <Text size="extraTinyBody" color="lightSand">
                      <Money tooltip={false}>{asset.in_orders}</Money>{" "}
                      {asset.token.symbol}
                    </Text>
                  </div>
                ) : (
                  <Text size="tinyBody" weight="semibold">
                    N/A
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
