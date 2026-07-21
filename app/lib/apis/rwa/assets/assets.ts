import { api } from "~/lib/utils/api";
import { rwaApiUrl } from "~/lib/apis/rwa";
import { AssetsSchema } from "~/lib/apis/rwa/assets/assets.schema";
import { AssetsResponseType } from "~/lib/apis/rwa/assets/assets.types";

export const fetchAssets = async (): Promise<AssetsResponseType> => {
  const { data } = await api(
    rwaApiUrl.concat(`/assets`),
    undefined,
    AssetsSchema
  );

  return data;
};
