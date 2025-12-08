import {
  AssetData,
  EstateType,
} from "~/providers/MarketsProvider/market.types";

export function transformAssetData(data: AssetData): EstateType {
  const asset = data.asset ?? {};

  return {
    token_address: asset.token_address,
    name: asset.currency.name,
    symbol: asset.currency.symbol,
    decimals: asset.currency.decimals,
    icon: asset.currency.icon,

    assetType: "", // TODO add value

    assetDetails: {
      coordinates: {
        lat: asset.address.latitude,
        lng: asset.address.longitude,
      },

      APY: +asset.apy || 0,

      type:
        asset.sections?.secondary === "secondary"
          ? "Secondary Market"
          : "Primary Market",

      assetImages: asset.images.gallery.map((i) => i.url),

      previewImage: asset.images.thumbnail,

      basicInfo: {
        beds: 0, // TODO add value
        baths: 0, // TODO add value
        sqft: 0, // TODO add value

        // btcPrice: BitcoinIcon,
        // amount: VortexesIcon,
        // rooms: KeysIcon,
        // sqft: SqftIcon,
        // rate: RateIcon,
        // homes: HouseIcon,
        // baths: ShowerIcon,
        // beds: BedIcon,
        // bond: BondIcon,
        // yield: YieldIcon,
        // tvl: LockIcon,
        // coverage: CoverageIcon,
        // policies: PoliciesIcon,
        // date: DateIcon,
      },

      propertyDetails: {
        flag: asset.tags?.new ?? null,
        developer: asset.brand?.name ?? null,
        description: asset.description ?? "",
        propertyType: asset.categories?.mixed_use?.name ?? null,
        fullAddress: `${asset.address.line1}, ${asset.address.city}, ${asset.address.country}`,
        shortAddress: `${asset.address.city}, ${asset.address.country}`,
        zipCode: asset.address.zip,
        state: asset.address.state,
        country: asset.address.country,
        rentalType: "", // TODO add value
        rented: "", // TODO add value
        rentSubsidy: "", // TODO add value
        propertyManager: "", // TODO add value
        parking: asset.details?.amenities?.parking?.name ?? null,
      },

      buildingInfo: {
        stories:
          Number(asset.details?.features?.stories?.name?.split(" ")[0]) || 0,
        lotSize: 0, // TODO add value
        interiorSize: 0, // TODO add value
        buildingClass: "", // TODO add value
        foundation: "", // TODO add value
        exteriorWalls: "", // TODO add value
        roofType: "", // TODO add value
        heating: "", // TODO add value
        cooling: "", // TODO add value
        renovated: "", // TODO add value
      },

      neighborhood: {
        description: "", // TODO add value
        coordinates: {
          lat: asset.address.latitude,
          lng: asset.address.longitude,
        },
      },

      financials: {
        propertyFinancials: {
          grossRentYearly:
            +asset.financials.investment.gross_rent_year?.value || 0,
          grossRentMonthly:
            +asset.financials.investment.gross_rent_month?.value  || 0,

          monthlyCosts: {
            costs: Math.abs(
              +asset.financials.investment.monthly_costs?.value || 0
            ),
            netReproperty: Math.abs(
              asset.financials.investment.monthly_costs?.children
                ?.net_re_property_management?.value ?? 0
            ),
            platform: Math.abs(
              asset.financials.investment.monthly_costs?.children?.platform
                ?.value ?? 0
            ),
            expenses: Math.abs(
              asset.financials.investment.monthly_costs?.children
                ?.maintenance_expenses?.value ?? 0
            ),
            taxes: Math.abs(
              asset.financials.investment.monthly_costs?.children
                ?.property_taxes?.value ?? 0
            ),
            insurance: Math.abs(
              asset.financials.investment.monthly_costs?.children?.insurance
                ?.value ?? 0
            ),
            utilities:
              asset.financials.investment.monthly_costs?.children?.utilities
                ?.value ?? null,
          },

          netRentMonthly:
            (asset.financials.investment.gross_rent_month?.value ?? 0) -
            Math.abs(asset.financials.investment.monthly_costs?.value ?? 0),

          netRentYearly:
            asset.financials.investment.net_rent_year?.value ?? null,

          totalInvestment: {
            total: asset.financials.investment.total_investment?.value ?? null,
            underlyingAssetPrice:
              asset.financials.investment.total_investment?.children
                ?.underlying_asset_price?.value ?? null,
            initialMaintenanceReserve:
              asset.financials.investment.total_investment?.children
                ?.initial_maintenance_reserve?.value ?? null,
          },

          expectedIncome:
            asset.financials.investment.expected_income?.value ?? null,
        },

        expectedIncome: {
          income: asset.financials.income.expected_income?.value ?? null,
          incomePerTokenYearly: 0, // TODO add value
          incomeStartDate:
            asset.financials.income.income_start_date?.value ?? null,
          tokenPrice: asset.financials.income.token_price?.value ?? null,
          totalTokens: asset.blockchain.total_tokens ?? null,
          description:
            asset.financials.income.expected_income?.children?.text?.value ??
            null,
        },
      },

      blockchain: [
        {
          name: asset.blockchain.name,
          identifier: asset.blockchain.identifier,
          totalTokens: asset.blockchain.total_tokens,
          assetIssuer: asset.blockchain.issuer.address,
          assetId: asset.blockchain.asset.address,
        },
      ],

      offering: {
        offeringDate: asset.metadata.live_time,
        offeringIssuer: asset.brand.name,
        minInvestmentAmount: 0, // TODO add value
        maxInvestmentAmount: 0, // TODO add value
        raisedAmount: asset.supply.sold ?? null,
        offeringPercent: asset.supply.percentage ?? null,
      },

      valuation: {
        priorValuation: {
          date: asset.valuation.prior_valuation?.date ?? null,
          assetValuation:
            asset.valuation.prior_valuation?.details?.asset_valuation?.value ??
            null,
          annualChange:
            asset.valuation.prior_valuation?.details?.annual_change?.value ??
            null,
          totalInvestment:
            asset.valuation.prior_valuation?.details?.total_investment?.value ??
            null,
          capitalROI:
            asset.valuation.prior_valuation?.details?.capital_r_o_i?.value ??
            null,
          tokenPrice:
            asset.valuation.prior_valuation?.details?.token_price?.value ??
            null,
          regDistributed:
            asset.valuation.prior_valuation?.details?.reg_distributed?.value ??
            null,
          info: "?",
        },

        initialValuation: {
          date: asset.valuation.initial_valuation?.date ?? null,
          assetValuation:
            asset.valuation.initial_valuation?.details?.asset_valuation
              ?.value ?? null,
          totalInvestment:
            asset.valuation.initial_valuation?.details?.total_investment
              ?.value ?? null,
          tokenPrice:
            asset.valuation.initial_valuation?.details?.token_price?.value ??
            null,
          info: "?",
        },
      },

      priceDetails: {
        price: asset.financials.income.token_price?.value ?? null,
        annualReturn: asset.investment_info.annual_return?.value ?? null,
        projectedAnnualReturn:
          asset.investment_info.projected_annual_return?.value ?? null,
        rentalYield: 0, // TODO add value
        projectedRentalYield: 0, // TODO add value
        totalLiquidity: 0, // TODO add value
        tokensAvailable: 0, // TODO add value
        tokensUsed: 0, // TODO add value
      },

      otc: {
        buying: [],
        selling: [],
      },
      tradingHistory: [],
    },
  };
}