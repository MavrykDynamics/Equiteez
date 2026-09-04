import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

import RealAssetsBannerImage from "~/assets/redesign/banner-optimized/RBannerRealAssets.jpg";
import TheCoveBannerImage from "~/assets/redesign/banner-optimized/RBannerTheCove.jpg";
import { RButton } from "~/lib/atoms/RButton";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

type BannerMetric = {
  label: string;
  value: string;
};

type BannerSlide = {
  alt: string;
  buttonLabel: string;
  buttonTo: string;
  description: string;
  eyebrow?: string;
  image: string;
  metrics?: BannerMetric[];
  tag?: string;
  title: string;
};

const bannerSlides: BannerSlide[] = [
  {
    alt: "Modern home exterior for The Cove investment opportunity",
    buttonLabel: "Invest Now",
    buttonTo: "/marketplace",
    description:
      "Single-family income generating property on the Upper East Side. Fractionalized into 12,500 shares.",
    image: TheCoveBannerImage,
    metrics: [
      { label: "Starting price", value: "$45.00" },
      { label: "Annual return", value: "8%" },
      { label: "Available", value: "1,234" },
    ],
    tag: "REITS",
    title: "The Cove",
  },
  {
    alt: "Dubai skyline representing tokenized real-world assets",
    buttonLabel: "Deposit Funds",
    buttonTo: "/wallet",
    description:
      "Invest in tokenized real-world assets. Own fractional shares of premium properties and portfolios.",
    eyebrow: "Tokenized real world assets",
    image: RealAssetsBannerImage,
    title: "Income-producing real assets, tradable 24/7",
  },
];

export function BannerBlock() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedSlide, setSelectedSlide] = useState(0);

  const handleSelect = useCallback(() => {
    if (emblaApi) {
      setSelectedSlide(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    handleSelect();
    emblaApi.on("reInit", handleSelect);
    emblaApi.on("select", handleSelect);

    return () => {
      emblaApi.off("reInit", handleSelect);
      emblaApi.off("select", handleSelect);
    };
  }, [emblaApi, handleSelect]);

  return (
    <section aria-label="Featured opportunities" className={styles.banner}>
      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles.slideContainer}>
          {bannerSlides.map((slide, index) => (
            <article className={styles.slide} key={slide.title}>
              <img
                alt={slide.alt}
                className={styles.image}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "low"}
                loading={index === 0 ? "eager" : "lazy"}
                src={slide.image}
              />
              <div className={styles.overlay} />

              <div className={styles.content}>
                <div className={styles.copy}>
                  {slide.tag ? (
                    <RText className={styles.tag} size="body-s">
                      {slide.tag}
                    </RText>
                  ) : null}
                  {slide.eyebrow ? (
                    <RText className={styles.eyebrow} size="body-xs">
                      {slide.eyebrow}
                    </RText>
                  ) : null}
                  <div className={styles.titleGroup}>
                    <RHeading
                      as="h2"
                      className={styles.title}
                      color="neutral-white"
                      size="h4"
                      weight="medium"
                    >
                      {slide.title}
                    </RHeading>
                    <RText
                      className={styles.description}
                      color="neutral-white"
                      size="body-s"
                    >
                      {slide.description}
                    </RText>
                  </div>
                </div>

                {slide.metrics ? (
                  <dl className={styles.metrics}>
                    {slide.metrics.map((metric) => (
                      <div className={styles.metric} key={metric.label}>
                        <dt>{metric.label}</dt>
                        <dd>{metric.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                <RButton as="link" size="small" to={slide.buttonTo}>
                  {slide.buttonLabel}
                </RButton>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div
        aria-label="Banner slides"
        className={styles.pagination}
        role="tablist"
      >
        {bannerSlides.map((slide, index) => (
          <button
            aria-label={`Show ${slide.title}`}
            aria-selected={selectedSlide === index}
            className={styles.paginationButton}
            key={slide.title}
            onClick={() => emblaApi?.scrollTo(index)}
            role="tab"
            type="button"
          >
            <span className={styles.paginationDot} />
          </button>
        ))}
      </div>
    </section>
  );
}
