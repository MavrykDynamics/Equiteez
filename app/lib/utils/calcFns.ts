import BigNumber from 'bignumber.js';

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
export function calcPositiveSlippage(
  price: string | number,
  slippage: number | string
) {
  return new BigNumber(price)
    .multipliedBy(1 + Number(slippage) / 100)
    .toNumber();
}

// used for sell orders
export function calcNegativeSlippage(
  price: string | number,
  slippage: number | string
) {
  return new BigNumber(price)
    .multipliedBy(1 - Number(slippage) / 100)
    .toNumber();
}
