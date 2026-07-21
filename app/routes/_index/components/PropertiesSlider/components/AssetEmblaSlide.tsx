import clsx from "clsx";
import { FC } from "react";
import {
  PrimaryEstate,
  SecondaryEstate,
} from "~/providers/MarketsProvider/market.types";

import styles from "../embla.module.css";
import { Link, useNavigate } from "@remix-run/react";
import { SLIDER_VIEW_LIMIT } from "../AssetsEmblaCarousel";
import { ThumbCardPrimary } from "~/templates/ThumbCard/ThumbCard";
import { Button } from "~/lib/atoms/Button";
import type { BigNumber } from "bignumber.js";

type AssetEmblaSlideProps = {
  estate: PrimaryEstate | SecondaryEstate;
  idx: number;
  nextBtnDisabled?: boolean;
  assetsArrLength: number;
  pricePerToken?: BigNumber;
};

export const AssetEmblaSlide: FC<AssetEmblaSlideProps> = ({
  estate,
  idx,
  assetsArrLength,
  pricePerToken,
}) => {
  const navigate = useNavigate();

  const handleSlideClick = (id: string, isLastSlide: boolean) => {
    if (isLastSlide) return;
    navigate(`/marketplace/${id}`);
  };
  return (
    <div
      role="presentation"
      className={clsx(styles.embla__slide, "cursor-pointer")}
      key={estate.token_address}
      onClick={() =>
        handleSlideClick(
          estate.assetDetails.blockchain[0].identifier,
          idx === assetsArrLength - 1 && assetsArrLength > SLIDER_VIEW_LIMIT
        )
      }
    >
      <ThumbCardPrimary
        imgSrc={estate.assetDetails.previewImage}
        title={estate.name}
        price={
          pricePerToken?.toNumber() ?? estate.assetDetails.priceDetails.price
        }
        annual={"0.00"}
        tokensAvailable={0}
      />
    </div>
  );
};

export const AssetEmblaLastSlide: FC<Pick<AssetEmblaSlideProps, "estate">> = ({
  estate,
}) => {
  return (
    <div
      role="presentation"
      className={clsx(
        styles.embla__slide,
        styles.lastSlideCard,
        "cursor-pointer"
      )}
      key={estate.token_address}
    >
      <div
        className={clsx(
          styles.embla__slide__number,
          styles.lastSlideImgWrapper
        )}
      >
        <img
          src={estate.assetDetails.previewImage}
          alt="house"
          className={styles.embla__slide__image}
        />
        <div
          className={clsx(styles.lastSlide, "flex items-center justify-center")}
        >
          <div className="flex flex-col items-center gap-y-6">
            <h4 className="text-white text-card-headline text-center">
              Want to see more? <br />
              Check out our marketplace
            </h4>
            <Link to="/marketplace">
              <Button variant="white">Explore</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
