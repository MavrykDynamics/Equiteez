import BigNumber from 'bignumber.js';

// Est fee
export function calculateEstfee(x: BigNumber.Value) {
  return new BigNumber(x || 0)?.times(0.001)?.toNumber();
}
