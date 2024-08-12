import BigNumber from 'bignumber.js';
import { RWA_TOKEN_DECIMALS } from '~/consts/tokens';

export const RWAToken = (value: number = 1) => {
  return value * 10 ** 3;
};
export const rwaToFixed = (value: number = 1) => {
  return parseFloat(value.toFixed(2).toString());
};

export const formatRWAPrice = (value: number, conversionRate = 1000000) => {
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

export function bnToFixed(x: BigNumber, decimals = RWA_TOKEN_DECIMALS) {
  return x.dp(decimals).toNumber();
}
export function numberToFixed(x: number, decimals = RWA_TOKEN_DECIMALS) {
  return x.toFixed(decimals);
}
