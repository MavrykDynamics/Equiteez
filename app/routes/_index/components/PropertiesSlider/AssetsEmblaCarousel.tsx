import React from "react";

import styles from "./embla.module.css";
import clsx from "clsx";
import { Button } from "~/lib/atoms/Button";
import { Link, useNavigate } from "@remix-run/react";
import {
  PrimaryEstate,
  SecondaryEstate,
} from "~/providers/EstatesProvider/estates.types";
import { ThumbCardPrimary } from "~/templates/ThumbCard/ThumbCard";
import { EmblaViewportRefType } from "embla-carousel-react";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";

export const SLIDER_VIEW_LIMIT = 4;

type PropType = {
  slides: (PrimaryEstate | SecondaryEstate)[];
  childPosition: "before" | "after";
  nextBtnDisabled: boolean;
  emblaRef: EmblaViewportRefType;
} & PropsWithChildren;

const AssetsEmblaCarousel: React.FC<PropType> = (props) => {
  const {
    emblaRef,
    nextBtnDisabled,
    slides,
    childPosition = "before",
    children,
  } = props;
  const { dodoMav } = useDexContext();
  const navigate = useNavigate();

  const handleSlideClick = (id: string, isLastSlide: boolean) => {
    if (isLastSlide) return;
    navigate(`/marketplace/${id}`);
  };

  return (
    <section className={styles.embla}>
      {childPosition === "before" && children}
      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>
          {slides.map((estate, idx) => {
            const pricePerToken =
              dodoMav[estate.slug]?.toNumber() ??
              estate.assetDetails.priceDetails.price;
            return (
              <div
                role="presentation"
                className={clsx(styles.embla__slide, "cursor-pointer")}
                key={estate.token_address}
                onClick={() =>
                  handleSlideClick(
                    estate.assetDetails.blockchain[0].identifier,
                    idx === slides.length - 1 &&
                      slides.length > SLIDER_VIEW_LIMIT
                  )
                }
              >
                {nextBtnDisabled &&
                idx === slides.length - 1 &&
                slides.length > SLIDER_VIEW_LIMIT ? (
                  <div className={styles.embla__slide__number}>
                    <img
                      src={estate.assetDetails.previewImage}
                      alt="house"
                      className={styles.embla__slide__image}
                    />
                    <div
                      className={clsx(
                        styles.lastSlide,
                        "flex items-center justify-center"
                      )}
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
                ) : (
                  <ThumbCardPrimary
                    imgSrc={estate.assetDetails.previewImage}
                    title={estate.name}
                    price={pricePerToken}
                    annual={
                      estate.assetDetails.priceDetails.projectedAnnualReturn
                    }
                    tokensAvailable={100000000}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {childPosition === "after" && children}
    </section>
  );
};

export default AssetsEmblaCarousel;
