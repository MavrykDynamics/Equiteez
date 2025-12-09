import { ApiError } from "~/errors/error";
import primaryEstate from "./primaryEstate.mock.json";
import secondaryEstate from "./secondaryEstate.mock.json";
import { FullSchema } from "~/providers/MarketsProvider/markets.schema";
import { z } from "zod";

export type PrimaryEstate = (typeof primaryEstate)[0] & { slug: string };
export type SecondaryEstate = (typeof secondaryEstate)[0] & { slug: string };

export type EstateType = PrimaryEstate | SecondaryEstate;

export interface AssetUniversal {
  token_address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;

  assetType: string;

  assetDetails: {
    coordinates: {
      lat: number;
      lng: number;
    };

    APY: number;
    type: string;

    assetImages: string[];
    previewImage: string;

    basicInfo: {
      btcPrice: string;
      amount: string;
      rooms: string;
      sqft: string;
      rate: string;
      homes: string;
      baths: string;
      beds: string;
      bond: string;
      yield: string;
      tvl: string;
      coverage: string;
      policies: string;
      date: string;
    };

    propertyDetails: {
      description: string;
      propertyType: string;
      fullAddress?: string;
      shortAddress?: string;
      location?: string;
      name?: string;
      country?: string;
      state?: string;
      zipCode?: number;
      neighborhood?: string;
      type?: string;
      size?: string;
      height?: string;
      keyFeatures?: string;
      occupancy?: string;
      annualReturns?: string;
      amenities?: string;
      idealFor?: string;
      parking?: string;
      capacity?: string;
      miningHardware?: string;
      model?: string;
      hashRate?: string;
      powerConsumption?: string;
      efficiency?: string;
      energySource?: string;
      energyCost?: string;
      electricityCost?: string;
      dailyProduction?: string;
      redundancy?: string;
      connectivity?: string;
      powerSource?: string;
      cooling?: string;
      security?: string;
    };

    buildingInfo?: {
      stories: number;
      lotSize: number;
      interiorSize: number;
      buildingClass: string;
      foundation: string;
      exteriorWalls: string;
      roofType: string;
      heating: string;
      cooling: string;
      renovated: string;
    };

    neighborhood?: {
      description: string;
      coordinates: { lat: number; lng: number };
    };

    financials: {
      propertyFinancials: {
        grossRentYearly: number;
        grossRentMonthly: number;
        monthlyCosts: {
          costs: number;
          netReproperty: number;
          platform: number;
          expenses: number;
          taxes: number;
          insurance: number;
          utilities: string;
        };
        netRentMonthly: number;
        netRentYearly: number;
        totalInvestment: {
          total: number;
          underlyingAssetPrice: number;
          initialMaintenanceReserve: number;
        };
        expectedIncome: number;
      };
      expectedIncome: {
        income: number;
        incomePerTokenYearly: number;
        incomeStartDate: string;
        tokenPrice: number;
        totalTokens: number;
        description: string;
      };
    };

    blockchain: {
      name: string;
      identifier: string;
      totalTokens: number;
      assetIssuer: string;
      assetId: string;
    }[];

    offering: {
      offeringDate: string;
      offeringIssuer: string;
      minInvestmentAmount: number;
      maxInvestmentAmount: number;
      raisedAmount: number;
      offeringPercent: number;
    };

    valuation: {
      priorValuation: {
        date: string;
        assetValuation: number;
        annualChange: number;
        totalInvestment: number;
        capitalROI: number;
        tokenPrice: number;
        regDistributed: number;
        info: string;
      };
      initialValuation: {
        date: string;
        assetValuation: number;
        totalInvestment: number;
        tokenPrice: number;
        info: string;
      };
    };

    priceDetails: {
      price: number;
      annualReturn: number;
      projectedAnnualReturn: number;
      rentalYield: number;
      projectedRentalYield: number;
      totalLiquidity: number;
      tokensAvailable: number;
      tokensUsed: number;
    };

    tradingHistory: {
      x: string;
      y: number[];
    }[];

    otc: {
      buying: {
        seller: string;
        tokensForSale: number;
        price: number;
        totalValue: number;
      }[];
      selling: {
        seller: string;
        tokensForSale: number;
        price: number;
        totalValue: number;
      }[];
    };
  };
}

export type OrderbookConfigType = {
  address: string;
  rwaTokenAddress: string;
  currencies: { token: { address: string; token_id: number } }[];
};

export type MarketConfig = {
  orderbook: Map<string, OrderbookConfigType>;
};

export type MarketInternalStateType = {
  config: MarketConfig;
  markets: Map<string, EstateType>;
  sortedMarketAddresses: string[];
  isLoading: boolean;
};

export type AssetData = z.infer<typeof FullSchema>;

export type MarketContext = MarketInternalStateType & {
  marketAddresses: string[];
  orderbookAddresses: string[];
  marketsArr: EstateType[];
  activeMarket: EstateType | null;
  isLoading: boolean;
  isActiveMarketLoading: boolean;
  pickMarketByIdentifier: (slug: string) => EstateType | null;
  updateActiveMarketState: (slug: string) => void;
  validBaseTokens: StringRecord<boolean>;
  marketApiError: ApiError | null;
  pickers: {
    pickOrderbookContract: StringRecord<string>;
    pickOrderbookToken: StringRecord<string>;
    pickOrderbookContractQuoteToken: StringRecord<string>;
  };
};
