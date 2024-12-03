import { z } from "zod";

const marketAssetSchema = z.object({
  icon: z.string(),
  name: "Ocean Front Property",
  symbol: "OCEAN",
  decimals: "2",
  assetDetails: {
    offering: {
      cooling: "None",
      heating: "Forced Air/Gas",
      roofType: "asphault",
      renovated: "Entirely Renovated",
      monthlyCosts: "-446.00",
      offeringDate: "1700379619",
      netRentYearly: "8808.00",
      expectedIncome: "10.37",
      netRentMonthly: "734.00",
      totalInvestment: "84900.00",
      grossRentMonthly: "1,180.00",
    },
    valuations: {
      latest: {
        capitalROI: "13.92",
        tokenPrice: "53.07",
        additionInfo: "none",
        annualChange: "17.65",
        vaulationDate: "1710765441",
        assetVaulation: "84000.00",
        regDistributed: "7882.22",
        totalInvestment: "84900.00",
      },
      initial: {
        tokenPrice: "50.00",
        additionInfo: "none",
        vaulationDate: "1700379619",
        assetVaulation: "68000.00",
        totalInvestment: "78816.00",
      },
    },
  },
  thumbnailUri: z.string(),
  shouldPreferSymbol: z.boolean(),
});

const marketMetadataSchema = z.object({
  name: z.string(),
  views: z.array(z.any()),
  assets: z.array(marketAssetSchema),
  errors: z.array(z.any()),
  source: z.object({
    tools: z.array(z.string()),
    location: z.string(),
  }),
  authors: z.array(z.string()),
  interfaces: z.array(z.string()),
  description: z.string(),
});

export const marketSchema = z.object({
  address: z.string(),
  token_id: z.number(),
  token_standard: z.number(),
  token_metadata: z.object({
    assetDetails: z.string(),
  }),
  metadata: marketMetadataSchema,
});
