import { useMemo } from 'react';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';
import {
  PRIMARY_ISSUANCE,
  SECONDARY_MARKET,
} from '~/providers/EstatesProvider/estates.types';
import { ThumbCard } from '~/templates/ThumbCard/ThumbCard';

export const SimilarProperties = () => {
  const { estates, isActiveEstateSecondaryMarket } = useEstatesContext();

  const similarEstates = useMemo(
    () =>
      isActiveEstateSecondaryMarket
        ? estates
            .filter((es) => es.assetDetails.type === SECONDARY_MARKET)
            .slice(0, 3)
        : estates
            .filter((es) => es.assetDetails.type === PRIMARY_ISSUANCE)
            .slice(0, 3),
    [estates, isActiveEstateSecondaryMarket]
  );

  return (
    <section className="px-11 flex flex-col">
      <h2 className="text-content text-section-headline mb-11">
        Similar OTC Properties on Equiteez
      </h2>
      <div className="grid grid-cols-3 gap-x-3">
        {similarEstates.map((estate) => (
          <ThumbCard
            key={estate.token_address}
            imgSrc={estate.assetDetails.previewImage}
            address={estate.assetDetails.propertyDetails.fullAddress}
            APY={estate.assetDetails.APY}
            title={estate.name}
          />
        ))}
      </div>
    </section>
  );
};
