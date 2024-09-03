import { Link } from '@remix-run/react';
import { useMemo } from 'react';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';
import {
  EstateType,
  PrimaryEstate,
  SECONDARY_MARKET,
  SecondaryEstate,
} from '~/providers/EstatesProvider/estates.types';
import { ThumbCardSecondary } from '~/templates/ThumbCard/ThumbCard';

function getThreeElements(items: EstateType[]) {
  const item1 = items[Math.floor(Math.random() * items.length)];
  const item2 = items[Math.floor(Math.random() * items.length)];
  const item3 = items[Math.floor(Math.random() * items.length)];

  return [item1, item2, item3];
}

export const SimilarProperties = () => {
  const { estates } = useEstatesContext();

  const similarEstates = useMemo(() => getThreeElements(estates), [estates]);

  return (
    <section className="px-11 flex flex-col">
      <h2 className="text-content text-section-headline mb-11">
        Similar OTC Properties on Equiteez
      </h2>
      <div className="grid grid-cols-3 gap-x-3">
        {similarEstates.map((estate) => {
          const isSecondaryMarket =
            estate.assetDetails.type === SECONDARY_MARKET;
          const restProps = {
            pricePerToken: (estate as SecondaryEstate).assetDetails.priceDetails
              .price,
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
                height={'302px'}
                {...restProps}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
};
