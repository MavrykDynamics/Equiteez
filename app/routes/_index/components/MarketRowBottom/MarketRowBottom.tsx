import { FC, useState } from "react";
import { MarqueeCarousel } from "~/lib/organisms/MarqueeCarousel/MarqueeCarousel";
import { getRestMockedEstates } from "~/providers/EstatesProvider/utils/estatesMocked";

import ChartIcon from "app/icons/chart-mock.svg?react";

import styles from "./marketRowBottom.module.css";
import Money from "~/lib/atoms/Money";
import clsx from "clsx";

// fake data
const fakeCardsRecord = getRestMockedEstates();
const fakeAddresses = Object.keys(fakeCardsRecord).slice(0, 10);

export const MarketRowBottom = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={styles.slider}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <MarqueeCarousel
        autoFill
        play={!isHovered}
        pauseOnHover
        direction="left"
        speed={45}
      >
        {fakeAddresses.map((slug) => {
          const market = fakeCardsRecord[slug];
          return (
            <MarketRowBottomCard
              key={slug}
              name={market.name}
              imgSrc={market.assetDetails.previewImage}
              price={market.assetDetails.priceDetails.price}
              percentage={
                market.assetDetails.priceDetails.projectedAnnualReturn
              }
            />
          );
        })}
      </MarqueeCarousel>
    </div>
  );
};

const MarketRowBottomCard: FC<{
  name: string;
  imgSrc: string;
  price: number;
  percentage: number;
}> = ({ name, imgSrc, price, percentage }) => {
  return (
    <div className={clsx("flex items-center gap-4", styles.card)}>
      <img src={imgSrc} alt="card" className={styles.cardImg} />
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-start max-w-[163px] self-stretch justify-between">
          <h4 className={clsx("text-slider-headline font-bold", styles.header)}>
            {name}
          </h4>
          <div className="flex items-center text-caption text-[#37794e]">
            <div className="text-black-secondary">
              $<Money fiat>{price}</Money>
            </div>
            <div className={styles.cardAnnualLabel}>
              <span>+</span>
              {percentage}
              <span>%</span>
            </div>
          </div>
        </div>

        <ChartIcon />
        <div></div>
      </div>
    </div>
  );
};
