import { api } from "~/lib/utils/api";
import { assetsListSchema } from "~/providers/MarketsProvider/markets.schema";
import { mbrwaApiUrl } from "~/lib/apis/mbrwa/index";
import { AssetsListSchema } from "~/providers/UserAssets/userAssets.schema";

export const fetchAssets = async () => {
  const { data } = await api(
    mbrwaApiUrl.concat("assets"),
    undefined,
    assetsListSchema
  );

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
