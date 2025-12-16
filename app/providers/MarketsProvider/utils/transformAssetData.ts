import {
  AssetData,
  AssetUniversal,
} from "~/providers/MarketsProvider/market.types";

export function transformAssetData(payload: AssetData): AssetUniversal {
  const data = payload.asset ?? {};

  return {
    token_address: data.token.address,
    name: data.token.name,
    symbol: data.token.symbol,
    decimals: data.token.decimals,
    icon: data.token.icon_url ?? "",

    assetType: data.identity.asset_type ?? "",

    assetDetails: {
      coordinates: {
        lat: data.location.coordinates?.lat ?? 0,
        lng: data.location.coordinates?.lng ?? 0,
      },

      APY: data.market.annual_return ?? 0,
      type: data.identity.is_primary ? "Primary Market" : "Secondary Market",

      assetImages: data.media?.gallery?.map((i) => i.url) ?? [],
      previewImage: data.media?.thumbnail ?? "",

      basicInfo: {
        btcPrice: data.property?.basic_info?.btcPrice
          ? `${data.property?.basic_info?.btcPrice} BTC`
          : "",
        amount: data.property?.basic_info?.amount
          ? String(data.property?.basic_info?.amount)
          : "",
        rooms: data.property?.basic_info?.rooms
          ? `${data.property?.basic_info?.rooms} rooms`
          : "",
        sqft: data.property?.basic_info?.sqft
          ? `${data.property?.basic_info?.sqft} sqft`
          : "",
        rate: String(data.property?.basic_info?.rate ?? ""),
        homes: data.property?.basic_info?.homes
          ? `${data.property?.basic_info?.homes} homes`
          : "",
        baths: data.property?.basic_info?.baths
          ? `${data.property?.basic_info?.baths} baths`
          : "",
        beds: data.property?.basic_info?.beds
          ? `${data.property?.basic_info?.beds} beds`
          : "",
        bond: String(data.property?.basic_info?.bond ?? ""),
        yield: String(data.property?.basic_info?.yield ?? ""),
        tvl: String(data.property?.basic_info?.tvl ?? ""),
        coverage: String(data.property?.basic_info?.coverage ?? ""),
        policies: String(data.property?.basic_info?.policies ?? ""),
        date: String(data.property?.basic_info?.date ?? ""),
      },

      propertyDetails: {
        location: data.location.address.state,
        description: data.identity.description ?? "",
        propertyType: String(
          data.property.features?.find((f) => f.id === "propertyType")?.value ??
            data.identity.asset_type ??
            ""
        ),
        rented:
          data.property.amenities?.find((item) => item.id === "rentalStatus")
            ?.value ?? "",
        propertyManager:
          data.property.amenities?.find((item) => item.id === "manager")
            ?.value ?? "",
        rentalType:
          data.property.amenities?.find((item) => item.id === "rentalType")
            ?.value ?? "",
        state: data.location.address?.state ?? "",
        country: data.location.address?.country ?? "",
        zipCode: Number(data.location.address?.zip ?? 0),
        parking: String(
          data.property?.features?.find((f) => f.id === "parking")?.value ??
            data.property?.amenities?.find((f) => f.id === "parking")?.value ??
            ""
        ),
        occupancy: String(
          data.property?.features?.find((f) => f.id === "occupancy")?.value ??
            ""
        ),
        annualReturns: `${data.market.annual_return ?? 0}%`,
        security: String(
          data.property?.amenities?.find((f) => f.id === "security")?.value ??
            ""
        ),
        capacity: String(
          data.property?.features?.find((f) => f.id === "capacity")?.value ?? ""
        ),
        hashRate: String(
          data.property?.features?.find((f) => f.id === "hashrate")?.value ?? ""
        ),
        redundancy: String(
          data.property?.amenities?.find((f) => f.id === "redundancy")?.value ??
            ""
        ),
        connectivity: String(
          data.property?.amenities?.find((f) => f.id === "connectivity")
            ?.value ?? ""
        ),
        energySource: String(
          data.property?.features?.find((f) => f.id === "energy")?.value ?? ""
        ),
        powerSource: String(
          data.property?.features?.find((f) => f.id === "energy")?.value ?? ""
        ),
        cooling: data.property.building.cooling ?? "",
        type: String(
          data.property?.features?.find((f) => f.id === "propertyType")
            ?.value ?? ""
        ),
        size: data.property.building.interior_size,
        amenities: data.property.amenities
          ?.map((item) => item.value)
          .join(", "),

        fullAddress: [
          data.location.address.line1,
          data.location.address.line2,
          data.location.address.city,
          data.location.address.state,
          data.location.address.country,
        ]
          .filter(Boolean)
          .join(", "),
        shortAddress: [
          data.location.address.city,
          data.location.address.country,
        ]
          .filter(Boolean)
          .join(", "),
      },

      buildingInfo: {
        stories: Number(
          data.property?.features?.find((f) => f.id === "stories")?.value ?? 0
        ),

        lotSize: data.property.building?.lot_size ?? 0,
        interiorSize: data.property.building?.interior_size ?? 0,
        buildingClass: data.property.building?.building_class ?? "",
        foundation: data.property.building?.foundation ?? "",
        exteriorWalls: data.property.building?.exterior_walls ?? "",
        roofType: data.property.building?.roof_type ?? "",
        heating: data.property.building?.heating ?? "",
        cooling: data.property.building?.cooling ?? "",
        renovated: data.property.building?.renovated ?? "",
      },

      financials: {
        propertyFinancials: {
          grossRentYearly: data.financials?.investment?.gross_rent_year ?? 0,
          grossRentMonthly: data.financials?.investment?.gross_rent_month ?? 0,

          monthlyCosts: {
            costs: Number(
              data.financials?.investment?.monthly_costs?.total ?? 0
            ),
            netReproperty: Number(
              data.financials?.investment?.monthly_costs
                ?.net_re_property_management ?? 0
            ),
            platform: Number(
              data.financials?.investment?.monthly_costs?.platform ?? 0
            ),
            expenses: Number(
              data.financials?.investment?.monthly_costs
                ?.maintenance_expenses ?? 0
            ),
            taxes: Number(
              data.financials?.investment?.monthly_costs?.property_taxes ?? 0
            ),
            insurance: Number(
              data.financials?.investment?.monthly_costs?.insurance ?? 0
            ),
            utilities: String(
              data.financials?.investment?.monthly_costs?.utilities ?? ""
            ),
          },

          netRentMonthly:
            (data.financials?.investment?.net_rent_year ?? 0) / 12,
          netRentYearly: data.financials?.investment?.net_rent_year ?? 0,

          totalInvestment: {
            total: data.financials?.investment?.total_investment?.total ?? 0,
            underlyingAssetPrice:
              data.financials?.investment?.total_investment
                ?.underlying_asset_price ?? 0,
            initialMaintenanceReserve:
              data.financials?.investment?.total_investment
                ?.initial_maintenance_reserve ?? 0,
          },

          expectedIncome: data.financials?.investment?.expected_income ?? 0,
        },

        expectedIncome: {
          income: data.financials?.income?.expected_income?.value ?? 0,
          incomePerTokenYearly: 0,
          incomeStartDate: data.financials?.income?.income_start_date ?? "",
          tokenPrice: data.market.price ?? 0,
          totalTokens: data.token.total_tokens ?? 0,
          description: data.financials?.income?.expected_income?.note ?? "",
        },
      },

      blockchain: [
        {
          name: data.token.network,
          identifier: data.token.address,
          totalTokens: data.token.total_tokens ?? 0,
          assetIssuer: data.token.issuer?.name ?? "",
          assetId: data.identity.slug,
        },
      ],

      offering: {
        offeringDate: "2014-07-15T05:09:25-03:00",
        offeringIssuer: "",
        minInvestmentAmount: 0,
        maxInvestmentAmount: 0,
        raisedAmount: 0,
        offeringPercent: 0,
      },

      valuation: {
        priorValuation: {
          date: data.valuation?.prior?.date ?? "",
          assetValuation: Number(
            data.valuation?.prior?.items?.asset_valuation?.value ?? 0
          ),
          annualChange: Number(
            data.valuation?.prior?.items?.annual_change?.value ?? 0
          ),
          totalInvestment: Number(
            data.valuation?.prior?.items?.total_investment?.value ?? 0
          ),
          capitalROI: Number(
            data.valuation?.prior?.items?.capital_r_o_i?.value ?? 0
          ),
          tokenPrice: Number(
            data.valuation?.prior?.items?.token_price?.value ?? 0
          ),
          regDistributed: Number(
            data.valuation?.prior?.items?.reg_distributed?.value ?? 0
          ),
          info: data.valuation?.prior?.headline ?? "",
        },

        initialValuation: {
          date: data.valuation?.initial?.date ?? "",
          assetValuation: Number(
            data.valuation?.initial?.items?.asset_valuation?.value ?? 0
          ),
          totalInvestment: Number(
            data.valuation?.initial?.items?.total_investment?.value ?? 0
          ),
          tokenPrice: Number(
            data.valuation?.initial?.items?.token_price?.value ?? 0
          ),
          info: data.valuation?.initial?.title ?? "",
        },
      },

      priceDetails: {
        price: data.market.price ?? 0,
        annualReturn: data.market.annual_return ?? 0,
        projectedAnnualReturn: data.market.projected_annual_return ?? 0,
        rentalYield: data.market.rental_yield ?? 0,
        projectedRentalYield: data.market.projected_rental_yield ?? 0,
        totalLiquidity: data.market.total_liquidity ?? 0,
        tokensAvailable: data.market.tokens_available ?? 0,
        tokensUsed: data.market.tokens_used ?? 0,
      },

      tradingHistory: [],

      otc: {
        buying: [],
        selling: [],
      },
    },
  };
}
