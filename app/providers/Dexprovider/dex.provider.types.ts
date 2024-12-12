import BigNumber from "bignumber.js";
import { z } from "zod";

export type DexProviderCtxType = {
  orderbook: StringRecord<string>;
  dodoMav: StringRecord<BigNumber>;
  dodoStorages: StringRecord<DodoStorageType>;
  dodoTokenPair: StringRecord<string>;
};

export const dodoTokenSchema = z.object({
  tokenId: z.string(),
  tokenContractAddress: z.string(),
});

export const configSchema = z.object({
  lpFee: z.string(),
  priceModel: z.string(),
  feeDecimals: z.string(),
  maintainerFee: z.string(),
  appraisalPrice: z.string(),
  fixedPricePercent: z.string(),
  orderbookPricePercent: z.string(),
});

export const dodoStorageTypeSchema = z.object({
  config: configSchema,
  rStatus: z.string(),
  metadata: z.number(),
  baseToken: dodoTokenSchema,
  guidePrice: z.string(),
  quoteToken: dodoTokenSchema,
  superAdmin: z.string(),
  baseBalance: z.string(),
  baseLpToken: dodoTokenSchema,
  pauseLedger: z.number(),
  lambdaLedger: z.number(),
  quoteBalance: z.string(),
  quoteLpToken: dodoTokenSchema,
  newSuperAdmin: z.string().nullable(),
  slippageFactor: z.string(),
  baseBalanceLimit: z.string(),
  quoteBalanceLimit: z.string(),
  rwaOrderbookAddress: z.string(),
  targetBaseTokenAmount: z.string(),
  targetQuoteTokenAmount: z.string(),
});

export type DodoStorageType = z.infer<typeof dodoStorageTypeSchema>;
export type DodoToken = z.infer<typeof dodoTokenSchema>;
export type Config = z.infer<typeof configSchema>;
