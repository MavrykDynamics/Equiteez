import { FC } from "react";
import { getRestMockedEstates } from "~/providers/EstatesProvider/utils/estatesMocked";

import styles from "./marketRowTop.module.css";
import clsx from "clsx";

// fake data
const fakeCardsRecord = getRestMockedEstates();
const fakeAddresses = Object.keys(fakeCardsRecord).slice(0, 4);

const textData = [
  {
    header: "WOW!",
    description: "New Asset is Live",
  },
  {
    header: "Price Is Up",
    description: "It's time to invest",
  },
  {
    header: "Presale",
    description: "Buy COVE token first",
  },
  {
    header: "WOW!",
    description: "New Asset is Live",
  },
];

export const MarketRowTop = () => {
  return (
    <div className="grid grid-cols-4 gap-6">
      {fakeAddresses.map((slug, idx) => (
        <MarketTopRowCard
          key={slug}
          imgSrc={fakeCardsRecord[slug].assetDetails.previewImage}
          header={textData[idx].header}
          description={textData[idx].description}
          height={180}
        />
      ))}
    </div>
  );
};

type MarketTopRowCardProps = {
  imgSrc: string;
  header: string;
  description: string;
  height: number;
};

const MarketTopRowCard: FC<MarketTopRowCardProps> = ({
  imgSrc,
  header,
  description,
  height = 180,
}) => {
  return (
    <div
      style={{ height }}
      className={clsx(
        "relative flex flex-col justify-end rounded-3xl overflow-hidden",
        styles.rowTopWrapper
      )}
    >
      <div className="relative text-white p-6 text-start z-[1]">
        <h3 className="text-asset-input font-bold capitalize leading-[46px]">
          {header}
        </h3>
        <p className="text-body">{description}</p>
      </div>
      <img src={imgSrc} alt="top row card" className={styles.bg} />
    </div>
  );
};
