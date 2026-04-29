import { toTokenSlug } from "~/lib/assets";
import { OrderbookConfigType } from "~/providers/MarketsProvider/market.types";
import { OrderbooksList } from "~/providers/Dexprovider/schemas/orderbook.schema";

export type OrderBookPriceData = {
  lowestSellPrice: number;
  highestBuyPrice: number;
  buyOrderFee: number;
  sellOrderFee: number;
  rwaTokenAddress: string;
  orderbookAddress: string;
};

export const getOrderbookStorages = (
  orderbooksList: OrderbooksList,
  storagesMap: Map<string, OrderbookConfigType>
) => {
  const rwaTokenAddressesByOrderbook = new Map<string, string>();

  for (const [, storage] of storagesMap) {
    rwaTokenAddressesByOrderbook.set(storage.address, storage.rwaTokenAddress);
  }

  return orderbooksList.reduce<Record<string, OrderBookPriceData>>(
    (acc, item) => {
      const rwaTokenAddress =
        item.rwa_token?.address ?? rwaTokenAddressesByOrderbook.get(item.address);

      if (!rwaTokenAddress) return acc;

      const tokenSlug = toTokenSlug(rwaTokenAddress);

      acc[tokenSlug] = {
        lowestSellPrice: item.lowest_sell_price,
        highestBuyPrice: item.highest_buy_price,
        buyOrderFee: item.buy_order_fee,
        sellOrderFee: item.sell_order_fee,
        rwaTokenAddress,
        orderbookAddress: item.address,
      };

      return acc;
    },
    {}
  );
};

export const getOrderbookTokenPairs = (
  storagesMap: Map<string, OrderbookConfigType>
): StringRecord<string> => {
  const result: StringRecord<string> = {};

  for (const [, storage] of storagesMap) {
    result[toTokenSlug(storage.rwaTokenAddress)] = toTokenSlug(
      storage.currencies[0].token.address,
      storage.currencies[0].token.token_id
    );
  }

  return result;
};
