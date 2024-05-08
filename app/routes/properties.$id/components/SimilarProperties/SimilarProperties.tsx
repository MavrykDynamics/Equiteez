import mockedEstates from 'app/mocks/estates.json';
import { ThumbCard } from '~/templates/ThumbCard/ThumbCard';

const estates = mockedEstates.slice(0, 3);

export const SimilarProperties = () => {
  return (
    <section className="px-11 flex flex-col">
      <h2 className="text-content text-section-headline mb-11">
        Similar OTC Properties on Equiteez
      </h2>
      <div className="grid grid-cols-3 gap-x-3">
        {estates.map((estate) => (
          <ThumbCard
            key={estate.id}
            imgSrc={estate.imgSrc}
            address={estate.details.fullAddress}
            APY={7.5}
            title={estate.title}
          />
        ))}
      </div>
    </section>
  );
};
