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
    icon: data.token.iconUrl ?? "",

    assetType: data.identity.assetType ?? "",

    assetDetails: {
      coordinates: {
        lat: data.location.coordinates?.lat ?? 0,
        lng: data.location.coordinates?.lng ?? 0,
      },

      APY: data.market.annualReturn ?? 0,
      type: data.identity.isPrimary ? "Primary Market" : "Secondary Market",

      assetImages: data.media?.gallery?.map((i) => i.url) ?? [],
      previewImage: data.media?.thumbnail ?? "",

      basicInfo: {
        btcPrice: String(data.property?.basicInfo?.btcPrice ?? ""),
        amount: String(data.property?.basicInfo?.amount ?? ""),
        rooms: String(data.property?.basicInfo?.rooms ?? ""),
        sqft: String(data.property?.basicInfo?.sqft ?? ""),
        rate: String(data.property?.basicInfo?.rate ?? ""),
        homes: String(data.property?.basicInfo?.homes ?? ""),
        baths: String(data.property?.basicInfo?.baths ?? ""),
        beds: String(data.property?.basicInfo?.beds ?? ""),
        bond: String(data.property?.basicInfo?.bond ?? ""),
        yield: String(data.property?.basicInfo?.yield ?? ""),
        tvl: String(data.property?.basicInfo?.tvl ?? ""),
        coverage: String(data.property?.basicInfo?.coverage ?? ""),
        policies: String(data.property?.basicInfo?.policies ?? ""),
        date: String(data.property?.basicInfo?.date ?? ""),
      },

      propertyDetails: {
        description: data.identity.description ?? "",
        propertyType:
          data.property.features?.find((f) => f.id === "propertyType")?.value ??
          "",
        state: data.location.address?.state ?? "",
        country: data.location.address?.country ?? "",
        zipCode: Number(data.location.address?.zip ?? 0),
        parking:
          data.property?.features?.find((f) => f.id === "parking")?.value ?? "",
        type: "",

        shortAddress: [
          data.location.address.city,
          data.location.address.country,
        ]
          .filter(Boolean)
          .join(", "),
      },

      buildingInfo: {
        stories: Number(
          data.property?.features
            ?.find((f) => f.id === "stories")
            ?.value?.split(" ")[0] ?? 0
        ), //TODO string from API, we need number (API: "38 Stories", we need: 38)

        //TODO not sure about these fields
        lotSize: Number(
          data.property?.features?.find((f) => f.id === "lotSize")?.value ?? 0
        ),
        interiorSize: Number(
          data.property?.features?.find((f) => f.id === "interiorSize")
            ?.value ?? 0
        ),
        buildingClass:
          data.property?.features?.find((f) => f.id === "buildingClass")
            ?.value ?? "",
        foundation:
          data.property?.features?.find((f) => f.id === "foundation")?.value ??
          "",
        exteriorWalls:
          data.property?.features?.find((f) => f.id === "exteriorWalls")
            ?.value ?? "",
        roofType:
          data.property?.features?.find((f) => f.id === "roofType")?.value ??
          "",
        heating:
          data.property?.features?.find((f) => f.id === "heating")?.value ?? "",
        cooling:
          data.property?.features?.find((f) => f.id === "cooling")?.value ?? "",
        renovated:
          data.property?.features?.find((f) => f.id === "renovated")?.value ??
          "",
      },

      financials: {
        propertyFinancials: {
          grossRentYearly: data.financials?.investment?.grossRentYear ?? 0,
          grossRentMonthly: data.financials?.investment?.grossRentMonth ?? 0,

          monthlyCosts: {
            costs: Number(
              data.financials?.investment?.monthlyCosts?.total ?? 0
            ),
            netReproperty: Number(
              data.financials?.investment?.monthlyCosts
                ?.netRePropertyManagement ?? 0
            ),
            platform: Number(
              data.financials?.investment?.monthlyCosts?.platform ?? 0
            ),
            expenses: Number(
              data.financials?.investment?.monthlyCosts?.maintenanceExpenses ??
                0
            ),
            taxes: Number(
              data.financials?.investment?.monthlyCosts?.propertyTaxes ?? 0
            ),
            insurance: Number(
              data.financials?.investment?.monthlyCosts?.insurance ?? 0
            ),
            utilities: String(
              data.financials?.investment?.monthlyCosts?.utilities ?? ""
            ),
          },

          netRentMonthly: (data.financials?.investment?.netRentYear ?? 0) / 12,
          netRentYearly: data.financials?.investment?.netRentYear ?? 0,

          totalInvestment: {
            total: data.financials?.investment?.totalInvestment?.total ?? 0,
            underlyingAssetPrice:
              data.financials?.investment?.totalInvestment
                ?.underlyingAssetPrice ?? 0,
            initialMaintenanceReserve:
              data.financials?.investment?.totalInvestment
                ?.initialMaintenanceReserve ?? 0,
          },

          expectedIncome: data.financials?.investment?.expectedIncome ?? 0,
        },

        expectedIncome: {
          income: data.financials?.income?.expectedIncome?.value ?? 0,
          incomePerTokenYearly: 0,
          incomeStartDate: data.financials?.income?.incomeStartDate ?? "",
          tokenPrice: data.market.price ?? 0,
          totalTokens: data.token.totalTokens ?? 0,
          description: data.financials?.income?.expectedIncome?.note ?? "",
        },
      },

      blockchain: [
        {
          name: data.token.network,
          identifier: data.token.address,
          totalTokens: data.token.totalTokens ?? 0,
          assetIssuer: data.token.issuer?.name ?? "",
          assetId: data.identity.slug,
        },
      ],

      offering: {
        offeringDate: "",
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
            data.valuation?.prior?.items?.assetValuation?.value ?? 0
          ),
          annualChange: Number(
            data.valuation?.prior?.items?.annualChange?.value ?? 0
          ),
          totalInvestment: Number(
            data.valuation?.prior?.items?.totalInvestment?.value ?? 0
          ),
          capitalROI: Number(
            data.valuation?.prior?.items?.capitalROI?.value ?? 0
          ),
          tokenPrice: Number(
            data.valuation?.prior?.items?.tokenPrice?.value ?? 0
          ),
          regDistributed: Number(
            data.valuation?.prior?.items?.regDistributed?.value ?? 0
          ),
          info: data.valuation?.prior?.headline ?? "",
        },

        initialValuation: {
          date: data.valuation?.initial?.date ?? "",
          assetValuation: Number(
            data.valuation?.initial?.items?.assetValuation?.value ?? 0
          ),
          totalInvestment: Number(
            data.valuation?.initial?.items?.totalInvestment?.value ?? 0
          ),
          tokenPrice: Number(
            data.valuation?.initial?.items?.tokenPrice?.value ?? 0
          ),
          info: data.valuation?.initial?.title ?? "",
        },
      },

      priceDetails: {
        price: data.market.price ?? 0,
        annualReturn: data.market.annualReturn ?? 0,
        projectedAnnualReturn: data.market.projectedAnnualReturn ?? 0,
        rentalYield: data.market.rentalYield ?? 0,
        projectedRentalYield: data.market.projectedRentalYield ?? 0,
        totalLiquidity: data.market.totalLiquidity ?? 0,
        tokensAvailable: data.market.tokensAvailable ?? 0,
        tokensUsed: data.market.tokensUsed ?? 0,
      },

      tradingHistory: [],

      otc: {
        buying: [],
        selling: [],
      },
    },
  };
}
