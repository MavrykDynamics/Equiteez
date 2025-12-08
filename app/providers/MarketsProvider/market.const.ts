export const SECONDARY_MARKET = "Secondary Market";
export const PRIMARY_ISSUANCE = "Primary Issuance";

export const MARKETS_INITIAL_STATE = {
  config: {
    orderbook: new Map(), // orderbookContract
  },
  sortedMarketAddresses: [],
  markets: new Map(), // esttates by main(base) token address
  isLoading: true,
};

export const MARKETS_PAGINATION_LIMIT = 10;
