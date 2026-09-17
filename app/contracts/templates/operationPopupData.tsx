import BigNumber from "bignumber.js";
import { generatePath } from "@remix-run/react";
import { CustomLink } from "~/lib/atoms/CustomLink/CustomLink";
import { ThumbCardSecondary } from "~/templates/ThumbCard/ThumbCard";

import mvrkTokenSvg from "app/misc/mvrk-section.png";

import styles from "./operationPopupData.module.css";
import { EstateType } from "~/providers/MarketsProvider/market.types";
import { EMPTY_ARRAY } from "~/consts";
import { ROUTES } from "~/consts/routes";
import { SECONDARY_MARKET } from "~/providers/MarketsProvider/market.const";

type PopupAssetCard = {
  type: "asset";
  id: string;
  link: string;
  title: string;
  imgSrc: string;
  description: string;
  isSecondaryMarket: boolean;
  pricePerToken: BigNumber;
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

const createPopupAssetCard = (asset: EstateType): PopupAssetCard | null => {
  const identifier = asset.assetDetails.blockchain[0]?.identifier;

  if (!identifier) return null;

  return {
    type: "asset",
    id: asset.slug,
    link: generatePath(ROUTES.singleAsset, { id: identifier }),
    title: asset.name,
    imgSrc: asset.assetDetails.previewImage,
    description: asset.assetType,
    isSecondaryMarket: asset.assetDetails.type === SECONDARY_MARKET,
    pricePerToken: new BigNumber(
      asset.assetDetails.financials.expectedIncome.tokenPrice
    ),
    height: "253px",
    APY: asset.assetDetails.APY,
    flags: asset.assetDetails.propertyDetails.tags ?? EMPTY_ARRAY,
  };
};

const withSeparator = (items: EstateType[]): PopupAssetItem[] => {
  const assetCards = items.reduce<PopupAssetCard[]>((acc, asset) => {
    const assetCard = createPopupAssetCard(asset);

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
  rwas: EstateType[];
};

export const popupOperationInProgress = ({
  rwas,
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
      {withSeparator(rwas).map((asset) => {
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
