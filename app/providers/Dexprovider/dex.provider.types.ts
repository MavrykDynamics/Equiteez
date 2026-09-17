import { OrderBookPriceData } from "./utils";

export type DexProviderCtxType = {
  isLoading: boolean;
  orderbookTokenPair: StringRecord<string>;
  orderbookStorages: StringRecord<OrderBookPriceData>;
};
