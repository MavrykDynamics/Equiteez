import BigNumber from "bignumber.js";

// Est fee
export function calculateEstfee(x: BigNumber.Value) {
  if (!x) return 0;
  return new BigNumber(x || 0)?.times(0.001)?.toNumber();
}

export function pseudoOperationFee(
  total: BigNumber,
  amount: BigNumber,
  price: number | string | BigNumber
) {
  const fee = total.minus(amount.multipliedBy(price));
  return fee.isNegative() ? new BigNumber(0) : fee.div(amount);
}

// used for buy orders
export function caclMinMaxQuoteBuying(
  tokensAmount: BigNumber.Value | undefined,
  slippagePercentage: string
) {
  if (!tokensAmount) return 0;
  const slippageFactor = new BigNumber(1).minus(
    new BigNumber(slippagePercentage).dividedBy(100)
  );

  const minMaxQuote = new BigNumber(tokensAmount).times(slippageFactor);
  return minMaxQuote;
}

// used for sell orders
export function caclMinMaxQuoteSelling(
  tokensAmount: BigNumber.Value | undefined,
  tokenPriceInUSDT: BigNumber.Value,
  slippagePercentage: string
) {
  if (!tokensAmount) return 0;
  const slippageFactor = new BigNumber(1).minus(
    new BigNumber(slippagePercentage).dividedBy(100)
  );

  const totalValueInUSDT = new BigNumber(tokensAmount).times(tokenPriceInUSDT);
  const minMaxQuoteInUSDT = totalValueInUSDT.times(slippageFactor);

  return minMaxQuoteInUSDT;
}
