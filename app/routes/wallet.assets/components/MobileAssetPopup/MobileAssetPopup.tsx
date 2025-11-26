import React, { useMemo } from "react";
import styles from "./styles.module.css";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";
import classNames from "clsx";
import { Text } from "~/lib/atoms/Typography/Text";
import { ButtonV2 } from "~/lib/atoms/ButtonV2/ButtonV2";
import { Link } from "@remix-run/react";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import {
  AssetActionDropdownContent,
  getAssetByAddress,
  getAssetLinkByAddress,
} from "~/routes/wallet.assets/components/AssetItem/AssetActions";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { Icon } from "~/lib/atoms/Icon";
import { AssetMarket } from "~/providers/UserAssets/userAssets.const";
import Money from "~/lib/atoms/Money";
import { HeadlineTabBadge } from "~/templates/EstateHeadlineTab";
import { MBG_CONTRACT_ADDRESS, MVRK_CONTRACT_ADDRESS } from "~/lib/metadata";
import { TRADE_MULTIBANK_LINK } from "~/consts/links.const";
import UsdtTablet from "app/assets/wallet/usdtTablet.png";
import UsdtMobile from "app/assets/wallet/usdtMobile.png";
import MvrkTablet from "app/assets/wallet/mvrkTablet.png";
import MvrkMobile from "app/assets/wallet/mvrkMobile.png";
import MbgTablet from "app/assets/wallet/mbgTablet.png";
import MbgMobile from "app/assets/wallet/mbgMobile.png";
import { stablecoinContract } from "~/consts/contracts";
import { AssetType } from "~/providers/UserAssets/userAssets.types";

const assetImagesMock = {
  [stablecoinContract]: {
    tablet: UsdtTablet,
    mobile: UsdtMobile,
  },
  [MBG_CONTRACT_ADDRESS]: {
    tablet: MbgTablet,
    mobile: MbgMobile,
  },
  [MVRK_CONTRACT_ADDRESS]: {
    tablet: MvrkTablet,
    mobile: MvrkMobile,
  },
};

