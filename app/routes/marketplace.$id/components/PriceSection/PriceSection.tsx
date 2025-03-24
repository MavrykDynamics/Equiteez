import { FC } from "react";
import { PrimaryPriceBlock } from "./PrimaryPriceBlock";
import { SecondaryPriceBlock } from "./SecondaryPriceBlock";
import {
  EstateType,
  SecondaryEstate,
} from "~/providers/MarketsProvider/market.types";

type PriceSectionProps = {
  isSecondaryEstate: boolean;
  activeEstate: EstateType;
};

// TODO map dynamicdata from the future API
export const PriceSection: FC<PriceSectionProps> = ({
  isSecondaryEstate,
  activeEstate,
}) => {
  return isSecondaryEstate ? (
    <SecondaryPriceBlock activeEstate={activeEstate as SecondaryEstate} />
  ) : (
    <PrimaryPriceBlock />
  );
};
