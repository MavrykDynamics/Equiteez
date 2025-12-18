import BigNumber from "bignumber.js";
import { CustomLink } from "~/lib/atoms/CustomLink/CustomLink";
import { ThumbCardSecondary } from "~/templates/ThumbCard/ThumbCard";

import styles from "./operationPopupData.module.css";

const mockedRWAs = [
  {
    id: "1",
    title: "MAG 218",
    imgSrc: "",
    description: "Residential",
    isSecondaryMarket: true,
    pricePerToken: new BigNumber(100),
    height: "253px",
    APY: 6.8,
  },
  {
    id: "2",
    imgSrc: "",
  },
  {
    id: "3",
    title: "MAG 22",
    imgSrc: "",
    description: "Residential",
    isSecondaryMarket: true,
    pricePerToken: new BigNumber(100),
    height: "253px",
    APY: 6.8,
  },
];

export const popupOperationInProgress = (_props) => ({
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
      {mockedRWAs.map((asset) => {
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
