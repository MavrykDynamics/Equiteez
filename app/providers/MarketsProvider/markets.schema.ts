import { z } from "zod";

export const orderbookSchema = z.object({
  address: z.string(),
  last_matched_price: z.number(),
  lowest_sell_price: z.number(),
  highest_buy_price: z.number(),
  sell_order_fee: z.number(),
  buy_order_fee: z.number(),
  quote_token: z.object({
    address: z.string(),
    token_id: z.number(),
    symbol: z.string(),
    decimals: z.number(),
  }),
  currencies: z
    .array(
      z.object({
        currency_name: z.string(),
        token: z.object({
          address: z.string(),
          token_id: z.number(),
        }),
      })
    )
    .optional(),
});

const featureSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const listItemChildSchema = z.object({
  name: z.string().optional(),
  type: z.string(),
  value: z.string().optional(),
  highlight: z.boolean().optional(),
});

const listItemSchema = z.object({
  name: z.string().optional(),
  type: z.string(),
  value: z.string().nullable().optional(),
  children: z.array(listItemChildSchema).optional(),
  highlight: z.boolean().optional(),
});

const valuationDetailSchema = z.object({
  name: z.string(),
  type: z.string(),
  value: z.string(),
});

const imageUrlSchema = z.object({
  url: z.string(),
});

// -------------------------
// Main Schema
// -------------------------

export const assetSchema = z.object({
  token_address: z.string(),
  external_id: z.string(),

  currency: z.object({
    icon: z.string(),
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    change_in24h_percent: z.number(),
  }),

  web_url: z.string(),
  headline: z.string(),
  description: z.string(),
  is_primary: z.boolean(),

  address: z.object({
    zip: z.string(),
    city: z.string(),
    line1: z.string(),
    line2: z.string().nullable(),
    state: z.string(),
    country: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),

  brand: z.object({
    logo: z.string(),
    name: z.string(),
    background_url: z.string(),
  }),

  details: z.object({
    features: z.array(featureSchema),
    amenities: z.array(featureSchema),
  }),

  liquidity: z.number().nullable(),

  supply: z.object({
    sold: z.number(),
    total: z.number().nullable(),
    percentage: z.number(),
  }),

  apy: z.string(),
  investors: z.number().nullable(),

  tags: z.array(z.string()),

  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),

  sections: z.array(z.string()),

  metadata: z.object({
    is_live: z.boolean(),
    live_time: z.string(),
    asset_name: z.string(),
    can_calculate_returns: z.boolean(),
  }),

  investment_info: z.array(listItemSchema),

  financials: z.object({
    income: z.array(
      listItemSchema.extend({
        children: z
          .array(
            z.object({
              type: z.string(),
              value: z.string(),
            })
          )
          .optional(),
      })
    ),
    investment: z.array(listItemSchema),
  }),

  valuation: z.array(
    z.object({
      date: z.number(),
      title: z.string(),
      details: z.array(valuationDetailSchema),
      headline: z.string().nullable(),
    })
  ),

  blockchain: z.object({
    name: z.string(),
    asset: z.object({
      name: z.string(),
      address: z.string(),
      explorer: z.string().nullable(),
    }),
    issuer: z.object({
      name: z.string(),
      address: z.string(),
      explorer: z.string().nullable(),
    }),
    identifier: z.string(),
    total_tokens: z.number().nullable(),
  }),

  banners: z.object({
    why_invest: z.array(
      z.object({
        type: z.string(),
        title: z.string(),
        message: z.string(),
      })
    ),
  }),

  images: z.object({
    gallery: z.array(imageUrlSchema),
    thumbnail: z.string(),
  }),
});

export const assetDataSchema = z.object({
  asset: assetSchema,
  orderbook: orderbookSchema,
});

export const assetsListSchema = z.object({ assets: z.array(assetDataSchema) });
