import { BigNumber } from "bignumber.js";
import { atomsToTokens, decimalScale } from "~/lib/utils/formaters";

export const getDisplayTickSize = (
  rawTickSize: BigNumber.Value,
  quoteTokenDecimals: number
): BigNumber => {
  const displayTickSize = atomsToTokens(rawTickSize, quoteTokenDecimals);

  return displayTickSize.isFinite() && displayTickSize.gt(0)
    ? displayTickSize
    : new BigNumber(0);
};

export const isPriceAlignedToTickSize = ({
  price,
  rawTickSize,
  quoteTokenDecimals,
}: {
  price: BigNumber.Value | undefined;
  rawTickSize: BigNumber.Value;
  quoteTokenDecimals: number;
}): boolean => {
  if (price === undefined) return true;

  const value = new BigNumber(price);
  const tickSize = new BigNumber(rawTickSize);

  if (!value.isFinite() || value.lte(0)) return true;
  if (!tickSize.isFinite() || tickSize.lte(0)) return true;

  const rawPrice = value.times(decimalScale(quoteTokenDecimals));

  if (!rawPrice.isInteger()) return false;

  return isPriceAtomsAlignedToTickSize({
    priceAtoms: rawPrice,
    tickSizeAtoms: tickSize,
  });
};

export const isPriceAtomsAlignedToTickSize = ({
  priceAtoms,
  tickSizeAtoms,
}: {
  priceAtoms: BigNumber.Value;
  tickSizeAtoms: BigNumber.Value;
}): boolean => {
  const price = new BigNumber(priceAtoms);
  const tickSize = new BigNumber(tickSizeAtoms);

  if (!price.isFinite() || !price.isInteger() || price.lte(0)) return true;
  if (!tickSize.isFinite() || !tickSize.isInteger() || tickSize.lte(0)) {
    return true;
  }

  return price.mod(tickSize).isZero();
};
