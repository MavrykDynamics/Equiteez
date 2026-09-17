import BigNumber from "bignumber.js";
import { RWA_TOKEN_DECIMALS } from "~/consts/tokens";
import { TokenMetadata } from "../metadata";

export const RWAToken = (value: number = 1) => {
  return value * 10 ** 3;
};
export const rwaToFixed = (value: number = 1) => {
  return parseFloat(value.toFixed(2).toString());
};

export function decimalScale(decimals: number): BigNumber {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new Error(`Invalid token decimals: ${decimals}`);
  }

  return new BigNumber(10).pow(decimals);
}

export function formatRWAPrice(
  price: BigNumber.Value,
  decimals = RWA_TOKEN_DECIMALS,
  roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN
) {
  return priceToAtoms(price, decimals, roundingMode);
}

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
  return new BigNumber(x)
    .integerValue(BigNumber.ROUND_DOWN)
    .div(decimalScale(decimals));
}

export function tokensToAtoms(
  x: BigNumber.Value,
  decimals: number,
  roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN
) {
  return new BigNumber(x).times(decimalScale(decimals)).integerValue(roundingMode);
}

export function priceToAtoms(
  x: BigNumber.Value,
  decimals: number,
  roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN
) {
  return tokensToAtoms(x, decimals, roundingMode);
}

export function toNatString(value: BigNumber.Value, label = "value"): string {
  const bn = new BigNumber(value);

  if (!bn.isFinite() || !bn.isInteger() || bn.lt(0)) {
    throw new Error(`${label} must be a non-negative integer atom value`);
  }

  return bn.toFixed(0);
}

export function toPositiveNatString(
  value: BigNumber.Value,
  label = "value"
): string {
  const nat = toNatString(value, label);

  if (new BigNumber(nat).lte(0)) {
    throw new Error(`${label} must be greater than zero`);
  }

  return nat;
}

export function bnToFixed(x: BigNumber, decimals = RWA_TOKEN_DECIMALS) {
  return x.dp(decimals).toNumber();
}
export function numberToFixed(x: number, decimals = RWA_TOKEN_DECIMALS) {
  return x.toFixed(decimals);
}

export const convertRawValueToSelectedCurrency = (
  rawValue: string,
  metadata: TokenMetadata,
  price: string
) => {
  return new BigNumber(rawValue)
    .div(new BigNumber(10).pow(metadata.decimals))
    .times(Number(price));
};

export const downgradeDecimals = (value: BigNumber.Value, decimals: number) => {
  const bigValue = new BigNumber(value);

  if (bigValue.isZero()) return 0;

  let formattedValue = bigValue.decimalPlaces(decimals, BigNumber.ROUND_DOWN);

  // If the result is 0, set it to the smallest possible value (0.000001 for 6 decimals, etc.)
  const minValue = new BigNumber("1e-" + decimals);
  if (formattedValue.isEqualTo(0)) {
    formattedValue = minValue;
  }

  return formattedValue.toNumber();
};
