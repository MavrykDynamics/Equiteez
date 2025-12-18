import BigNumber from "bignumber.js";
import { CustomLink } from "~/lib/atoms/CustomLink/CustomLink";
import { ThumbCardSecondary } from "~/templates/ThumbCard/ThumbCard";

import mvrkTokenSvg from "app/misc/mvrk-section.png";

import styles from "./operationPopupData.module.css";
import { EstateType } from "~/providers/MarketsProvider/market.types";

const withSeparator = (items: EstateType[]) => {
  const [item1, item2] = items;

  return [
    {
      id: "1",
      title: item1.name,
      imgSrc: item1.assetDetails.previewImage,
      description: item1.assetType,
      isSecondaryMarket: true,
      pricePerToken: new BigNumber(
        item1.assetDetails.financials.expectedIncome.tokenPrice
      ),
      height: "253px",
      APY: item1.assetDetails.APY,
    },
    {
      id: "2",
      // TODO could be replaced with JSX section in the future
      imgSrc: mvrkTokenSvg,
    },
    {
      id: "3",
      title: item2.name,
      imgSrc: item2.assetDetails.previewImage,
      description: item2.assetType,
      isSecondaryMarket: true,
      pricePerToken: new BigNumber(
        item2.assetDetails.financials.expectedIncome.tokenPrice
      ),
      height: "253px",
      APY: item2.assetDetails.APY,
    },
  ];
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
        if (asset.id === "2") {
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
            to={"#"}
            key={asset.id}
            className="max-w-[365px] w-full xl:w-[365px]"
          >
            <ThumbCardSecondary
              flag=""
              imgSrc={asset.imgSrc}
              title={asset.title ?? ""}
              description={asset.description ?? ""}
              isSecondaryMarket={asset.isSecondaryMarket || false}
              APY={asset.APY ?? 0}
              pricePerToken={asset.pricePerToken}
              height={asset.height}
            />
          </CustomLink>
        );
      })}
    </div>
  ),
});
