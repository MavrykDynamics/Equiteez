import React, { useMemo } from "react";
import { AssetType } from "~/providers/UserAssets/userAssets.types";
import styles from "./styles.module.css";
import { Text } from "~/lib/atoms/Typography/Text";
import Money from "~/lib/atoms/Money";
import { assetImagesMock } from "~/routes/wallet.assets/components/MobileAssetPopup/MobileAssetPopup";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import {
  AssetActions,
  AssetActionsCard,
  getAssetByAddress,
  getAssetLinkByAddress,
} from "~/routes/wallet.assets/components/AssetItem/AssetActions";
import { AssetMarket } from "~/providers/UserAssets/userAssets.const";
import { Icon } from "~/lib/atoms/Icon";

export function AssetCardItem({ asset }: { asset: AssetType }) {
  const { marketsArr } = useMarketsContext();

  const assetLink = useMemo(
    () => getAssetLinkByAddress(marketsArr, asset.token.address),
    [asset.token.address, marketsArr]
  );
  const isSecondaryEstate = asset.market === AssetMarket.secondary;
  const currentMarket = getAssetByAddress(marketsArr, asset.token.address);

  const imageSrc =
    assetImagesMock[asset.token.address]?.tablet ||
    currentMarket?.assetDetails.assetImages[0];

  return (
    <div className={styles.wrapper}>
      <img className={styles.img} src={imageSrc} alt={asset.token.name} />
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
              $<Money tooltip={false}>{asset.token_price}</Money>{" "}
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
          <div className="flex flex-col items-end">
            <Text weight="semibold" size="smallBody">
              $<Money tooltip={false}>{asset.total_balance_usd}</Money>
            </Text>
            <Text color="lightSand" size="tinyBody">
              <Money tooltip={false}>{asset.total_balance_usd}</Money>{" "}
              {asset.token.symbol}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
