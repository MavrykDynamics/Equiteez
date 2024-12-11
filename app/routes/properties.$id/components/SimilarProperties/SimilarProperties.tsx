import { Link } from "@remix-run/react";
import { useMemo } from "react";
import { useEstatesContext } from "~/providers/EstatesProvider/estates.provider";
import {
  EstateType,
  PrimaryEstate,
  SECONDARY_MARKET,
  SecondaryEstate,
} from "~/providers/EstatesProvider/estates.types";
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

  const similarEstates = useMemo(
    () => getThreeUniqueElements(estatesArr),
    [estatesArr]
  );

  return (
    <section className="px-11 flex flex-col">
      <h2 className="text-content text-section-headline mb-11">
        Similar OTC Properties on Equiteez
      </h2>
      <div className="grid grid-cols-3 gap-x-3">
        {!similarEstates.length ? (
          <h4>There aren&apos;t no similar markets.</h4>
        ) : (
          similarEstates.map((estate) => {
            const isSecondaryMarket =
              estate.assetDetails.type === SECONDARY_MARKET;
            const restProps = {
              pricePerToken: (estate as SecondaryEstate).assetDetails
                .priceDetails.price,
              progressBarPercentage: isSecondaryMarket
                ? undefined
                : +(
                    (((estate as PrimaryEstate).assetDetails.priceDetails
                      .tokensUsed || 1) /
                      (estate as PrimaryEstate).assetDetails.priceDetails
                        .tokensAvailable) *
                    100
                  ).toFixed(2),
            };
            return (
              <Link
                to={`/properties/${estate.assetDetails.blockchain[0].identifier}`}
                key={estate.token_address}
              >
                <ThumbCardSecondary
                  key={estate.token_address}
                  imgSrc={estate.assetDetails.previewImage}
                  APY={estate.assetDetails.APY}
                  title={estate.name}
                  description={estate.assetDetails.propertyDetails.propertyType}
                  isSecondaryMarket={
                    estate.assetDetails.type === SECONDARY_MARKET
                  }
                  height={"302px"}
                  {...restProps}
                />
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
};
