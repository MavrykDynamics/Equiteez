import { z } from "zod";

export const orderbookSchema = z.object({
  address: z.string(),
  last_matched_price: z.number(),
  lowest_sell_price: z.number(),
  highest_buy_price: z.number(),
  sell_order_fee: z.number(),
  buy_order_fee: z.number(),
  currencies: z.array(
    z.object({
      currency_name: z.string(),
      token: z.object({
        address: z.string(),
        token_id: z.number(),
      }),
    })
  ).optional(),
});

const tokenMetadataSchema = z.object({
  icon: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.string(),
  thumbnail_uri: z.string(),
  should_prefer_symbol: z.string(),
});

const offeringSchema = z.object({
  offering_date: z.string(),
  raised_amount: z.number(),
  offering_issuer: z.string(),
  offering_percent: z.number(),
  max_investment_amount: z.number(),
  min_investment_amount: z.number(),
});

const basicInfoSchema = z.record(z.union([z.string(), z.number()]));

const valuationRecordSchema = z.object({
  date: z.string(),
  info: z.string(),
  capital_r_o_i: z.number().optional(),
  token_price: z.number(),
  annual_change: z.number().optional(),
  asset_valuation: z.number(),
  reg_distributed: z.number().optional(),
  total_investment: z.number(),
});

const valuationSchema = z.object({
  prior_valuation: valuationRecordSchema,
  initial_valuation: valuationRecordSchema,
});

const blockchainSchema = z.record(z.union([z.string(), z.number()]));

const monthlyCostsSchema = z.object({
  costs: z.number(),
  taxes: z.number(),
  expenses: z.number(),
  platform: z.number(),
  insurance: z.number(),
  utilities: z.string(),
  net_reproperty: z.number(),
});

const totalInvestmentSchema = z.object({
  total: z.number(),
  underlying_asset_price: z.number(),
  initial_maintenance_reserve: z.number(),
});

const propertyFinancialsSchema = z.object({
  monthly_costs: monthlyCostsSchema,
  net_rent_yearly: z.number(),
  net_rent_monthly: z.number(),
  gross_rent_yearly: z.number(),
  gross_rent_monthly: z.number(),
  total_investment: totalInvestmentSchema,
});

const expectedIncomeSchema = z.object({
  income: z.number(),
  income_start_date: z.string(),
  description: z.string().optional()
});

const financialsSchema = z.object({
  expected_income: expectedIncomeSchema,
  property_financials: propertyFinancialsSchema,
});

const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const buildingInfoSchema = z
  .object({
    cooling: z.string(),
    heating: z.string(),
    lot_size: z.number(),
    stories: z.number(),
    roof_type: z.string(),
    renovated: z.string(),
    foundation: z.string(),
    interior_size: z.number(),
    building_class: z.string(),
    exterior_walls: z.string(),
  })
  .optional();

const neighborhoodSchema = z
  .object({
    coordinates: coordinatesSchema,
    description: z.string(),
  })
  .optional();

const priceDetailsSchema = z.record(z.union([z.string(), z.number()]));

const propertyDetailsSchema = z.record(z.union([z.string(), z.number()]));

const assetDetailsSchema = z.object({
  _a_p_y: z.number(),
  type: z.string(),
  offering: offeringSchema,
  basic_info: basicInfoSchema,
  valuation: valuationSchema,
  blockchain: z.array(blockchainSchema),
  financials: financialsSchema,
  asset_images: z.array(z.string()),
  coordinates: coordinatesSchema,
  building_info: buildingInfoSchema,
  neighborhood: neighborhoodSchema,
  preview_image: z.string().url(),
  price_details: priceDetailsSchema,
  property_details: propertyDetailsSchema,
});

export const assetSchema = z.object({
  token_id: z.string(),
  token_address: z.string(),
  token_standard: z.string(),
  token_metadata: tokenMetadataSchema,
  symbol: z.string(),
  decimals: z.number(),
  icon: z.string(),
  asset_type: z.string(),
  category: z.string(),
  asset_details: assetDetailsSchema,
});

export const assetDataSchema = z.object({
  asset: assetSchema,
  orderbook: orderbookSchema,
});

export const assetsListSchema = z.object({ assets: z.array(assetDataSchema) });
