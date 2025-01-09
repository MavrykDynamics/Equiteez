import BigNumber from "bignumber.js";

export const ZERO = new BigNumber(0);

export const rateToNumber = (rate?: string) =>
  new BigNumber(rate ?? 0).toNumber();

export const isPositiveNumber = (value?: number): value is number =>
  value != null && value > 0;

const THOUSAND = 1_000;
const MILLION = 1_000_000;
const BILLION = 1_000_000_000;

export const ONE_HOUR_MS = 3600_000;

export const kFormatter = (num: number): string => {
  if (isNaN(num)) {
    return "";
  }

  const sign = Math.sign(num);

  const formattedValue = Math.abs(num);

  if (formattedValue >= BILLION) {
    return (sign * Math.round(formattedValue / BILLION)).toLocaleString() + "B";
  }

  if (formattedValue >= MILLION) {
    return (sign * Math.round(formattedValue / MILLION)).toLocaleString() + "M";
  }

  if (formattedValue >= THOUSAND) {
    return (
      (sign * Math.round(formattedValue / THOUSAND)).toLocaleString() + "K"
    );
  }

  return (sign * formattedValue).toLocaleString();
};

export function extractNumber(input: number | string) {
  // Convert the input to a string (in case it's a number)
  const str = String(input);

  // Use a regular expression to extract only digits and decimal points
  const number = str.replace(/[^\d.]/g, "");

  // Return the number as a string
  const n = new BigNumber(number).toNumber();
  return isNaN(n) ? 0 : n;
}
