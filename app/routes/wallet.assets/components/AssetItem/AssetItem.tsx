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
              weight="bold"
              className="truncate max-w-[120px] lg:max-w-[150px]"
            >
              {asset.token.name}
            </Text>
            <div className="flex item-center gap-[8px]">
              <Text size="tinyBody" color="lightBlue">
                {asset.token.symbol}
              </Text>
              <Text size="tinyBody" color="goldGradient">
                APY 6.2%
              </Text>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-[100px] hidden lg:flex">
          {asset.market === AssetMarket.empty ? (
            <Text size="smallBody" weight="bold">
              N/A
            </Text>
          ) : (
            <HeadlineTabBadge
              className={styles.tabBadge}
              isSecondaryEstate={isSecondaryEstate}
            >
              {isSecondaryEstate ? "Secondary" : "Primary"}
            </HeadlineTabBadge>
          )}
        </div>
        <div className="flex flex-col w-[130px] hidden lg:flex">
          <Text size="smallBody" weight="bold">
            $<Money fiat>{asset.token_price}</Money>
          </Text>
          <Text
            size="tinyBody"
            weight="bold"
            color="green"
            className="flex items-center"
          >
            <Text
              size="smallBody"
              weight="bold"
              color="green"
              className="pt-[3px]"
            >
              <Icon icon="upArrow" />
            </Text>{" "}
            <span>
              <Money>2.8</Money>%
            </span>
          </Text>
        </div>
        <div className="flex flex-col w-[130px] hidden lg:flex">
          <Text size="smallBody" weight="bold">
            $<Money fiat>{asset.available_balance_usd}</Money>
          </Text>
          <Text size="tinyBody" color="lightBlue">
            <Money fiat>{asset.available_balance}</Money> {asset.token.symbol}
          </Text>
        </div>
        <div className="flex flex-col w-[130px] hidden lg:flex">
          {asset.market === AssetMarket.primary ||
          [MBG_CONTRACT_ADDRESS, MVRK_CONTRACT_ADDRESS].includes(
            asset.token.address
          ) ? (
            <Text size="smallBody" weight="bold">
              N/A
            </Text>
          ) : (
            <>
              <Text size="smallBody" weight="bold">
                $<Money fiat>{asset.in_orders_usd}</Money>
              </Text>
              <Text size="tinyBody" color="lightBlue">
                <Money fiat>{asset.in_orders}</Money> {asset.token.symbol}
              </Text>
            </>
          )}
        </div>
        <div className="flex flex-col w-[130px] items-end lg:items-start py-[10px] lg:py-[0]">
          <Text size="smallBody" weight="bold">
            $<Money fiat>{asset.total_balance_usd}</Money>
          </Text>
          <Text size="tinyBody" color="lightBlue">
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
