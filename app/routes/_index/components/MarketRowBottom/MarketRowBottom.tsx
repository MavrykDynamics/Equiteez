import { FC, useState } from "react";
import { MarqueeCarousel } from "~/lib/organisms/MarqueeCarousel/MarqueeCarousel";

import ChartIcon from "app/icons/chart-mock.svg?react";

import styles from "./marketRowBottom.module.css";
import clsx from "clsx";
import { Container } from "~/lib/atoms/Container";
import { PriceDetailsLabel } from "~/lib/molecules/PriceDetailsLabel/PriceDetailsLabel";
import { useEstatesContext } from "~/providers/EstatesProvider/estates.provider";
import { Link } from "@remix-run/react";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";

export const MarketRowBottom = () => {
  const { estatesArr } = useEstatesContext();
  const { dodoMav } = useDexContext();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Container maxWidth={1560}>
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
          {estatesArr.map((estate) => {
            const currentPrice = dodoMav[estate.slug];
            return (
              <MarketRowBottomCard
                key={estate.slug}
                name={estate.name}
                imgSrc={estate.assetDetails.previewImage}
                to={`/marketplace/${estate.assetDetails.blockchain[0].identifier}`}
                price={
                  currentPrice?.toNumber() ??
                  estate.assetDetails.priceDetails.price
                }
                percentage={"0.00"}
              />
            );
          })}
        </MarqueeCarousel>
      </div>
    </Container>
  );
};

const MarketRowBottomCard: FC<{
  name: string;
  imgSrc: string;
  price: number;
  percentage: number | string;
  to: string;
}> = ({ to, name, imgSrc, price, percentage }) => {
  return (
    <Link to={to} className={clsx("flex items-center gap-4 ml-8", styles.card)}>
      <img src={imgSrc} alt="card" className={styles.cardImg} />
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-start max-w-[184px] self-stretch justify-between">
          <h4
            className={clsx(
              "text-card-headline font-bold leading-7",
              styles.header
            )}
          >
            {name}
          </h4>
          <PriceDetailsLabel price={price} percentage={percentage} />
        </div>

        <ChartIcon className="max-w-[64px]" />
      </div>
    </Link>
  );
};
