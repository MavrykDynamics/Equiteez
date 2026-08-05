import { z } from "zod";
import {
  WalletRwaAssetSchema,
  WalletSchema,
  WalletTokenSchema,
} from "~/lib/apis/rwa/wallet/wallet.schema";

export type WalletTokenType = z.infer<typeof WalletTokenSchema>;
export type WalletRwaAssetType = z.infer<typeof WalletRwaAssetSchema>;
export type WalletResponseType = z.infer<typeof WalletSchema>;
