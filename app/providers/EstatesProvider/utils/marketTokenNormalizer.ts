import { EstateType } from "~/providers/EstatesProvider/estates.types";
import {
  MarketTokenAddressesQuery,
  MarketTokensQuery,
} from "~/utils/__generated__/graphql";

export const getMarketAddresses = (
  data: MarketTokenAddressesQuery
): string[] => {
  const { orderbook, dodo_mav } = data;

  const dodoMavAddresses = dodo_mav.map((item) => item.base_token.address);

  const orderbookddresses = orderbook
    .map((item) => item.rwa_token?.address)
    .filter((item) => item !== undefined);

  return [...new Set([...orderbookddresses, ...dodoMavAddresses])];
};

/**
 * @param data gql data res
 * @param estates mockjed estates, cuz api doesnt include all necessary info
 * @returns  estateType array with info about each market
 */
export const marketTokenNormalizer = (
  data: MarketTokensQuery["token"],
  estates: EstateType[]
): EstateType[] => {
  const normalizedTokens: EstateType[] = data.map((token) => {
    const mockedPart = estates.find((es) => es.token_address === token.address);

    const parsedTokenDetails = JSON.parse(token.token_metadata.assetDetails);
    const { propertyDetails } = parsedTokenDetails;

    let financials = parsedTokenDetails.financials;
    // TODO remove this condition, cuz there is a type in api data
    if (!financials) financials = parsedTokenDetails.fiancials;

    // token metadata
    const {
      metadata: {
        assets: [assetData],
        // source,
        // authors,
        // interfaces,
        // errors,
      },
    } = token;

    // details
    const { details, buildingInfo } = propertyDetails;

    // financial details
    const { propertyFinancials, expectedIncome } = financials;

    // another asset data
    const {
      // offering,
      valuations: { latest: latestValuation, initial: initialValuation },
    } = assetData.assetDetails;

    return {
      token_address: token.address,
      name: token.token_metadata.name,
      symbol: token.token_metadata.symbol,
      decimals: token.token_metadata.decimals,
      icon: token.token_metadata.icon,
      assetDetails: {
        coordinates: {
          // TODO
          lat: -53.747637,
          lng: 35.806237,
        },
        APY: 6.15, // TODO
        type: "Secondary Market",
        // assetImages: parsedTokenDetails.assetImages,
        // previewImage: parsedTokenDetails.assetImages[0],
        assetImages: mockedPart?.assetDetails.assetImages ?? [],
        previewImage: mockedPart?.assetDetails.assetImages[0] ?? "",
        basicInfo: {
          // empty
          // TODO
          beds: 1,
          baths: 3,
          sqft: 313,
          buildDate: "1973-06-08T09:20:37-03:00",
        },
        propertyDetails: {
          description: details.description,
          propertyType: details.propertyType,
          fullAddress: details.fullAddress,
          zipCode: details.zipcode,
          state: details.state,
          country: details.country,
          rentalType: details.rentalType,
          rented: details.rented,
          rentSubsidy: details.rentSubsidy,
          propertyManager: details.propertyManager,
          parking: details.parking,
        },
        buildingInfo: {
          stories: buildingInfo.stories,
          lotSize: buildingInfo.lotSize,
          interiorSize: buildingInfo.interiorSize,
          buildingClass: buildingInfo.buildingClass,
          foundation: buildingInfo.foundation,
          exteriorWalls: buildingInfo.exteriorWalls,
          roofType: buildingInfo.roofType,
          heating: buildingInfo.heating,
          cooling: buildingInfo.cooling,
          renovated: buildingInfo.renovated,
        },
        neighborhood: {
          description: details.neighborhood,
          coordinates: {
            // TODO no data
            lat: -71.759954,
            lng: 175.330033,
          },
        },
        financials: {
          propertyFinancials: {
            grossRentYearly: propertyFinancials.grossRentYearly,
            grossRentMonthly: propertyFinancials.grossRentMonthly,
            monthlyCosts: {
              ...mockedPart?.assetDetails.financials.propertyFinancials
                .monthlyCosts,
              costs: propertyFinancials.monthlyCosts,
              netReproperty: 48.62, // TODO no rest data
              platform: 15.67,
              expenses: 98,
              taxes: 128.61,
              insurance: 19.95,
              utilities: "Tenant-paid",
            },
            netRentMonthly: propertyFinancials.netRentMonthly,
            netRentYearly: propertyFinancials.netRentYearly,
            totalInvestment: {
              total: propertyFinancials.totalInvestment,
              underlyingAssetPrice: 41528.33,
              initialMaintenanceReserve: 2582.01,
            },
            expectedIncome: propertyFinancials.expectedIncome,
          },
          expectedIncome: {
            income: expectedIncome.expectedIncome,
            incomePerTokenYearly: expectedIncome.incomePerTokenYearly,
            incomeStartDate: "1991-03-24T08:50:10-03:00", // TODO other format -> incomeStartDate
            tokenPrice: 69.91,
            totalTokens: 1018,
            description:
              "Ipsum aliquip duis consectetur excepteur do elit ad esse aliquip. Laboris aliquip culpa exercitation consequat. Velit ut esse eu est qui pariatur fugiat nulla velit consectetur non anim. Deserunt laborum aliqua mollit est tempor cupidatat ut. Qui enim magna commodo proident dolor labore incididunt veniam aliquip.\r\n",
          },
        },
        blockchain: mockedPart?.assetDetails?.blockchain ?? [],
        offering: {
          // TODO no data
          offeringDate: "2014-07-15T05:09:25-03:00",
          offeringIssuer: "Equiteez",
          minInvestmentAmount: 64.56,
          maxInvestmentAmount: 97346.11,
          raisedAmount: 93503.12,
          offeringPercent: 89.73,
        },
        valuation: {
          priorValuation: {
            date: "2003-11-14T02:38:38-02:00", // vaulationDate bad format
            assetValuation: latestValuation.assetValuation,
            annualChange: latestValuation.annualChange,
            totalInvestment: latestValuation.totalInvestment,
            capitalROI: latestValuation.capitalROI,
            tokenPrice: latestValuation.tokenPrice,
            regDistributed: latestValuation.regDistributed,
            info: latestValuation.additionInfo,
          },
          initialValuation: {
            date: "2017-01-08T03:32:13-02:00", // TODO bad format
            assetValuation: initialValuation.assetValuation,
            totalInvestment: initialValuation.totalInvestment,
            tokenPrice: initialValuation.tokenPrice,
            info: initialValuation.additionInfo,
          },
        },
        priceDetails: {
          price: latestValuation.tokenPrice,
          annualReturn: 4.03,
          projectedAnnualReturn: 4.03,
          rentalYield: 28.43,
          projectedRentalYield: 28.43,
          totalLiquidity: 40.03,
          tokensAvailable: 548,
          tokensUsed: 500,
        },
        tradingHistory: [
          {
            x: "2018-10-07T03:30:00.000Z",
            y: [7301, 8231, 6359, 7902],
          },
          {
            x: "2018-10-08T03:30:00.000Z",
            y: [2627, 2927, 1763, 2049],
          },
          {
            x: "2018-10-09T03:30:00.000Z",
            y: [7165, 8259, 6587, 6678],
          },
          {
            x: "2018-10-10T03:30:00.000Z",
            y: [1616, 1921, 1547, 1744],
          },
          {
            x: "2018-10-11T03:30:00.000Z",
            y: [6455, 7845, 5804, 6120],
          },
          {
            x: "2018-10-12T03:30:00.000Z",
            y: [9673, 10491, 8207, 9345],
          },
          {
            x: "2018-10-13T03:30:00.000Z",
            y: [6227, 6717, 5953, 5747],
          },
          {
            x: "2018-10-14T03:30:00.000Z",
            y: [6129, 7215, 5915, 6226],
          },
          {
            x: "2018-10-15T03:30:00.000Z",
            y: [3831, 4619, 2844, 3407],
          },
          {
            x: "2018-10-16T03:30:00.000Z",
            y: [9786, 10735, 9323, 9337],
          },
          {
            x: "2018-10-17T03:30:00.000Z",
            y: [2140, 3014, 1231, 2870],
          },
          {
            x: "2018-10-18T03:30:00.000Z",
            y: [5229, 5385, 4721, 5631],
          },
          {
            x: "2018-10-19T03:30:00.000Z",
            y: [3310, 4630, 2661, 3030],
          },
          {
            x: "2018-10-20T03:30:00.000Z",
            y: [3226, 4570, 1962, 3869],
          },
          {
            x: "2018-10-21T03:30:00.000Z",
            y: [10088, 10405, 8966, 9964],
          },
          {
            x: "2018-10-22T03:30:00.000Z",
            y: [6337, 7030, 5040, 7038],
          },
          {
            x: "2018-10-23T03:30:00.000Z",
            y: [7123, 7834, 6853, 7455],
          },
          {
            x: "2018-10-24T03:30:00.000Z",
            y: [2152, 3596, 1221, 2804],
          },
          {
            x: "2018-10-25T03:30:00.000Z",
            y: [2284, 3459, 1705, 2920],
          },
          {
            x: "2018-10-26T03:30:00.000Z",
            y: [8051, 9265, 7287, 8414],
          },
        ],
        otc: {
          buying: [
            {
              seller: "Linda Martinez",
              tokensForSale: 89.97,
              price: 328.63,
              totalValue: 19060.23,
            },
            {
              seller: "Marvin McKinney",
              tokensForSale: 124.67,
              price: 306.22,
              totalValue: 22062.21,
            },
            {
              seller: "Savannah Nguyen",
              tokensForSale: 288.41,
              price: 330.2,
              totalValue: 25499.78,
            },
            {
              seller: "Cody Fisher",
              tokensForSale: 98.95,
              price: 305.89,
              totalValue: 19237.4,
            },
            {
              seller: "John Doe",
              tokensForSale: 86.64,
              price: 197.93,
              totalValue: 11471.26,
            },
          ],
          selling: [
            {
              seller: "David Wilson",
              tokensForSale: 164.03,
              price: 242.67,
              totalValue: 33581.1,
            },
            {
              seller: "Alice Johnson",
              tokensForSale: 231.86,
              price: 326.6,
              totalValue: 37321.63,
            },
            {
              seller: "James Anderson",
              tokensForSale: 196.05,
              price: 93.23,
              totalValue: 34120.11,
            },
            {
              seller: "Michael Brown",
              tokensForSale: 214.76,
              price: 183.09,
              totalValue: 26055.46,
            },
            {
              seller: "Savannah Nguyen",
              tokensForSale: 91.18,
              price: 252.33,
              totalValue: 24049.12,
            },
          ],
        },
      },
    };
  });

  return normalizedTokens;
};
