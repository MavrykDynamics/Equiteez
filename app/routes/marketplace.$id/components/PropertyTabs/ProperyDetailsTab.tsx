/* eslint-disable react/no-unescaped-entities */
import { FC, useMemo } from "react";

import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { AssetDetailsMapBlock } from "./components/AssetDetailsMapBlock";
import { DefaultAssetDetailsTemplate } from "~/templates/AssetTemplates/AssetTemplates";
import { EstateType } from "~/providers/MarketsProvider/market.types";
import { Navigate } from "@remix-run/react";
import { pickTemplateBasedOnAssetType } from "~/templates/AssetTemplates";
import {
  BitcoinMiners,
  Commodities,
  Debt,
  Hotel,
  InsuranceContract,
  MixedUseRealEstate,
  Resort,
  Treasuries,
} from "~/consts/asset.const";

export const PropertyDetailsTab = () => {
  const { activeMarket } = useMarketsContext();

  if (!activeMarket) return <Navigate to="/marketplace" />;
  return (
    <div>
      <AssetDetailsTemplate activeMarket={activeMarket} />
    </div>
  );
};

// Default view fore real assets from API (MARS & OCEAN at the moment)
const DefaultAssetTemplate: FC<{ activeMarket: EstateType }> = ({
  activeMarket,
}) => {
  const {
    assetDetails: { buildingInfo, propertyDetails },
  } = activeMarket;

  return (
    <div>
      <DefaultAssetDetailsTemplate
        propertyDetails={propertyDetails}
        buildingInfo={buildingInfo}
      />
      <AssetDetailsMapBlock
        address={activeMarket.assetDetails.propertyDetails.fullAddress}
        coordinates={activeMarket.assetDetails.coordinates}
      />
    </div>
  );
};

/**
 *
 * Generic Template screen based on asset type
 * no types for now, cuz there isn't any API for asset types
 */
const AssetDetailsTemplate: FC<{ activeMarket: EstateType }> = ({
  activeMarket,
}) => {
  const assetTypeKey = activeMarket.assetType.trim().toLowerCase();
  const Template = useMemo(
    () =>
      (pickTemplateBasedOnAssetType[
        assetTypeKey as keyof typeof pickTemplateBasedOnAssetType
      ] ?? DefaultAssetTemplate) as FC<Record<string, unknown>>,
    [assetTypeKey]
  );

  const tempProps = useMemo(
    () => getTemplatePropsBasedOnAssetType(activeMarket),
    [activeMarket]
  );

  return <Template {...tempProps} />;
};

const getTemplatePropsBasedOnAssetType = (activeMarket: EstateType) => {
  const roiCalculatorData = getROICalculatorData(activeMarket);
  const assetTypeKey = activeMarket.assetType.trim().toLowerCase();

  if (!assetTypeKey) return { activeMarket };
  switch (assetTypeKey) {
    case BitcoinMiners:
    case Resort:
    case Debt:
    case Treasuries:
    case InsuranceContract:
    case Commodities:
    case MixedUseRealEstate:
      return {
        data: activeMarket.assetDetails.propertyDetails,
        basicInfo: activeMarket.assetDetails.basicInfo,
        roiCalculatorData,
      };

    case Hotel:
      return {
        data: {
          ...activeMarket.assetDetails.propertyDetails,
          name: activeMarket.name,
        },
        basicInfo: activeMarket.assetDetails.basicInfo,
        roiCalculatorData,
      };

    default:
      return {
        activeMarket,
        basicInfo: activeMarket.assetDetails.basicInfo,
      };
  }
};

const getROICalculatorData = (activeMarket: EstateType) => {
  const { assetDetails } = activeMarket;

  return {
    annualGrowth:
      assetDetails.priceDetails.projectedAnnualReturn ||
      assetDetails.valuation.priorValuation.annualChange ||
      assetDetails.APY,
    annualRentalYield:
      assetDetails.APY || assetDetails.priceDetails.projectedRentalYield,
    initialInvestment:
      assetDetails.valuation.priorValuation.totalInvestment ||
      assetDetails.financials.propertyFinancials.totalInvestment.total,
  };
};