export function MobileAssetPopup({
  asset,
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  asset: AssetType;
  onClose: () => void;
}) {
  const {
    tokenSlug,
    token: { address: tokenAddress },
    market,
    token_price,
  } = asset;

  const { marketsArr } = useMarketsContext();
  const { tokensMetadata } = useTokensContext();

  const assetLink = useMemo(
    () => getAssetLinkByAddress(marketsArr, tokenAddress),
    [tokenAddress, marketsArr]
  );
  const isSecondaryEstate = market === AssetMarket.secondary;
  const token = tokensMetadata[tokenSlug];
  const currentMarket = getAssetByAddress(marketsArr, tokenAddress);

  const imageSrc =
    assetImagesMock[tokenAddress]?.mobile ||
    currentMarket?.assetDetails.assetImages[0];
  const imageSrcTablet =
    assetImagesMock[tokenAddress]?.tablet ||
    currentMarket?.assetDetails.assetImages[0];

  return (
    <CustomPopup
      isOpen={isOpen}
      contentPosition={"bottom"}
      className={classNames(
        "max-h-screen px-11 py-14 z-99 relative",
        styles.popupWrapper
      )}
    >
      <button className="absolute top-6 right-7 z-10">
        <CloseIcon
          className="w-6 h-6 cursor-pointer relative text-white stroke-current"
          onClick={onClose}
        />
      </button>
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col gap-[16px]">
          <img
            src={imageSrc}
            className="w-full md:hidden h-[180px] min-h-[180px] object-cover"
            alt={asset.token.symbol}
          />
          <img
            src={imageSrcTablet}
            className="w-full hidden md:block md:h-[244px] md:min-h-[244px] object-cover"
            alt={asset.token.symbol}
          />
          <Text size="largeBody" weight="bold" className="text-center w-full">
            {token.name}
          </Text>

          <div className="flex items-center px-[16px] gap-[32px]">
            <div className="flex flex-col gap-[8px] flex-1">
              <Text size="tinyBody" color="lightBlue">
                Total Balance
              </Text>
              <div className="flex flex-col">
                <Text size="largeBody" weight="bold">
                  $<Money fiat>{asset.total_balance_usd}</Money>
                </Text>
                <Text size="tinyBody" color="lightBlue">
                  <Money fiat>{asset.total_balance}</Money> {asset.token.symbol}
                </Text>
              </div>
            </div>
            <div className="flex flex-col gap-[8px] flex-1">
              <Text size="tinyBody" color="lightBlue">
                APY
              </Text>
              <Text size="largeBody" weight="bold" color="goldGradient">
                6.2%
              </Text>
            </div>
          </div>

          <div className={styles.line} />

          <div className="flex items-center px-[16px] gap-[32px]">
            <div className="flex flex-col gap-[8px] flex-1">
              <Text size="tinyBody" color="lightBlue">
                Market
              </Text>
              {market === AssetMarket.empty ? (
                <Text size="smallBody" weight="bold">
                  N/A
                </Text>
              ) : (
                <div className="w-fit">
                  <HeadlineTabBadge
                    className={styles.tabBadge}
                    isSecondaryEstate={isSecondaryEstate}
                  >
                    {isSecondaryEstate ? "Secondary" : "Primary"}
                  </HeadlineTabBadge>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-[8px] flex-1">
              <Text size="tinyBody" color="lightBlue">
                Price/token
              </Text>
              <div className="flex flex-col flex">
                <Text size="smallBody" weight="bold">
                  $<Money fiat>{token_price}</Money>
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
            </div>
          </div>

          <div className="flex items-center px-[16px] gap-[32px]">
            <div className="flex flex-col gap-[8px] flex-1">
              <Text size="tinyBody" color="lightBlue">
                Avl Balance
              </Text>
              <div className="flex flex-col">
                <Text size="largeBody" weight="bold">
                  $<Money fiat>{asset.available_balance_usd}</Money>
                </Text>
                <Text size="tinyBody" color="lightBlue">
                  <Money fiat>{asset.available_balance}</Money>{" "}
                  {asset.token.symbol}
                </Text>
              </div>
            </div>
            <div className="flex flex-col gap-[8px] flex-1">
              <Text size="tinyBody" color="lightBlue">
                In Orders
              </Text>
              {market === AssetMarket.primary ||
              [MBG_CONTRACT_ADDRESS, MVRK_CONTRACT_ADDRESS].includes(
                tokenAddress
              ) ? (
                <Text size="smallBody" weight="bold">
                  N/A
                </Text>
              ) : (
                <div className="flex flex-col">
                  <Text size="largeBody" weight="bold">
                    $<Money fiat>{asset.in_orders_usd}</Money>
                  </Text>
                  <Text size="tinyBody" color="lightBlue">
                    <Money fiat>{asset.in_orders}</Money> {asset.token.symbol}
                  </Text>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center mt-[16px] justify-around">
            {MBG_CONTRACT_ADDRESS !== asset.token.address && (
              <AssetActionDropdownContent asset={asset} liteMod />
            )}
          </div>
        </div>

        {MBG_CONTRACT_ADDRESS === asset.token.address ? (
          <Link
            className="w-full px-[16px] py-[24px]"
            to={TRADE_MULTIBANK_LINK}
          >
            <ButtonV2 className={styles.submitBtn} variant="goldPrimary">
              Buy on MultiBank.io
            </ButtonV2>
          </Link>
        ) : [MVRK_CONTRACT_ADDRESS, stablecoinContract].includes(
            asset.token.address
          ) ? null : (
          <Link className="w-full px-[16px] py-[24px]" to={assetLink}>
            <ButtonV2 className={styles.submitBtn} variant="yellowPrimary">
              View Asset
            </ButtonV2>
          </Link>
        )}
      </div>
    </CustomPopup>
  );
}
