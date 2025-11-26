import { z } from "zod";
import { AssetMarket } from "~/providers/UserAssets/userAssets.const";
import {
  AssetSchema,
  AssetsListSchema,
} from "~/providers/UserAssets/userAssets.schema";

export type AssetsListType = z.infer<typeof AssetsListSchema>;
export type AssetType = { tokenSlug: string; market: AssetMarket } & z.infer<
  typeof AssetSchema
>;
