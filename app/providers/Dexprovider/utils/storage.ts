import { toTokenSlug } from "~/lib/assets";
import { OrderbookConfigType } from "~/providers/MarketsProvider/market.types";
import { OrderbooksList } from "~/providers/Dexprovider/schemas/orderbook.schema";
import type { OrderbookTickSizesByAddress } from "./orderbookConfig";

type OrderbookItem = OrderbooksList[number];
type TickSizeValue = number | null | undefined;

export type OrderBookPriceData = {
  lowestSellPrice: number;
  highestBuyPrice: number;
  tickSize: number;
  buyOrderFee: number;
  sellOrderFee: number;
  minBuyOrderAmount?: number;
  minBuyOrderValue?: number;
  minSellOrderAmount?: number;
  minSellOrderValue?: number;
  minExpiryTime?: number;
  currencyKey?: string;
  quoteTokenId?: string;
  quoteTokenDecimals?: number;
  baseTokenId?: string;
  baseTokenDecimals?: number;
  rwaTokenAddress: string;
  orderbookAddress: string;
};

const isPositiveTickSize = (tickSize: TickSizeValue): tickSize is number =>
  typeof tickSize === "number" && Number.isFinite(tickSize) && tickSize > 0;

export const resolveOrderbookTickSize = (
  item: OrderbookItem,
  tickSizesByAddress: OrderbookTickSizesByAddress
) => {
  if (isPositiveTickSize(item.tickSize)) return item.tickSize;
  if (isPositiveTickSize(item.tick_size)) return item.tick_size;

  const fallbackTickSize = tickSizesByAddress[item.address];

  return isPositiveTickSize(fallbackTickSize) ? fallbackTickSize : undefined;
};

export const getOrderbookStorages = (
  orderbooksList: OrderbooksList,
  storagesMap: Map<string, OrderbookConfigType>,
  tickSizesByAddress: OrderbookTickSizesByAddress
) => {
  const rwaTokenAddressesByOrderbook = new Map<string, string>();
  const configByOrderbook = new Map<string, OrderbookConfigType>();

  for (const [, storage] of storagesMap) {
    rwaTokenAddressesByOrderbook.set(storage.address, storage.rwaTokenAddress);
    configByOrderbook.set(storage.address, storage);
  }

  return orderbooksList.reduce<Record<string, OrderBookPriceData>>(
    (acc, item) => {
      const rwaTokenAddress =
        item.rwa_token?.address ?? rwaTokenAddressesByOrderbook.get(item.address);
      const storageConfig = configByOrderbook.get(item.address);

      if (!rwaTokenAddress) return acc;

      const tokenSlug = toTokenSlug(
        rwaTokenAddress,
        storageConfig?.rwaTokenId ?? 0
      );
      const tickSize = resolveOrderbookTickSize(item, tickSizesByAddress);

      if (!tickSize) return acc;

      const quoteCurrency = storageConfig?.currencies[0];

      acc[tokenSlug] = {
        lowestSellPrice: item.lowest_sell_price,
        highestBuyPrice: item.highest_buy_price,
        tickSize,
        buyOrderFee: item.buy_order_fee ?? storageConfig?.buyOrderFee,
        sellOrderFee: item.sell_order_fee ?? storageConfig?.sellOrderFee,
        minBuyOrderAmount:
          item.min_buy_order_amount ?? storageConfig?.minBuyOrderAmount,
        minBuyOrderValue:
          item.min_buy_order_value ?? storageConfig?.minBuyOrderValue,
        minSellOrderAmount:
          item.min_sell_order_amount ?? storageConfig?.minSellOrderAmount,
        minSellOrderValue:
          item.min_sell_order_value ?? storageConfig?.minSellOrderValue,
        minExpiryTime: item.min_expiry_time ?? storageConfig?.minExpiryTime,
        currencyKey: quoteCurrency?.currencyKey,
        quoteTokenId: quoteCurrency?.token.token_id,
        quoteTokenDecimals:
          item.quote_token?.decimals ?? quoteCurrency?.token.decimals,
        baseTokenId: storageConfig?.rwaTokenId,
        baseTokenDecimals:
          item.rwa_token?.decimals ?? storageConfig?.rwaTokenDecimals,
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
    const quoteToken = storage.currencies[0]?.token;

    if (!quoteToken) continue;

    result[toTokenSlug(storage.rwaTokenAddress, storage.rwaTokenId)] =
      toTokenSlug(quoteToken.address, quoteToken.token_id);
  }

  return result;
};
