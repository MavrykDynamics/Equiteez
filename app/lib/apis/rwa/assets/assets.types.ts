import { z } from "zod";
import { AssetSchema, AssetsSchema } from "~/lib/apis/rwa/assets/assets.schema";

export type AssetType = z.infer<typeof AssetSchema>;
export type AssetsResponseType = z.infer<typeof AssetsSchema>;
