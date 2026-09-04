import type {
  OrderbookDepthLevelSchema,
  OrderbookDepthSchema,
} from "~/lib/apis/rwa/orderbookDepth/orderbookDepth.schema";
import type { z } from "zod";

export type OrderbookDepthLevelType = z.infer<
  typeof OrderbookDepthLevelSchema
>;
export type OrderbookDepthResponseType = z.infer<typeof OrderbookDepthSchema>;

export type FetchOrderbookDepthParams = {
  depth?: number;
  groupBy?: number;
  limit?: number;
  offset?: number;
  ratioDepth?: number;
  tokenAddress: string;
};
