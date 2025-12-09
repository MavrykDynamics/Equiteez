import { z } from "zod";

const FeatureItem = z.object({
  id: z.string(),
  name: z.string(),
});

const ListItem = z.object({
  name: z.string(),
  type: z.string(),
  value: z.union([z.string(), z.number()]),
  highlight: z.boolean().optional(),
  children: z.any().optional(),
});

const ListItemDirectional = z.object({
  name: z.string(),
  type: z.literal("list-item-directional"),
  value: z.number(),
  children: z
    .object({
      text: z.object({
        type: z.string(),
        value: z.string(),
      }),
    })
    .optional(),
});

// --- MAIN ASSET SCHEMA ---
export const AssetSchema = z.object({
  schemaVersion: z.number(),

  identity: z.object({
    assetName: z.string(),
    assetType: z.string(),
    isPrimary: z.boolean(),
    slug: z.string(),
    webUrl: z.string().url(),
    headline: z.string().optional(),
    description: z.string().optional(),
    isLive: z.boolean(),
    liveTime: z.string().optional(),
  }),

  token: z.object({
    symbol: z.string(),
    name: z.string(),
    decimals: z.number(),
    iconUrl: z.string().optional(),
    address: z.string(),
    network: z.string(),
    issuer: z.object({
      name: z.string(),
      address: z.string(),
    }),
    totalSupply: z.number().nullable().optional(),
    totalTokens: z.number().nullable().optional(),
  }),

  market: z.object({
    price: z.number(),
    changeIn24hPercent: z.number().optional(),
    totalLiquidity: z.number().nullable().optional(),
    tokensAvailable: z.number().nullable().optional(),
    tokensUsed: z.number().nullable().optional(),
    annualReturn: z.number().nullable().optional(),
    projectedAnnualReturn: z.number().nullable().optional(),
    rentalYield: z.number().nullable().optional(),
    projectedRentalYield: z.number().nullable().optional(),
  }),

  location: z.object({
    address: z.object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
    }),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),

  property: z.object({
    brand: z
      .object({
        name: z.string().optional(),
      })
      .optional(),

    basicInfo: z.record(z.string()).optional(),

    features: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          value: z.string().optional(),
        })
      )
      .optional(),

    amenities: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          value: z.string().optional(),
        })
      )
      .optional(),

    categories: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      )
      .optional(),

    sections: z.array(z.string()).optional(),
  }),

  financials: z
    .object({
      investment: z
        .object({
          grossRentYear: z.number().optional(),
          grossRentMonth: z.number().optional(),

          monthlyCosts: z
            .object({
              total: z.union([z.number(), z.string()]).nullable().optional(),
              netRePropertyManagement: z
                .union([z.number(), z.string()])
                .nullable()
                .optional(),
              platform: z.union([z.number(), z.string()]).nullable().optional(),
              maintenanceExpenses: z
                .union([z.number(), z.string()])
                .nullable()
                .optional(),
              propertyTaxes: z
                .union([z.number(), z.string()])
                .nullable()
                .optional(),
              insurance: z
                .union([z.number(), z.string()])
                .nullable()
                .optional(),
              utilities: z
                .union([z.number(), z.string()])
                .nullable()
                .optional(),
            })
            .optional(),

          netRentYear: z.number().optional(),

          totalInvestment: z
            .object({
              total: z.number().optional(),
              underlyingAssetPrice: z.number().optional(),
              initialMaintenanceReserve: z.number().optional(),
            })
            .optional(),

          expectedIncome: z.number().optional(),
        })
        .optional(),

      income: z
        .object({
          expectedIncome: z
            .object({
              value: z.number(),
              note: z.string().optional(),
            })
            .optional(),

          incomeStartDate: z.string().optional(),
        })
        .optional(),
    })
    .optional(),

  valuation: z
    .object({
      initial: z
        .object({
          date: z.string().optional(),
          title: z.string().optional(),
          items: z
            .object({
              assetValuation: z
                .object({
                  label: z.string(),
                  value: z.number(),
                  type: z.string(),
                })
                .optional(),
              totalInvestment: z
                .object({
                  label: z.string(),
                  value: z.number(),
                  type: z.string(),
                })
                .optional(),
              tokenPrice: z
                .object({
                  label: z.string(),
                  value: z.number(),
                  type: z.string(),
                })
                .optional(),
            })
            .optional(),
        })
        .optional(),

      prior: z
        .object({
          date: z.string().optional(),
          title: z.string().optional(),
          headline: z.string().optional(),
          items: z
            .object({
              assetValuation: z
                .object({
                  label: z.string(),
                  value: z.number(),
                  type: z.string(),
                })
                .optional(),
              annualChange: z
                .object({
                  label: z.string(),
                  value: z.number(),
                  type: z.string(),
                })
                .optional(),
              totalInvestment: z
                .object({
                  label: z.string(),
                  value: z.number(),
                  type: z.string(),
                })
                .optional(),
              tokenPrice: z
                .object({
                  label: z.string(),
                  value: z.number(),
                  type: z.string(),
                })
                .optional(),
              capitalROI: z
                .object({
                  label: z.string(),
                  value: z.number(),
                  type: z.string(),
                })
                .optional(),
              regDistributed: z
                .object({
                  label: z.string(),
                  value: z.number(),
                  type: z.string(),
                })
                .optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),

  media: z
    .object({
      thumbnail: z.string().url().optional(),
      gallery: z.array(z.object({ url: z.string().url() })).optional(),
      brandLogo: z.string().url().optional(),
      brandBackground: z.string().url().optional(),
    })
    .optional(),
});

// --- ORDERBOOK ---
export const OrderbookSchema = z.object({
  address: z.string(),
  last_matched_price: z.number(),
  lowest_sell_price: z.number(),
  highest_buy_price: z.number(),
  sell_order_fee: z.number(),
  buy_order_fee: z.number(),
  rwa_token: z.object({
    address: z.string(),
    name: z.string(),
    symbol: z.string(),
    icon: z.string(),
    decimals: z.number(),
    token_id: z.number(),
  }),
  quote_token: z.object({
    address: z.string(),
    token_id: z.number(),
    symbol: z.string(),
    decimals: z.number(),
  }),
});

// --- FINAL FULL OBJECT ---
export const FullSchema = z.object({
  asset: AssetSchema,
  orderbook: OrderbookSchema,
});

export const assetsListSchema = z.object({ assets: z.array(FullSchema) });
