import { BigNumber } from "bignumber.js";

import { MILLION, ZERO } from "~/lib/utils/numbers";

const DEFAULT_FEE_USD_RATE = 1;

type CalculateOrderSummaryValuesParams = {
  gasFee?: BigNumber.Value;
  orderbookFee?: BigNumber.Value;
  feeUsdRate?: BigNumber.Value;
  orderValue?: BigNumber.Value;
  pricePerShare?: BigNumber.Value;
};

const toFinitePositiveOrZero = (value?: BigNumber.Value) => {
  if (value === undefined || value === null || value === "") return ZERO;

  const result = new BigNumber(value);

  if (!result.isFinite() || result.lt(0)) return ZERO;

  return result;
};

export const calculateOrderSummaryValues = ({
  gasFee,
  orderbookFee,
  feeUsdRate,
  orderValue,
  pricePerShare,
}: CalculateOrderSummaryValuesParams) => {
  const normalizedFeeUsdRate = toFinitePositiveOrZero(feeUsdRate);
  const effectiveFeeUsdRate = normalizedFeeUsdRate.gt(0)
    ? normalizedFeeUsdRate
    : new BigNumber(DEFAULT_FEE_USD_RATE);
  // Asset orderbook fees are MVRK atoms; the gas estimate is already in MVRK.
  const orderbookFeeUsd = toFinitePositiveOrZero(orderbookFee)
    .dividedBy(MILLION)
    .times(effectiveFeeUsdRate);
  const gasFeeUsd = toFinitePositiveOrZero(gasFee).times(effectiveFeeUsdRate);
  const platformFeeUsd = gasFeeUsd.plus(orderbookFeeUsd);
  const normalizedOrderValue = toFinitePositiveOrZero(orderValue);

  return {
    gasFeeUsd,
    orderbookFeeUsd,
    platformFeeUsd,
    pricePerShare: toFinitePositiveOrZero(pricePerShare),
    totalValue: normalizedOrderValue.plus(platformFeeUsd),
  };
};
