import { z } from "zod";
import {
  AssetPriceChangeSchema,
  AssetPriceSeriesSchema,
  PriceAssetSchema,
  PricesSchema,
} from "~/lib/apis/rwa/prices/prices.schema";

export type PriceAssetType = z.infer<typeof PriceAssetSchema>;
export type AssetPriceSeriesType = z.infer<typeof AssetPriceSeriesSchema>;
export type AssetPriceChangeType = z.infer<typeof AssetPriceChangeSchema>;
export type PricesResponseType = z.infer<typeof PricesSchema>;
