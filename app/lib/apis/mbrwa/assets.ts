import { api } from "~/lib/utils/api";
import { assetsListSchema } from "~/providers/MarketsProvider/markets.schema";
import { mbrwaApiUrl } from "~/lib/apis/mbrwa/index";
import { AssetsListSchema } from "~/providers/UserAssets/userAssets.schema";
import { z } from "zod";

type FetchAssetsParams = {
  search?: string;
  developers?: string[];
  tags?: string[];
  types?: string[];
  offset?: number;
  limit?: number;
};

export type FetchAssetsResponse = z.infer<typeof assetsListSchema>;

const appendValue = (
  queryParts: string[],
  key: string,
  value: string
) => {
  queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
};

const appendValues = (
  queryParts: string[],
  key: "developers" | "tags" | "types",
  values?: string[]
) => {
  if (!values?.length) {
    return;
  }

  values.forEach((value) => {
    appendValue(queryParts, key, value);
  });
};

export const fetchAssets = async (
  paramsConfig: FetchAssetsParams = {}
): Promise<FetchAssetsResponse> => {
  const queryParts: string[] = [];

  if (paramsConfig.search) {
    appendValue(queryParts, "search", paramsConfig.search);
  }

  // TODO: Re-enable once the assets endpoint supports backend pagination.
  // if (typeof paramsConfig.offset === "number") {
  //   appendValue(queryParts, "offset", String(paramsConfig.offset));
  // }
  //
  // if (typeof paramsConfig.limit === "number") {
  //   appendValue(queryParts, "limit", String(paramsConfig.limit));
  // }

  appendValues(queryParts, "developers", paramsConfig.developers);
  appendValues(queryParts, "tags", paramsConfig.tags);
  appendValues(queryParts, "types", paramsConfig.types);

  const query = queryParts.join("&");
  const url = `${mbrwaApiUrl}assets${query ? `?${query}` : ""}`;

  const { data } = await api(url, { method: "GET" }, assetsListSchema);

  return data;
};

export const fetchUserAssets = async (userAddress: string) => {
  const { data } = await api(
    mbrwaApiUrl.concat(`wallet/${userAddress}/assets`),
    undefined,
    AssetsListSchema
  );

  return data;
};
