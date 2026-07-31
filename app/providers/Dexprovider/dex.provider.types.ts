import { OrderBookPriceData } from "./utils";

export type DexProviderCtxType = {
  isOrderbookStoragesLoading: boolean;
  orderbookTokenPair: StringRecord<string>;
  orderbookStorages: StringRecord<OrderBookPriceData>;
};
