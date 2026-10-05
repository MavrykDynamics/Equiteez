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

/** Floor quantities to the configured RWA atom tick; never round a sell up. */
export function alignQuantityAtomsToTick(
  rawQuantityAtoms: BigNumber.Value,
  quantityTickSize: BigNumber.Value
): BigNumber {
  const quantity = new BigNumber(rawQuantityAtoms);
  const tick = new BigNumber(quantityTickSize);
  if (!tick.isFinite() || !tick.isInteger() || tick.lte(0)) {
    throw new Error("Quantity tick size must be a positive integer atom value");
  }
  if (!quantity.isFinite() || quantity.lt(0)) {
    throw new Error("Quantity must be a non-negative finite atom value");
  }
  return quantity.dividedToIntegerBy(tick).times(tick);
}
