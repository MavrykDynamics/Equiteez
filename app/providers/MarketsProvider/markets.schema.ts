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
  token_address: z.string(),
  external_id: z.string(),
  currency: z.object({
    icon: z.string(),
    name: z.string(),
    symbol: z.string(),
    token_id: z.number(),
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
    line2: z.string().optional().nullable(),
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
    features: z.record(FeatureItem),
    amenities: z.record(FeatureItem),
  }),
  liquidity: z.any().nullable(),
  supply: z.object({
    sold: z.number(),
    total: z.number().nullable(),
    percentage: z.number(),
  }),
  apy: z.number(),
  investors: z.any().nullable(),
  tags: z.record(z.string()),
  categories: z.record(
      z.object({
        id: z.string(),
        name: z.string(),
      })
  ),
  sections: z.record(z.string()),
  metadata: z.object({
    is_live: z.boolean(),
    live_time: z.string(),
    asset_name: z.string(),
    can_calculate_returns: z.boolean(),
  }),

  investment_info: z.object({
    investors: ListItem,
    annual_return: ListItem,
    projected_annual_return: ListItem.optional().nullable(),
  }),

  financials: z.object({
    income: z.object({
      token_price: ListItem,
      expected_income: ListItemDirectional,
      income_start_date: ListItem,
    }),
    investment: z.object({
      net_rent_year: ListItem,
      monthly_costs: z.object({
        name: z.string(),
        type: z.string(),
        value: z.union([z.string(), z.number()]),
        children: z.record(ListItem.or(z.object({ type: z.string() }))),
      }),
      gross_rent_year: ListItem,
      expected_income: ListItemDirectional,
      gross_rent_month: ListItem,
      total_investment: z.object({
        name: z.string(),
        type: z.string(),
        value: z.number(),
        children: z.record(ListItem.or(z.object({ type: z.string() }))),
      }),
    }),
  }),

  valuation: z.object({
    prior_valuation: z.object({
      date: z.string(),
      title: z.string(),
      details: z.record(ListItem.or(ListItemDirectional)),
      headline: z.string().nullable(),
    }),
    initial_valuation: z.object({
      date: z.string(),
      title: z.string(),
      details: z.record(ListItem),
      headline: z.string().nullable(),
    }),
  }),

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
    gallery: z.array(
        z.object({
          url: z.string(),
        })
    ),
    thumbnail: z.string(),
  }),
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
