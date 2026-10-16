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

// Assets whose APY must not be displayed regardless of the API value
const ASSETS_WITHOUT_APY = new Set(["KT1NbgrAUjxgvm4b72VEYPp7r8KXTLgXNjjP"]);

export const fetchAssets = async (): Promise<AssetsResponseType> => {
  const { data } = await api(
    rwaApiUrl.concat(`/assets`),
    undefined,
    AssetsSchema
  );

  return {
    ...data,
    items: data.items.map((asset) =>
      ASSETS_WITHOUT_APY.has(asset.address) ? { ...asset, apy: null } : asset
    ),
  };
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
