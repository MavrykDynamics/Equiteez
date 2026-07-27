import { z } from "zod";
import {
  PriceAssetSchema,
  PricesSchema,
} from "~/lib/apis/rwa/prices/prices.schema";

export type PriceAssetType = z.infer<typeof PriceAssetSchema>;
export type PricesResponseType = z.infer<typeof PricesSchema>;
