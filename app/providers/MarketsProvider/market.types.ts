import { ApiError } from "~/errors/error";
import primaryEstate from "./primaryEstate.mock.json";
import secondaryEstate from "./secondaryEstate.mock.json";
import { assetDataSchema } from "~/providers/MarketsProvider/markets.schema";
import { z } from "zod";

export type PrimaryEstate = (typeof primaryEstate)[0] & { slug: string };
export type SecondaryEstate = (typeof secondaryEstate)[0] & { slug: string };

export type EstateType = PrimaryEstate | SecondaryEstate;

export type OrderbookConfigType = {
  address: string;
  rwaTokenAddress: string;
  currencies: { token: { address: string; token_id: number } }[];
};

export type MarketConfig = {
  orderbook: Map<string, OrderbookConfigType>;
};

export type MarketInternalStateType = {
  config: MarketConfig;
  markets: Map<string, EstateType>;
  sortedMarketAddresses: string[];
  isLoading: boolean;
};

export type AssetData = z.infer<typeof assetDataSchema>;

export type MarketContext = MarketInternalStateType & {
  marketAddresses: string[];
  orderbookAddresses: string[];
  marketsArr: EstateType[];
  activeMarket: EstateType | null;
  isLoading: boolean;
  isActiveMarketLoading: boolean;
  pickMarketByIdentifier: (slug: string) => EstateType | null;
  updateActiveMarketState: (slug: string) => void;
  validBaseTokens: StringRecord<boolean>;
  marketApiError: ApiError | null;
  pickers: {
    pickOrderbookContract: StringRecord<string>;
    pickOrderbookToken: StringRecord<string>;
    pickOrderbookContractQuoteToken: StringRecord<string>;
  };
};
