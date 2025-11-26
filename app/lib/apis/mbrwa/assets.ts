import { api } from "~/lib/utils/api";
import { mbrwaApiUrl } from "~/lib/apis/mbrwa/index";
import { AssetsListSchema } from "~/providers/UserAssets/userAssets.schema";

export const fetchUserAssets = async (userAddress: string) => {
  const { data } = await api(
    mbrwaApiUrl.concat(`wallet/${userAddress}/assets`),
    undefined,
    AssetsListSchema
  );

  return data;
};
