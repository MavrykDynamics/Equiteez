import { Button } from '~/lib/atoms/Button';

export const HeadlineBlock = () => {
  return (
    <div className="flex items-start gap-x-4 mb-11 justify-between">
      <div>
        <h1 className="text-content text-section-headline max-w-[850px] mb-3">
          It’s never been easier to invest in asset such as real estate, and
          earn passive income.
        </h1>

        <p className="text-content-secondary text-body max-w-[736px]">
          Discover new opportunities powered by decentralized finance. The Maven
          Finance lending platform allows you to supercharge your earnings by
          leveraging your tokenized portfolio.
        </p>
      </div>

      <Button variant="outline" disabled>
        How Equiteez Works
      </Button>
    </div>
  );
};
