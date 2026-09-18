import { BigNumber } from "bignumber.js";

import { MILLION, ZERO } from "~/lib/utils/numbers";

const DEFAULT_NETWORK_FEE_USD_RATE = 1;

type CalculateOrderSummaryValuesParams = {
  networkFee?: BigNumber.Value;
  gasFee?: BigNumber.Value;
  orderbookFee?: BigNumber.Value;
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
  gasFee,
  orderbookFee,
  networkFeeUsdRate,
  orderValue,
  pricePerShare,
}: CalculateOrderSummaryValuesParams) => {
  const normalizedNetworkFee = toFinitePositiveOrZero(networkFee);
  const normalizedNetworkFeeUsdRate = toFinitePositiveOrZero(networkFeeUsdRate);
  const effectiveNetworkFeeUsdRate = normalizedNetworkFeeUsdRate.gt(0)
    ? normalizedNetworkFeeUsdRate
    : new BigNumber(DEFAULT_NETWORK_FEE_USD_RATE);
  const networkFeeUsd = normalizedNetworkFee.times(effectiveNetworkFeeUsdRate);
  // Asset orderbook fees are MVRK atoms; the network estimate is already in MVRK.
  const orderbookFeeUsd = toFinitePositiveOrZero(orderbookFee)
    .dividedBy(MILLION)
    .times(effectiveNetworkFeeUsdRate);
  const gasFeeUsd = toFinitePositiveOrZero(gasFee).times(
    effectiveNetworkFeeUsdRate
  );
  const platformFeeUsd = networkFeeUsd.plus(gasFeeUsd).plus(orderbookFeeUsd);
  const normalizedOrderValue = toFinitePositiveOrZero(orderValue);

  return {
    networkFeeUsd,
    gasFeeUsd,
    orderbookFeeUsd,
    platformFeeUsd,
    pricePerShare: toFinitePositiveOrZero(pricePerShare),
    totalValue: normalizedOrderValue.plus(platformFeeUsd),
  };
};
