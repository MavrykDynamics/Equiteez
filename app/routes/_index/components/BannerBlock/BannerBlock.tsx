import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import useEmblaCarousel from "embla-carousel-react";

import RealAssetsBannerImage from "~/assets/redesign/banner-optimized/RBannerRealAssets.jpg";
import TheCoveBannerImage from "~/assets/redesign/banner-optimized/RBannerTheCove.jpg";
import { RButton } from "~/lib/atoms/RButton";
import Money from "~/lib/atoms/Money";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";
import { Container } from "~/lib/atoms/Container/Container";
import { RDepositFundsModal } from "~/routes/_index/components/DepositFunds/RDepositFundsModal";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { atomsToTokens } from "~/lib/utils/formaters";

const FEATURED_ASSET_ADDRESS = "KT1UHGej1r8j1kdXfAY2L54dk2F2ymahcB1o";

type BannerMetric = {
  label: string;
  value: ReactNode;
};

type BannerSlide = {
  alt: string;
  buttonLabel: string;
  buttonTo?: string;
  description: string;
  eyebrow?: string;
  image: string;
  metrics?: BannerMetric[];
  onClick?: () => void;
  tag?: string;
  title: string;
};

export function BannerBlock() {
  const { assets, prices } = useAssetsContext();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const featuredAsset = assets.find(
    (asset) => asset.address === FEATURED_ASSET_ADDRESS
  );
  const featuredAssetPrices = prices[FEATURED_ASSET_ADDRESS];
  const price =
    featuredAssetPrices?.usd ??
    featuredAssetPrices?.price ??
    featuredAsset?.stats?.price.usd ??
    featuredAsset?.finance.value_per_token;
  const marketCap =
    price !== undefined &&
    price !== null &&
    featuredAsset?.stats?.circulating_supply !== undefined
      ? atomsToTokens(
          featuredAsset.stats.circulating_supply,
          featuredAsset.metadata.decimals
        ).times(price)
      : undefined;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: false,
    slidesToScroll: 1,
  });
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

  const bannerSlides: BannerSlide[] = useMemo(
    () => [
      {
        alt: "Modern home exterior for The Cove investment opportunity",
        buttonLabel: "Invest Now",
        buttonTo: `/trade/${FEATURED_ASSET_ADDRESS}`,
        description:
          "Class-A office tower with a ground-floor retail podium in Midtown Manhattan",
        image: TheCoveBannerImage,
        metrics: [
          {
            label: "Current price",
            value:
              price === undefined || price === null ? (
                "—"
              ) : (
                <>
                  $
                  <Money fiat tooltip={false}>
                    {price}
                  </Money>
                </>
              ),
          },
          {
            label: "APY",
            value: featuredAsset ? (
              <>
                <Money tooltip={false}>{featuredAsset.apy}</Money>%
              </>
            ) : (
              "—"
            ),
          },
          {
            label: "Market cap",
            value:
              marketCap === undefined || marketCap === null ? (
                "—"
              ) : (
                <>
                  $
                  <Money shortened tooltip={false}>
                    {marketCap}
                  </Money>
                </>
              ),
          },
        ],
        tag: "Real Estate",
        title: "The Queen",
      },
      {
        alt: "Dubai skyline representing tokenized real-world assets",
        buttonLabel: "Deposit Funds",
        description:
          "Invest in tokenized real-world assets. Own fractional shares of premium properties and portfolios.",
        eyebrow: "Tokenized real world assets",
        image: RealAssetsBannerImage,
        onClick: () => setIsDepositModalOpen(true),
        title: "Income-producing real assets, tradable 24/7",
      },
    ],
    [price, featuredAsset, marketCap]
  );

  return (
    <Container className={styles.wrapper}>
      <section aria-label="Featured opportunities" className={styles.banner}>
        <div className={styles.viewport} ref={emblaRef}>
          <div className={styles.slideContainer}>
            {bannerSlides.map((slide, index) => (
              <article className={styles.slide} key={slide.title}>
                <img
                  alt={slide.alt}
                  className={styles.image}
                  decoding="async"
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

                  {slide.onClick ? (
                    <RButton onClick={slide.onClick} size="small">
                      {slide.buttonLabel}
                    </RButton>
                  ) : (
                    <RButton as="link" size="small" to={slide.buttonTo ?? "/"}>
                      {slide.buttonLabel}
                    </RButton>
                  )}
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

      <RDepositFundsModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </Container>
  );
}
