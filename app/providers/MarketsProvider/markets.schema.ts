import { z } from "zod";

// --- MAIN ASSET SCHEMA ---
export const AssetSchema = z.object({
  identity: z.object({
    asset_name: z.string(),
    asset_type: z.string(),
    is_primary: z.boolean(),
    tags: z.array(z.string()),
    slug: z.string(),
    web_url: z.string().url(),
    headline: z.string().optional(),
    description: z.string().optional(),
    is_live: z.boolean(),
    live_time: z.string().optional(),
  }),

  token: z.object({
    symbol: z.string(),
    name: z.string(),
    decimals: z.number(),
    icon_url: z.string().optional(),
    address: z.string(),
    network: z.string(),
    issuer: z.object({
      name: z.string(),
      address: z.string(),
    }),
    total_supply: z.number().nullable().optional(),
    total_tokens: z.number().nullable().optional(),
  }),

  market: z.object({
    price: z.number(),
    change_in24h_percent: z.number().optional(),
    total_liquidity: z.number().nullable().optional(),
    tokens_available: z.number().nullable().optional(),
    tokens_used: z.number().nullable().optional(),
    annual_return: z.number().nullable().optional(),
    projected_annual_return: z.number().nullable().optional(),
    rental_yield: z.number().nullable().optional(),
    projected_rental_yield: z.number().nullable().optional(),
  }),

  location: z.object({
    address: z.object({
      line1: z.string().optional(),
      line2: z.string().optional().nullable(),
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
    building: z.object({
      lot_size: z.number().nullable(),
      interior_size: z.number().nullable(),
      building_class: z.string().nullable(),
      foundation: z.string().nullable(),
      exterior_walls: z.string().nullable(),
      roof_type: z.string().nullable(),
      heating: z.string().nullable(),
      cooling: z.string().nullable(),
      renovated: z.string().nullable(),
    }),

    brand: z
      .object({
        name: z.string().optional(),
      })
      .optional(),

    basic_info: z
      .record(z.union([z.string().nullable(), z.number().nullable()]))
      .optional()
      .nullable(),

    features: z
      .array(
        z.object({
          id: z.string(),
          label: z.string().optional(),
          value: z.union([z.string().nullable(), z.number().nullable()]),
        })
      )
      .optional(),

    amenities: z
      .array(
        z.object({
          id: z.string(),
          label: z.string().optional(),
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
          gross_rent_year: z.number().optional(),
          gross_rent_month: z.number().optional(),

          monthly_costs: z
            .object({
              total: z.union([z.number(), z.string()]).nullable().optional(),
              net_re_property_management: z
                .union([z.number(), z.string()])
                .nullable()
                .optional(),
              platform: z.union([z.number(), z.string()]).nullable().optional(),
              maintenance_expenses: z
                .union([z.number(), z.string()])
                .nullable()
                .optional(),
              property_taxes: z
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

          net_rent_year: z.number().optional(),

          total_investment: z
            .object({
              total: z.number().optional(),
              underlying_asset_price: z.number().optional(),
              initial_maintenance_reserve: z.number().optional(),
            })
            .optional(),

          expected_income: z.number().optional(),
        })
        .optional(),

      income: z
        .object({
          expected_income: z
            .object({
              value: z.number(),
              note: z.string().optional(),
            })
            .optional(),

          income_start_date: z.string().optional(),
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
              asset_valuation: z
                .object({
                  label: z.string().optional(),
                  value: z.number(),
                  type: z.string().optional(),
                })
                .optional(),
              total_investment: z
                .object({
                  label: z.string().optional(),
                  value: z.number(),
                  type: z.string().optional(),
                })
                .optional(),
              token_price: z
                .object({
                  label: z.string().optional(),
                  value: z.number(),
                  type: z.string().optional(),
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
              asset_valuation: z
                .object({
                  label: z.string().optional(),
                  value: z.number(),
                  type: z.string().optional(),
                })
                .optional(),
              annual_change: z
                .object({
                  label: z.string().optional(),
                  value: z.number(),
                  type: z.string().optional(),
                })
                .optional(),
              total_investment: z
                .object({
                  label: z.string().optional(),
                  value: z.number(),
                  type: z.string().optional(),
                })
                .optional(),
              token_price: z
                .object({
                  label: z.string().optional(),
                  value: z.number(),
                  type: z.string().optional(),
                })
                .optional(),
              capital_r_o_i: z
                .object({
                  label: z.string().optional(),
                  value: z.number(),
                  type: z.string().optional(),
                })
                .optional(),
              reg_distributed: z
                .object({
                  label: z.string().optional(),
                  value: z.number(),
                  type: z.string().optional(),
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
      brand_logo: z.string().url().optional(),
      brand_background: z.string().url().optional(),
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
  rwa_token: z
    .object({
      address: z.string(),
      name: z.string(),
      symbol: z.string(),
      icon: z.string(),
      decimals: z.number(),
      token_id: z.number().optional(),
    })
    .optional(),
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
