import BigNumber from 'bignumber.js';

export const RWAToken = (value: number = 1) => {
  return value * 10 ** 3;
};

export const formatRWAPrice = (value: number) => {
  const conversionRate = 1000000;
  return value * conversionRate;
};

// QuoteToken Formatter
export const QuoteToken = (value: number = 1) => {
  return value * 10 ** 6;
};

// BaseToken Formatter
export const BaseToken = (value: number = 1) => {
  return value * 10 ** 6;
};

// Stablecoin Formatter
export const Stablecoin = (value: number = 1) => {
  return value * 10 ** 6;
};

export function atomsToTokens(x: BigNumber.Value, decimals: number) {
  return new BigNumber(x).integerValue().div(new BigNumber(10).pow(decimals));
}

export function tokensToAtoms(x: BigNumber.Value, decimals: number) {
  return new BigNumber(x).times(10 ** decimals).integerValue();
}
