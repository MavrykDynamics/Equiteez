import { FC } from "react";

import styles from "./marketRowTop.module.css";
import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "node_modules/embla-carousel/esm/components/Options";
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

const labelsArr = textData.concat(textData);

const OPTIONS: EmblaOptionsType = { align: "start" };

export const MarketRowTop = () => {
  const [emblaRef] = useEmblaCarousel(OPTIONS);
  const { estatesArr } = useEstatesContext();

  return (
    <section className={styles.embla}>
      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>
          {/* TODO extract embla to templates folder */}
          {estatesArr.map((estate, idx) => {
            const currentIndex = idx % labelsArr.length;
            return (
              <div
                key={estate.slug}
                className={clsx(styles.embla__slide, "cursor-pointer")}
              >
                <MarketTopRowCard
                  imgSrc={estate.assetDetails.previewImage}
                  header={labelsArr[currentIndex].header}
                  description={labelsArr[currentIndex].description}
                  to={`/marketplace/${estate.assetDetails.blockchain[0].identifier}`}
                  height={180}
                />
              </div>
            );
          })}
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
      <img src={imgSrc} alt="top row card" className={styles.bg} />
    </CustomLink>
  );
};
