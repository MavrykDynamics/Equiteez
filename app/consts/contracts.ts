// contracts

// Mars1 ____________________________________________________________ (new)

export const marsOrderbookContract = "KT1EYj4pMLFaBXHzxLZKRLKd65ve3qgpz3Xf";
export const marsDodoContract = "KT1RfXBWETLpHj77c6ZBzAboAjXP9TFrVYMM";

export const mockQuoteLpTokenMars = "KT1V3DZT7xgXS1MY7SxZncrMVHeKmhuZDf5N"; // received token
export const mockBaseLpTokenMars = "KT1N2ZotYaE4YLA4MzoqjKi75eYLLf58f25a"; // when withdraw

// Ocean ____________________________________________________________ (new)

export const oceanOrderbookContract = "KT19EujCoaquytpf7BeSVXEsfqtV2FZ1asP8";
export const oceanDodoConract = "KT1X1tTjnKRLQMhTxvyKvGnweAqAgkGKDRLB";

export const mockQuoteLpTokenOcean = "KT19h4FmhHNw6Vfttanuy1CUsEM6nBz6UC6R";
export const mockBaseLpTokenOcean = "KT1V2vD8zmbN29GqPoE2EcaHoPLyJEckN4ra";

export type OrderbookMarketType =
  | typeof marsOrderbookContract
  | typeof oceanOrderbookContract;

export type DodoContractType =
  | typeof marsDodoContract
  | typeof oceanDodoConract;

export const stablecoinContract = "KT1StUZzJ34MhSNjkQMSyvZVrR9ppkHMFdFf";

// tokens
export const OCEAN_TOKEN_ADDRESS = "KT1J1p1f1owAEjJigKGXhwzu3tVCvRPVgGCh";
export const MARS1_TOKEN_ADDRESS = "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ9";

export const VALID_TOKENS_OBJ: StringRecord<boolean> = {
  [OCEAN_TOKEN_ADDRESS]: true,
  [MARS1_TOKEN_ADDRESS]: true,
};

export const VALID_TOKENS = new Proxy(VALID_TOKENS_OBJ, {
  get(target, prop: string) {
    // Return false if the property does not exist on the target object
    return prop in target
      ? target[prop as keyof typeof VALID_TOKENS_OBJ]
      : false;
  },
});

// orderbook (secondary market)
export const pickOrderbookContract: StringRecord<OrderbookMarketType> = {
  [MARS1_TOKEN_ADDRESS]: marsOrderbookContract,
  [OCEAN_TOKEN_ADDRESS]: oceanOrderbookContract,
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

export const pickMockQuoteToken: Record<string, string> = {
  [MARS1_TOKEN_ADDRESS]: mockQuoteLpTokenMars,
  [OCEAN_TOKEN_ADDRESS]: mockQuoteLpTokenOcean,
};
