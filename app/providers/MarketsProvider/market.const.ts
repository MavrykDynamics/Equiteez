export const SECONDARY_MARKET = "Secondary Market";
export const PRIMARY_ISSUANCE = "Primary Issuance";

export const MARKETS_INITIAL_STATE = {
  config: {
    dodoMav: new Map(), // dodoContract -> {adddress, baseToken, quoteToken, quoteLpToken, baseLpToken}
    orderbook: new Map(),
  },
  markets: new Map(),
  isLoading: true,
};

export const MARKETS_PAGINATION_LIMIT = 1;
