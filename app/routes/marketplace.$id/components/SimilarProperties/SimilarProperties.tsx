import { Link } from "@remix-run/react";
import { useMemo } from "react";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { useEstatesContext } from "~/providers/MarketsProvider/markets.provider";
import {
  EstateType,
  SECONDARY_MARKET,
} from "~/providers/MarketsProvider/market.types";
import { ThumbCardSecondary } from "~/templates/ThumbCard/ThumbCard";

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

export const SimilarProperties = () => {
  const { estatesArr } = useEstatesContext();
  const { dodoMav } = useDexContext();

  const similarEstates = useMemo(
    () => getThreeUniqueElements(estatesArr),
    [estatesArr]
  );

  return (
    <section className="px-11 flex flex-col">
      <h2 className="text-content text-section-headline mb-11">
        Similar OTC Assets on Equiteez
      </h2>
      <div className="grid grid-cols-3 gap-x-3">
        {!similarEstates.length ? (
          <h4>There aren&apos;t no similar markets.</h4>
        ) : (
          similarEstates.map((estate) => {
            const pricePerToken = dodoMav[estate.slug];
            return (
              <Link
                to={`/marketplace/${estate.assetDetails.blockchain[0].identifier}`}
                key={estate.token_address}
              >
                <ThumbCardSecondary
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
    </section>
  );
};
