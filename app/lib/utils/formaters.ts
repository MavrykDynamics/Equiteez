export const RWAToken = (value: number = 1) => {
  return value * 10 ** 3;
};

export const formatRWAPrice = (value: number) => {
  const conversionRate = 1000000;
  return value * conversionRate;
};

// Stablecoin Formatter
export const Stablecoin = (value: number = 1) => {
  return value * 10 ** 6;
};
