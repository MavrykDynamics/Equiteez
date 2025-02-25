import React from "react";

import styles from "./embla.module.css";
import {
  PrimaryEstate,
  SecondaryEstate,
} from "~/providers/EstatesProvider/estates.types";
import { EmblaViewportRefType } from "embla-carousel-react";
import { AssetEmblaSlide } from "./components/AssetEmblaSlide";

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

  return (
    <section className={styles.embla}>
      {childPosition === "before" && children}
      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>
          {slides.map((estate, idx) => (
            <AssetEmblaSlide
              key={estate.token_address}
              estate={estate}
              idx={idx}
              nextBtnDisabled={nextBtnDisabled}
              assetsArrLength={slides.length}
            />
          ))}
        </div>
      </div>

      {childPosition === "after" && children}
    </section>
  );
};

export default AssetsEmblaCarousel;
