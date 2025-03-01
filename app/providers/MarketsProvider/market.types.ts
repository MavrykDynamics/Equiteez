import primaryEstate from "./primaryEstate.mock.json";
import secondaryEstate from "./secondaryEstate.mock.json";

export type PrimaryEstate = (typeof primaryEstate)[0] & { slug: string };
export type SecondaryEstate = (typeof secondaryEstate)[0] & { slug: string };

export type EstateType = PrimaryEstate | SecondaryEstate;

export const SECONDARY_MARKET = "Secondary Market";
export const PRIMARY_ISSUANCE = "Primary Issuance";

// NEW ***************

export type DodoMavConfigType = {
  address: string;
  baseTokenAddress: string;
  quoteTokenAddress: string;
  quoteLpTokenAddress: string;
  baseLpTokenAddress: string;
};

export type OrderbookConfigType = {
  address: string;
};

export type MarketConfig = {
  dodoMav: Map<string, DodoMavConfigType>;
  orderbook: Map<string, OrderbookConfigType>;
};

export type MarketInternalStateType = {
  config: MarketConfig;
  markets: Map<string, EstateType>;
  isLoading: boolean;
};

export type MarketContext = MarketInternalStateType & {
  marketAddresses: string[];
  activeMarket: EstateType | null;
  isLoading: boolean;
  isActiveMarketLoading: boolean;
  pickMarketByIdentifier: (slug: string) => EstateType | null;
  updateActiveMarketState: (slug: string) => void;
};
