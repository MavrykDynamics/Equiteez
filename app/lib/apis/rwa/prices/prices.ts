import { api } from "~/lib/utils/api";
import { rwaPricesApiUrl } from "~/lib/apis/rwa";
import { PricesSchema } from "~/lib/apis/rwa/prices/prices.schema";
import { PricesResponseType } from "~/lib/apis/rwa/prices/prices.types";

export const fetchPrices = async (): Promise<PricesResponseType> => {
  const { data } = await api(
    `${rwaPricesApiUrl}?in=usd`,
    undefined,
    PricesSchema
  );

  return data;
};
