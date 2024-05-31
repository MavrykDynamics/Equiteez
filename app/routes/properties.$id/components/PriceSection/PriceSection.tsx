import { FC } from 'react';
import { PrimaryPriceBlock } from './PrimaryPriceBlock';
import { SecondaryPriceBlock } from './SecondaryPriceBlock';

type PriceSectionProps = {
  isSecondaryEstate: boolean;
  symbol: string;
};

// TODO map dynamicdata from the future API
export const PriceSection: FC<PriceSectionProps> = ({
  isSecondaryEstate,
  symbol,
}) => {
  return isSecondaryEstate ? (
    <SecondaryPriceBlock symbol={symbol} />
  ) : (
    <PrimaryPriceBlock />
  );
};
