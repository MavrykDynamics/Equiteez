import { OrderBookPriceData } from "./utils";

export type DexProviderCtxType = {
  orderbookTokenPair: StringRecord<string>;
  orderbookStorages: StringRecord<OrderBookPriceData>;
};
