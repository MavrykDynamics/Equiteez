import { z } from "zod";
import {
  AssetHighlightSchema,
  AssetSchema,
  AssetsHighlightsSchema,
  AssetsSchema,
} from "~/lib/apis/rwa/assets/assets.schema";

export type AssetType = z.infer<typeof AssetSchema>;
export type AssetsResponseType = z.infer<typeof AssetsSchema>;
export type AssetsHighlightsResponseType = z.infer<
  typeof AssetsHighlightsSchema
>;
export type AssetHighlightType = z.infer<typeof AssetHighlightSchema>;
