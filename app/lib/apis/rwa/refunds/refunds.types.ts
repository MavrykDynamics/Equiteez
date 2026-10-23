import { z } from "zod";
import {
  RefundItemSchema,
  RefundOrderTypeSchema,
  RefundsPageSchema,
  RefundTokenSchema,
} from "~/lib/apis/rwa/refunds/refunds.schema";

export type RefundOrderType = z.infer<typeof RefundOrderTypeSchema>;
export type RefundTokenType = z.infer<typeof RefundTokenSchema>;
export type RefundItemType = z.infer<typeof RefundItemSchema>;
export type RefundsPageResponseType = z.infer<typeof RefundsPageSchema>;

export type RefundOrderRef = {
  orderId: string;
  orderType: RefundOrderType;
};

export type RefundPart = {
  orderbookAddress: string;
  orders: RefundOrderRef[];
};

export type RefundTokenTotal = {
  tokenAddress: string;
  tokenId: string;
  symbol: string | null;
  decimals: number | null;
  amountUnits: bigint;
};

export type AssetRefundsScan = {
  eligibleCount: number;
  blockedCount: number;
  isRealtime: boolean;
  level: number;
  totals: RefundTokenTotal[];
  parts: RefundPart[];
};
