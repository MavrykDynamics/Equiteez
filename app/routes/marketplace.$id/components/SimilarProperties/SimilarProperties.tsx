import { useMemo } from "react";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import type { EstateType } from "~/providers/MarketsProvider/market.types";
import { ThumbCardSecondary } from "~/templates/ThumbCard/ThumbCard";
import { SECONDARY_MARKET } from "~/providers/MarketsProvider/market.const";
import { atomsToTokens } from "~/lib/utils/formaters";
import styles from "./styles.module.css";
import AssetsEmblaCarousel from "~/routes/old_home_page/components/PropertiesSlider/AssetsEmblaCarousel";
import useEmblaCarousel from "embla-carousel-react";
import { usePrevNextButtons } from "~/lib/ui/use-embla-buttons";
import { EmblaOptionsType } from "embla-carousel";
import classNames from "clsx";
import { EMPTY_ARRAY } from "~/consts";
import { CustomLink } from "~/lib/atoms/CustomLink/CustomLink";

const SIMILAR_MARKETS_LIMIT = 3;

const getMarketIdentifier = (market: EstateType) =>
  market.assetDetails.blockchain[0]?.identifier;

const isSameMarket = (market: EstateType, activeMarket: EstateType) => {
  const marketIdentifier = getMarketIdentifier(market);
  const activeMarketIdentifier = getMarketIdentifier(activeMarket);

  return (
    market.slug === activeMarket.slug ||
    market.token_address === activeMarket.token_address ||
    (Boolean(marketIdentifier && activeMarketIdentifier) &&
      marketIdentifier === activeMarketIdentifier)
  );
};

function getUniqueRealSimilarMarkets(
  markets: Map<string, EstateType>,
  realMarketSlugs: string[],
  activeMarket: EstateType
) {
  const selectedMarkets: EstateType[] = [];
  const selectedKeys = new Set<string>();

  for (const slug of realMarketSlugs) {
    const market = markets.get(slug);

    if (!market || isSameMarket(market, activeMarket)) {
      continue;
    }

    const marketKey = getMarketIdentifier(market) ?? market.slug;

    if (selectedKeys.has(marketKey)) {
      continue;
    }

    selectedKeys.add(marketKey);
    selectedMarkets.push(market);

    if (selectedMarkets.length === SIMILAR_MARKETS_LIMIT) {
      break;
    }
  }

  return selectedMarkets;
}

const OPTIONS: EmblaOptionsType = { align: "start" };

type SimilarPropertiesProps = {
  activeMarket: EstateType;
};

export const SimilarProperties = ({ activeMarket }: SimilarPropertiesProps) => {
  const { markets, sortedMarketAddresses } = useMarketsContext();

  const { orderbookStorages } = useDexContext();

  const similarEstates = useMemo(
    () =>
      getUniqueRealSimilarMarkets(markets, sortedMarketAddresses, activeMarket),
    [activeMarket, markets, sortedMarketAddresses]
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
              <CustomLink
                to={`/marketplace/${estate.assetDetails.blockchain[0].identifier}`}
                target="_blank"
                rel="noopener noreferrer"
                key={estate.token_address}
              >
                <ThumbCardSecondary
                  flags={EMPTY_ARRAY}
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
              </CustomLink>
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
