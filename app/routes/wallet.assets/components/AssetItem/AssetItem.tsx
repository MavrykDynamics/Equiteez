import { AssetMarket } from "~/providers/UserAssets/userAssets.const";
import styles from "~/routes/wallet.assets/styles.module.css";
import { AssetIcon } from "~/templates/AssetIcon";
import { Text } from "~/lib/atoms/Typography/Text";
import { HeadlineTabBadge } from "~/templates/EstateHeadlineTab";
import Money from "~/lib/atoms/Money";
import React, { useState } from "react";
import { AssetActions } from "~/routes/wallet.assets/components/AssetItem/AssetActions";
import { MBG_CONTRACT_ADDRESS, MVRK_CONTRACT_ADDRESS } from "~/lib/metadata";
import { Icon } from "~/lib/atoms/Icon";
import { MobileAssetPopup } from "~/routes/wallet.assets/components/MobileAssetPopup/MobileAssetPopup";
import {
  TABLET_MAX_WIDTH,
  useWindowDimensions,
} from "~/hooks/useWindowDimensions";
import { AssetType } from "~/providers/UserAssets/userAssets.types";

export function WalletAssetItem({ asset }: { asset: AssetType }) {
  const isSecondaryEstate = asset.market === AssetMarket.secondary;

  const { width } = useWindowDimensions();
  const isTablet = width < TABLET_MAX_WIDTH;

  const [isOpenDetailsPopup, setIsOpenDetailsPopup] = useState(false);

  return (
    <>
      <div
        className={styles.assetItem}
        onClick={() => {
          if (isTablet) setIsOpenDetailsPopup(true);
        }}
      >
        <div className="flex gap-[8px] items-center w-auto lg:w-[220px]">
          <AssetIcon
            key={asset.tokenSlug}
            size={32}
            assetSlug={asset.tokenSlug}
            className="w-[32px] h-[32px] rounded overflow-hidden"
          />
          <div className="flex flex-col">
            <Text
              size="smallBody"
              weight="semibold"
              className="truncate max-w-[120px] lg:max-w-[150px]"
            >
              {asset.token.name}
            </Text>
            <div className="flex item-center gap-[8px]">
              <Text size="tinyBody" color="lightSand">
                {asset.token.symbol}
              </Text>
              <Text size="tinyBody" color="orange">
                APY {asset.token.apy}%
              </Text>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-[100px] hidden lg:flex">
          {asset.market === AssetMarket.empty ? (
            <Text size="smallBody" weight="semibold">
              N/A
            </Text>
          ) : (
            <div
              className={isSecondaryEstate ? styles.tabBadgeSecondary : styles.tabBadge}
            >
              {isSecondaryEstate ? "Secondary" : "Primary"}
            </div>
          )}
        </div>
        <div className="flex flex-col w-[130px] hidden lg:flex">
          <Text size="smallBody" weight="semibold">
            $<Money fiat>{asset.token_price}</Money>
          </Text>
          <Text
            size="tinyBody"
            weight="semibold"
            color={asset.price_change24h_percent >= 0 ? "green" : "red"}
            className="flex items-center"
          >
            <Icon
              icon="upArrow"
              className={asset.price_change24h_percent < 0 ? "rotate-180" : ""}
            />
            <span>
              <Money>{asset.price_change24h_percent}</Money>%
            </span>
          </Text>
        </div>
        <div className="flex flex-col w-[130px] hidden lg:flex">
          <Text size="smallBody" weight="semibold">
            $<Money fiat>{asset.available_balance_usd}</Money>
          </Text>
          <Text size="tinyBody" color="lightSand">
            <Money fiat>{asset.available_balance}</Money> {asset.token.symbol}
          </Text>
        </div>
        <div className="flex flex-col w-[130px] hidden lg:flex">
          {asset.market === AssetMarket.primary ||
          [MBG_CONTRACT_ADDRESS, MVRK_CONTRACT_ADDRESS].includes(
            asset.token.address
          ) ? (
            <Text size="smallBody" weight="semibold">
              N/A
            </Text>
          ) : (
            <>
              <Text size="smallBody" weight="semibold">
                $<Money fiat>{asset.in_orders_usd}</Money>
              </Text>
              <Text size="tinyBody" color="lightSand">
                <Money fiat>{asset.in_orders}</Money> {asset.token.symbol}
              </Text>
            </>
          )}
        </div>
        <div className="flex flex-col w-[130px] items-end lg:items-start py-[10px] lg:py-[0]">
          <Text size="smallBody" weight="bold">
            $<Money fiat>{asset.total_balance_usd}</Money>
          </Text>
          <Text size="tinyBody" color="lightSand">
            <Money fiat>{asset.total_balance}</Money> {asset.token.symbol}
          </Text>
        </div>

        <AssetActions asset={asset} />
      </div>
      <MobileAssetPopup
        asset={asset}
        isOpen={isOpenDetailsPopup}
        onClose={() => setIsOpenDetailsPopup(false)}
      />
    </>
  );
}
