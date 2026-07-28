import { api } from "~/lib/utils/api";
import { rwaPricesApiUrl } from "~/lib/apis/rwa";
import {
  AssetPriceSeriesSchema,
  PricesSchema,
} from "~/lib/apis/rwa/prices/prices.schema";
import {
  AssetPriceSeriesType,
  PricesResponseType,
} from "~/lib/apis/rwa/prices/prices.types";

export const fetchPrices = async (): Promise<PricesResponseType> => {
  const { data } = await api(
    `${rwaPricesApiUrl}?in=usd`,
    undefined,
    PricesSchema
  );

  return data;
};

type FetchPriceSeriesParams = {
  symbol: string;
  interval?: string;
  currency?: string;
  limit?: number;
  from?: string;
  to?: string;
};

export const fetchPriceSeries = async ({
  symbol,
  interval = "1h",
  currency = "usd",
  limit = 1000,
  from,
  to,
}: FetchPriceSeriesParams): Promise<AssetPriceSeriesType> => {
  const query = new URLSearchParams({
    interval,
    in: currency,
    limit: String(limit),
  });

  if (from) query.set("from", from);
  if (to) query.set("to", to);

  const { data } = await api(
    `${rwaPricesApiUrl}/${symbol}-usdt/series?${query.toString()}`,
    undefined,
    AssetPriceSeriesSchema
  );

  return data;
};
