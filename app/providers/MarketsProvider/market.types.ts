import { ApiError } from "~/errors/error";
import primaryEstate from "./primaryEstate.mock.json";
import secondaryEstate from "./secondaryEstate.mock.json";

export type PrimaryEstate = (typeof primaryEstate)[0] & { slug: string };
export type SecondaryEstate = (typeof secondaryEstate)[0] & { slug: string };

export type EstateType = PrimaryEstate | SecondaryEstate;

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
  rwaTokenAddress: string;
};

export type MarketConfig = {
  dodoMav: Map<string, DodoMavConfigType>;
  orderbook: Map<string, OrderbookConfigType>;
};

export type MarketInternalStateType = {
  config: MarketConfig;
  markets: Map<string, EstateType>;
  sortedMarketAddresses: string[];
  isLoading: boolean;
};

export type MarketContext = MarketInternalStateType & {
  marketAddresses: string[];
  dodoBaseTokenAddresses: string[];
  marketsArr: EstateType[];
  activeMarket: EstateType | null;
  isLoading: boolean;
  loadMoreMarkets: () => void;
  reachedTheEnd: boolean;
  isActiveMarketLoading: boolean;
  pickMarketByIdentifier: (slug: string) => EstateType | null;
  updateActiveMarketState: (slug: string) => void;
  validBaseTokens: StringRecord<boolean>;
  marketApiError: ApiError | null;
  pickers: {
    pickOrderbookContract: StringRecord<string>;
    pickDodoContractBasedOnToken: StringRecord<string>;
    pickMockBaseToken: StringRecord<string>;
    pickMockQuoteToken: StringRecord<string>;
    pickDodoContractQuoteToken: StringRecord<string>;
  };
};
