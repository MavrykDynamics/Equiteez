import { api } from "~/lib/utils/api";
import { rwaApiUrl } from "~/lib/apis/rwa/config";
import {
  AssetsHighlightsSchema,
  AssetsSchema,
} from "~/lib/apis/rwa/assets/assets.schema";
import {
  AssetsHighlightsResponseType,
  AssetsResponseType,
} from "~/lib/apis/rwa/assets/assets.types";

export const fetchAssets = async (): Promise<AssetsResponseType> => {
  const { data } = await api(
    rwaApiUrl.concat(`/assets`),
    undefined,
    AssetsSchema
  );

  return data;
};

export const fetchAssetsHighlights =
  async (): Promise<AssetsHighlightsResponseType> => {
    const { data } = await api(
      rwaApiUrl.concat(`/assets/highlights`),
      undefined,
      AssetsHighlightsSchema
    );

    return data;
  };
