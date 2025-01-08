import { FC } from "react";
import { getRestMockedEstates } from "~/providers/EstatesProvider/utils/estatesMocked";

import styles from "./marketRowTop.module.css";
import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "node_modules/embla-carousel/esm/components/Options";

// fake data
const fakeCardsRecord = getRestMockedEstates();
const fakeAddresses = Object.keys(fakeCardsRecord).slice(0, 8);

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

const labelsArr = textData.concat(textData);

const OPTIONS: EmblaOptionsType = { align: "start" };

export const MarketRowTop = () => {
  const [emblaRef] = useEmblaCarousel(OPTIONS);

  return (
    <section className={styles.embla}>
      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>
          {/* TODO extract embla to templates folder */}
          {fakeAddresses.map((slug, idx) => (
            <div
              key={slug}
              className={clsx(styles.embla__slide, "cursor-pointer")}
            >
              <MarketTopRowCard
                imgSrc={fakeCardsRecord[slug].assetDetails.previewImage}
                header={labelsArr[idx].header}
                description={labelsArr[idx].description}
                height={180}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
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
        <h3 className="text-card-headline font-bold capitalize leading-7">
          {header}
        </h3>
        <p className="text-body">{description}</p>
      </div>
      <img src={imgSrc} alt="top row card" className={styles.bg} />
    </div>
  );
};
