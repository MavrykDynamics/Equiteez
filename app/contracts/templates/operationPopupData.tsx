import BigNumber from "bignumber.js";
import { generatePath } from "@remix-run/react";
import { CustomLink } from "~/lib/atoms/CustomLink/CustomLink";
import { ThumbCardSecondary } from "~/templates/ThumbCard/ThumbCard";

import mvrkTokenSvg from "app/misc/mvrk-section.png";

import styles from "./operationPopupData.module.css";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { PriceAssetType } from "~/lib/apis/rwa/prices/prices.types";
import { EMPTY_ARRAY } from "~/consts";
import { ROUTES } from "~/consts/routes";

type PopupAssetCard = {
  type: "asset";
  id: string;
  link: string;
  title: string;
  imgSrc: string;
  description: string;
  isSecondaryMarket?: boolean;
  pricePerToken?: BigNumber;
  height: string;
  APY: number;
  flags: string[];
};

type PopupSeparator = {
  type: "separator";
  id: string;
  imgSrc: string;
};

type PopupAssetItem = PopupAssetCard | PopupSeparator;

const createPopupAssetCard = (
  asset: AssetType,
  prices: Record<string, PriceAssetType>
): PopupAssetCard => {
  const price = prices[asset.address]?.usd;
  return {
    type: "asset",
    id: asset.address,
    link: generatePath(ROUTES.singleAsset, { id: asset.address }),
    title: asset.metadata.name,
    imgSrc: asset.profile.image_url ?? asset.metadata.icon ?? "",
    description: asset.category,
    isSecondaryMarket:
      asset.market_type.toLowerCase() === "secondary"
        ? true
        : asset.market_type.toLowerCase() === "primary"
          ? false
          : undefined,
    pricePerToken:
      price !== undefined && Number.isFinite(price)
        ? new BigNumber(price)
        : undefined,
    height: "253px",
    APY: asset.apy,
    flags: EMPTY_ARRAY,
  };
};

const withSeparator = (
  items: AssetType[],
  prices: Record<string, PriceAssetType>
): PopupAssetItem[] => {
  const assetCards = items.reduce<PopupAssetCard[]>((acc, asset) => {
    const assetCard = createPopupAssetCard(asset, prices);

    if (assetCard) {
      acc.push(assetCard);
    }

    return acc;
  }, []);

  return assetCards.reduce<PopupAssetItem[]>((acc, assetCard, index) => {
    if (index > 0) {
      acc.push({
        type: "separator",
        id: `separator-${assetCard.id}`,
        imgSrc: mvrkTokenSvg,
      });
    }

    acc.push(assetCard);

    return acc;
  }, []);
};

type popupOperationInProgressProps = {
  rwas: AssetType[];
  prices: Record<string, PriceAssetType>;
};

export const popupOperationInProgress = ({
  rwas,
  prices,
}: popupOperationInProgressProps) => ({
  subTitle: (
    <div className="flex gap-1 justify-center items-baseline">
      <div>while your transaction in progress </div>
      <div className={styles["dots-loader"]}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  ),
  title: "Choose Your Next Investment ",
  body: (
    <div className="flex xl:flex-row flex-col gap-4 items-center w-full">
      {withSeparator(rwas, prices).map((asset) => {
        if (asset.type === "separator") {
          return (
            <div key={asset.id} className="max-w-[365px] w-full xl:w-[365px]">
              <img
                src={asset.imgSrc}
                alt="asset card"
                draggable={false}
                className="w-full h-full"
              />
            </div>
          );
        }

        return (
          <CustomLink
            to={asset.link}
            key={asset.id}
            className="max-w-[365px] w-full xl:w-[365px]"
            target="_blank"
            rel="noopener noreferrer"
          >
            {!asset.pricePerToken && <span>Price unavailable</span>}
            <ThumbCardSecondary
              flags={asset.flags}
              imgSrc={asset.imgSrc}
              title={asset.title}
              description={asset.description}
              isSecondaryMarket={asset.isSecondaryMarket}
              APY={asset.APY}
              pricePerToken={asset.pricePerToken}
              height={asset.height}
            />
          </CustomLink>
        );
      })}
    </div>
  ),
});
