import { z } from "zod";
import {
  AssetPriceSeriesSchema,
  PriceAssetSchema,
  PricesSchema,
} from "~/lib/apis/rwa/prices/prices.schema";

export type PriceAssetType = z.infer<typeof PriceAssetSchema>;
export type AssetPriceSeriesType = z.infer<typeof AssetPriceSeriesSchema>;
export type PricesResponseType = z.infer<typeof PricesSchema>;
