import { z } from "zod";
import {
  WalletActivitySummarySchema,
  WalletPortfolioAssetSchema,
  WalletPortfolioHistoryPointSchema,
  WalletPortfolioHistorySchema,
  WalletPortfolioSchema,
  WalletRwaAssetSchema,
  WalletSchema,
  WalletTokenSchema,
} from "~/lib/apis/rwa/wallet/wallet.schema";

export type WalletTokenType = z.infer<typeof WalletTokenSchema>;
export type WalletRwaAssetType = z.infer<typeof WalletRwaAssetSchema>;
export type WalletResponseType = z.infer<typeof WalletSchema>;
export type WalletPortfolioAssetType = z.infer<
  typeof WalletPortfolioAssetSchema
>;
export type WalletPortfolioResponseType = z.infer<
  typeof WalletPortfolioSchema
>;
export type WalletPortfolioHistoryPointType = z.infer<
  typeof WalletPortfolioHistoryPointSchema
>;
export type WalletPortfolioHistoryResponseType = z.infer<
  typeof WalletPortfolioHistorySchema
>;
export type WalletActivitySummaryResponseType = z.infer<
  typeof WalletActivitySummarySchema
>;
