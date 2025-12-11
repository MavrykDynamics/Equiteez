import { Link } from "@remix-run/react";
import { useMemo } from "react";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { EstateType } from "~/providers/MarketsProvider/market.types";
import { ThumbCardSecondary } from "~/templates/ThumbCard/ThumbCard";
import { SECONDARY_MARKET } from "~/providers/MarketsProvider/market.const";
import { atomsToTokens } from "~/lib/utils/formaters";
import styles from "./styles.module.css";
import AssetsEmblaCarousel from "~/routes/_index/components/PropertiesSlider/AssetsEmblaCarousel";
import useEmblaCarousel from "embla-carousel-react";
import { usePrevNextButtons } from "~/lib/ui/use-embla-buttons";
import { EmblaOptionsType } from "embla-carousel";
import classNames from "clsx";

function getThreeUniqueElements(items: EstateType[]) {
  if (items.length < 3) {
    return items;
  }

  const selectedItems: EstateType[] = [];
  while (selectedItems.length < 3) {
    const randomIndex = Math.floor(Math.random() * items.length);
    const item = items[randomIndex];
    if (!selectedItems.includes(item)) {
      selectedItems.push(item);
    }
  }

  return selectedItems;
}

const OPTIONS: EmblaOptionsType = { align: "start" };

export const SimilarProperties = () => {
  const { marketsArr } = useMarketsContext();
  const { orderbookStorages } = useDexContext();

  const similarEstates = useMemo(
    () => getThreeUniqueElements(marketsArr),
    [marketsArr]
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);

  const { nextBtnDisabled } = usePrevNextButtons(emblaApi);

  return (
    <section className="flex flex-col">
      <h2
        className={classNames(
          "text-content text-section-headline mb-11",
          styles.title
        )}
      >
        Similar OTC Assets on Equiteez
      </h2>
      <div
        className={classNames("grid grid-cols-3 gap-x-3", styles.desktopBlock)}
      >
        {!similarEstates.length ? (
          <h4>There aren&apos;t no similar markets.</h4>
        ) : (
          similarEstates.map((estate) => {
            const pricePerToken = atomsToTokens(
              orderbookStorages[estate.slug]?.lowestSellPrice,
              estate.decimals
            );
            return (
              <Link
                to={`/marketplace/${estate.assetDetails.blockchain[0].identifier}`}
                key={estate.token_address}
              >
                <ThumbCardSecondary
                  flag=""
                  key={estate.token_address}
                  imgSrc={estate.assetDetails.previewImage}
                  pricePerToken={pricePerToken}
                  APY={estate.assetDetails.APY}
                  title={estate.name}
                  description={estate.assetDetails.propertyDetails.propertyType}
                  isSecondaryMarket={
                    estate.assetDetails.type === SECONDARY_MARKET
                  }
                  height={"302px"}
                />
              </Link>
            );
          })
        )}
      </div>

      <div className={styles.tabletBlock}>
        <AssetsEmblaCarousel
          emblaRef={emblaRef}
          slides={similarEstates}
          nextBtnDisabled={nextBtnDisabled}
          childPosition="after"
          showAll
        >
          {null}
        </AssetsEmblaCarousel>
      </div>
    </section>
  );
};
