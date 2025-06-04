import React from "react";

import styles from "./embla.module.css";
import {
  PrimaryEstate,
  SecondaryEstate,
} from "~/providers/MarketsProvider/market.types";
import { EmblaViewportRefType } from "embla-carousel-react";
import {
  AssetEmblaLastSlide,
  AssetEmblaSlide,
} from "./components/AssetEmblaSlide";

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

  // last estate slide data
  const lastSlide = slides[slides.length - 1];

  return (
    <section className={styles.embla}>
      {childPosition === "before" && children}
      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>
          {slides.slice(0, -1).map((estate, idx) => (
            <AssetEmblaSlide
              key={estate.token_address}
              estate={estate}
              idx={idx}
              nextBtnDisabled={nextBtnDisabled}
              assetsArrLength={slides.length}
            />
          ))}
          {lastSlide && <AssetEmblaLastSlide estate={lastSlide} />}
        </div>
      </div>

      {childPosition === "after" && children}
    </section>
  );
};

export default AssetsEmblaCarousel;
