import { FC } from "react";

import styles from "./marketRowTop.module.css";
import clsx from "clsx";
import { useEstatesContext } from "~/providers/EstatesProvider/estates.provider";
import { CustomLink } from "~/lib/atoms/CustomLink/CustomLink";

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

const CARDS_PREVIW = 4;

const labelsArr = textData.concat(textData);

export const MarketRowTop = () => {
  const { estatesArr } = useEstatesContext();

  return (
    <section className={styles.topRowGrid}>
      {estatesArr.slice(0, CARDS_PREVIW).map((estate, idx) => {
        return (
          <div key={estate.slug} className={clsx("cursor-pointer")}>
            <MarketTopRowCard
              imgSrc={estate.assetDetails.previewImage}
              header={labelsArr[idx].header}
              description={labelsArr[idx].description}
              to={`/marketplace/${estate.assetDetails.blockchain[0].identifier}`}
              height={180}
            />
          </div>
        );
      })}
    </section>
  );
};

type MarketTopRowCardProps = {
  imgSrc: string;
  header: string;
  description: string;
  height: number;
  to: string;
};

const MarketTopRowCard: FC<MarketTopRowCardProps> = ({
  imgSrc,
  header,
  description,
  to,
  height = 180,
}) => {
  return (
    <CustomLink
      to={to}
      style={{ height }}
      className={clsx(
        "relative flex flex-col justify-end rounded-3xl overflow-hidden",
        styles.rowTopWrapper
      )}
    >
      <div className="relative text-white p-6 text-start z-[1]">
        <h3 className="text-card-headline font-bold capitalize leading-7">
          {header}
        </h3>
        <p className="text-body">{description}</p>
      </div>
      <img
        src={imgSrc}
        alt="top row card"
        draggable={false}
        className={styles.bg}
      />
    </CustomLink>
  );
};
