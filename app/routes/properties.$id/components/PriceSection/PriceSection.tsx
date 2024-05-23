import { FC } from 'react';
import { PrimaryPriceBlock } from './PrimaryPriceBlock';
import { SecondaryPriceBlock } from './SecondaryPriceBlock';

type PriceSectionProps = {
  isSecondaryEstate: boolean;
};

// TODO map dynamicdata from the future API
export const PriceSection: FC<PriceSectionProps> = ({ isSecondaryEstate }) => {
  return isSecondaryEstate ? <SecondaryPriceBlock /> : <PrimaryPriceBlock />;
};
