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
  payQuote: BigNumber.Value | undefined, // Expected price in USDT
  slippagePercentage: string
) {
  if (!payQuote) return 0;
  const slippageFactor = new BigNumber(1).plus(
    new BigNumber(slippagePercentage).dividedBy(100)
  );

  const minMaxQuote = new BigNumber(payQuote).times(slippageFactor);
  return minMaxQuote;
}

// used for sell orders
export function caclMinMaxQuoteSelling(
  payQuote: BigNumber.Value | undefined,
  slippagePercentage: string
) {
  if (!payQuote) return 0;
  const slippageFactor = new BigNumber(1).minus(
    new BigNumber(slippagePercentage).dividedBy(100)
  );

  const minMaxQuote = new BigNumber(payQuote).times(slippageFactor);
  return minMaxQuote;
}
