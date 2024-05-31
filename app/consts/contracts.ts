export const faucetContract = 'KT1APnnufBaF825iAUM2ffm2XW2URdbMzBjQ';
export const oceanContract = 'KT1K6XBMZDmYB5Ppdi73eSzU6oHVyPKsaAVN';
export const marsContract = 'KT1K87qJznsozBywe4YYSBtaE2L7mj1kY6vU';

export type MarketContractType = typeof oceanContract | typeof marsContract;

export const stablecoinContract = 'KT1StUZzJ34MhSNjkQMSyvZVrR9ppkHMFdFf';

// tokens
export const OCEAN_TOKEN_ADDRESS = 'KT1J1p1f1owAEjJigKGXhwzu3tVCvRPVgGCh';
export const MARS1_TOKEN_ADDRESS = 'KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ9';

export const pickTokenBasedOnMarket = {
  [oceanContract]: OCEAN_TOKEN_ADDRESS,
  [marsContract]: MARS1_TOKEN_ADDRESS,
};

export const pickMarketBasedOnSymbol: Record<string, MarketContractType> = {
  OCEAN: oceanContract,
  MARS1: marsContract,
  // to be safe and avoid error on demo for fake estate
  COVE: oceanContract,
};
