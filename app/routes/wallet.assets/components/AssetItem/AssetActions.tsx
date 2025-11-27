import React, { useMemo } from "react";
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from "~/lib/organisms/CustomDropdown/CustomDropdown";
import styles from "../../styles.module.css";
import { Text } from "~/lib/atoms/Typography/Text";
import DotsIcon from "app/icons/dots.svg?react";
import { AssetMarket } from "~/providers/UserAssets/userAssets.const";
import { MBG_CONTRACT_ADDRESS, MVRK_CONTRACT_ADDRESS } from "~/lib/metadata";
import { generatePath, Link } from "@remix-run/react";
import { TRADE_MULTIBANK_LINK } from "~/consts/links.const";
import MbgTokenImg from "app/assets/home/mbgTokenAsset.png";
import { stablecoinContract } from "~/consts/contracts";
import DepositIcon from "app/icons/wallet/upload.svg?react";
import WithdrawIcon from "app/icons/wallet/send.svg?react";
import BuyIcon from "app/icons/wallet/buy.svg?react";
import SellIcon from "app/icons/wallet/sell.svg?react";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { ROUTES } from "~/consts/routes";
import { EstateType } from "~/providers/MarketsProvider/market.types";
import { AssetType } from "~/providers/UserAssets/userAssets.types";

export const getAssetLinkByAddress = (
  marketsArr: EstateType[],
  token_address: string
) => {
  const currentMarket =
    marketsArr.find((item) => item.token_address === token_address) || null;
  return currentMarket
    ? generatePath(ROUTES.singleAsset, {
        id: currentMarket.assetDetails.blockchain[0].identifier || "",
      })
    : ROUTES.marketplace;
};

export const getAssetByAddress = (
  marketsArr: EstateType[],
  token_address: string
) => {
  return (
    marketsArr.find((item) => item.token_address === token_address) || null
  );
};

export function AssetActionDropdownContent({
  asset,
  liteMod,
}: {
  asset: AssetType;
  liteMod?: boolean;
}) {
  const { marketsArr } = useMarketsContext();

  const assetLink = useMemo(
    () => getAssetLinkByAddress(marketsArr, asset.token.address),
    [asset.token.address, marketsArr]
  );

  const withdrawLink = useMemo(
    () =>
      `${ROUTES.wallet}?withdraw=crypto&tokenAddress=${asset.token.address}`,
    [asset.token.address]
  );

  const depositLink = useMemo(() => `${ROUTES.wallet}?deposit=crypto`, []);

  const stylesClassName = liteMod
    ? styles.assetActionsItemLite
    : styles.assetActionsItem;

  if (asset.token.address === MBG_CONTRACT_ADDRESS)
    return (
      <Link to={TRADE_MULTIBANK_LINK} className={stylesClassName}>
        <img src={MbgTokenImg} alt="mbg token" className="w-[19px]" />
        {!liteMod && (
          <Text size="smallBody" weight="bold">
            Buy on Multibank.io
          </Text>
        )}
      </Link>
    );

  if (
    asset.token.address === MVRK_CONTRACT_ADDRESS ||
    asset.token.address === stablecoinContract
  )
    return (
      <>
        <Link to={depositLink} className={stylesClassName}>
          <Text color="yellow">
            <DepositIcon />
          </Text>

          <Text size="smallBody" weight="bold">
            Deposit
          </Text>
        </Link>
        <Link to={withdrawLink} className={stylesClassName}>
          <Text color="yellow">
            <WithdrawIcon />
          </Text>

          <Text size="smallBody" weight="bold">
            Withdraw
          </Text>
        </Link>
        <Link to={TRADE_MULTIBANK_LINK} className={stylesClassName}>
          <Text color="yellow">
            <BuyIcon />
          </Text>

          <Text size="smallBody" weight="bold">
            {liteMod ? "Buy on MBIO" : "Buy on Multibank.io"}
          </Text>
        </Link>
      </>
    );

  if (asset.market === AssetMarket.secondary)
    return (
      <>
        <Link to={`${assetLink}?action=buy`} className={stylesClassName}>
          <Text color="yellow">
            <BuyIcon />
          </Text>

          <Text size="smallBody" weight="bold">
            Buy
          </Text>
        </Link>
        <Link to={`${assetLink}?action=sell`} className={stylesClassName}>
          <Text color="yellow">
            <SellIcon />
          </Text>

          <Text size="smallBody" weight="bold">
            Sell
          </Text>
        </Link>
        <Link to={depositLink} className={stylesClassName}>
          <Text color="yellow">
            <DepositIcon />
          </Text>

          <Text size="smallBody" weight="bold">
            Deposit
          </Text>
        </Link>
        <Link to={withdrawLink} className={stylesClassName}>
          <Text color="yellow">
            <WithdrawIcon />
          </Text>

          <Text size="smallBody" weight="bold">
            Withdraw
          </Text>
        </Link>
      </>
    );

  return (
    <>
      <Link to={`${assetLink}?action=buy`} className={stylesClassName}>
        <Text color="yellow">
          <BuyIcon />
        </Text>

        <Text size="smallBody" weight="bold">
          Buy
        </Text>
      </Link>
      <Link to={depositLink} className={stylesClassName}>
        <Text color="yellow">
          <DepositIcon />
        </Text>

        <Text size="smallBody" weight="bold">
          Deposit
        </Text>
      </Link>
      <Link to={withdrawLink} className={stylesClassName}>
        <Text color="yellow">
          <WithdrawIcon />
        </Text>

        <Text size="smallBody" weight="bold">
          Withdraw
        </Text>
      </Link>
    </>
  );
}

export function AssetActions({ asset }: { asset: AssetType }) {
  return (
    <div className="items-center gap-x-2 hidden lg:flex">
      <CustomDropdown>
        <ClickableDropdownArea>
          <DropdownFaceContent
            openedClassName={styles.assetActionsDropdownWrapperActive}
            iconClassName={styles.assetActionsDropdownIcon}
          >
            <div className={styles.dotsBlock}>
              <Text
                className="cursor-pointer"
                customColor="--color-light-blue-100"
              >
                <DotsIcon />
              </Text>
            </div>
          </DropdownFaceContent>
        </ClickableDropdownArea>
        <DropdownBodyContent position="right" topMargin={-20} customWidth={200}>
          <AssetActionDropdownContent asset={asset} />
        </DropdownBodyContent>
      </CustomDropdown>
    </div>
  );
}
