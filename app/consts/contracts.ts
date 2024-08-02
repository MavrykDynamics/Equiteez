// contracts

// for swapping tokens (old one)
export const oceanContract = 'KT1K6XBMZDmYB5Ppdi73eSzU6oHVyPKsaAVN';
export const marsContract = 'KT1K87qJznsozBywe4YYSBtaE2L7mj1kY6vU';

// Mars1 ____________________________________________________________ (new)

export const marsOrderbookContract = 'KT1EYj4pMLFaBXHzxLZKRLKd65ve3qgpz3Xf';
export const marsDodoContract = 'KT1HPoRZkqnboMVyEyiNVk1M7W6dMUS4rANg';

export const mockQuoteLpTokenMars = 'KT1EXGW2D5L7ZQ4p4pmq4nrcP1fUufaMPP3d';
export const mockBaseLpTokenMars = 'KT1PF3ZRoxz8aYcrUccLi7txzG1YoKwK91jZ';

// Ocean ____________________________________________________________ (new)

export const oceanOrderbookContract = 'KT19EujCoaquytpf7BeSVXEsfqtV2FZ1asP8';
export const oceanDodoConract = 'KT1AzT6YZMzYyHwkumBZs4j76JnC5UnvzGsy';

export const mockQuoteLpTokenOcean = 'KT1GE3Wt2tGjxJSmSUJwbkuXkochz8Q4aod7';
export const mockBaseLpTokenOcean = 'KT1CZjexySiHyGnChmYAiNj3ftpFi5SLFWtf';

//  helper consts ____________________________________________________________
export type MarketContractType = typeof oceanContract | typeof marsContract;

export type OrderbookMarketType =
  | typeof marsOrderbookContract
  | typeof oceanOrderbookContract;

export type DodoContractType =
  | typeof marsDodoContract
  | typeof oceanDodoConract;

export const stablecoinContract = 'KT1StUZzJ34MhSNjkQMSyvZVrR9ppkHMFdFf';

// tokens
export const OCEAN_TOKEN_ADDRESS = 'KT1J1p1f1owAEjJigKGXhwzu3tVCvRPVgGCh';
export const MARS1_TOKEN_ADDRESS = 'KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ9';

// exchange limit
export const pickTokenBasedOnMarket = {
  [oceanContract]: OCEAN_TOKEN_ADDRESS,
  [marsContract]: MARS1_TOKEN_ADDRESS,
};

// exchange market
export const pickDodoContractBasedOnToken: Record<string, DodoContractType> = {
  [MARS1_TOKEN_ADDRESS]: marsDodoContract,
  [OCEAN_TOKEN_ADDRESS]: oceanDodoConract,
};

export const pickMockBaseToken: Record<string, string> = {
  [MARS1_TOKEN_ADDRESS]: mockBaseLpTokenMars,
  [OCEAN_TOKEN_ADDRESS]: mockBaseLpTokenOcean,
};

// default
export const pickMarketBasedOnSymbol: Record<string, MarketContractType> = {
  OCEAN: oceanContract,
  MARS1: marsContract,
  // to be safe and avoid error on demo for fake estate
  COVE: oceanContract,
};
