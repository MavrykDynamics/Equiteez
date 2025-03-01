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
  const Template = useMemo(
    () =>
      (Boolean(activeMarket.assetType)
        ? pickTemplateBasedOnAssetType[activeMarket.assetType.toLowerCase()]
        : DefaultAssetTemplate) ?? DefaultAssetTemplate,
    [activeMarket.assetType]
  );

  const tempProps = useMemo(
    () => getTemplatePropsBasedOnAssetType(activeMarket),
    [activeMarket]
  );

  return <Template {...tempProps} />;
};

const getTemplatePropsBasedOnAssetType = (activeMarket: EstateType) => {
  if (!activeMarket.assetType) return { activeMarket };
  switch (activeMarket.assetType.toLowerCase()) {
    case BitcoinMiners:
    case Resort:
    case Debt:
    case Treasuries:
    case InsuranceContract:
    case Commodities:
    case MixedUseRealEstate:
      return {
        data: activeMarket.assetDetails.propertyDetails,
      };

    case Hotel:
      return {
        data: {
          ...activeMarket.assetDetails.propertyDetails,
          name: activeMarket.name,
        },
      };

    default:
      return { activeMarket };
  }
};
