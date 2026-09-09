import { BigNumber } from "bignumber.js";

import { ZERO } from "~/lib/utils/numbers";

const DEFAULT_NETWORK_FEE_USD_RATE = 1;

type CalculateOrderSummaryValuesParams = {
  networkFee?: BigNumber.Value;
  networkFeeUsdRate?: BigNumber.Value;
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
  networkFee,
  networkFeeUsdRate,
  orderValue,
  pricePerShare,
}: CalculateOrderSummaryValuesParams) => {
  const normalizedNetworkFee = toFinitePositiveOrZero(networkFee);
  const normalizedNetworkFeeUsdRate =
    toFinitePositiveOrZero(networkFeeUsdRate);
  const effectiveNetworkFeeUsdRate = normalizedNetworkFeeUsdRate.gt(0)
    ? normalizedNetworkFeeUsdRate
    : new BigNumber(DEFAULT_NETWORK_FEE_USD_RATE);
  const networkFeeUsd = normalizedNetworkFee.times(effectiveNetworkFeeUsdRate);
  const normalizedOrderValue = toFinitePositiveOrZero(orderValue);

  return {
    networkFeeUsd,
    pricePerShare: toFinitePositiveOrZero(pricePerShare),
    totalValue: normalizedOrderValue.plus(networkFeeUsd),
  };
};
