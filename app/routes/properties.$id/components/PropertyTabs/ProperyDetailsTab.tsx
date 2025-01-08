/* eslint-disable react/no-unescaped-entities */
import { FC, useMemo } from "react";

import { useEstatesContext } from "~/providers/EstatesProvider/estates.provider";
import { AssetDetailsMapBlock } from "./components/AssetDetailsMapBlock";
import { DefaultAssetDetailsTemplate } from "~/templates/AssetTemplates/AssetTemplates";
import { EstateType } from "~/providers/EstatesProvider/estates.types";
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
  const { activeEstate } = useEstatesContext();

  if (!activeEstate) return <Navigate to="/properties" />;
  return (
    <div>
      <AssetDetailsTemplate activeEstate={activeEstate} />
    </div>
  );
};

// Default view fore real assets from API (MARS & OCEAN at the moment)
const DefaultAssetTemplate: FC<{ activeEstate: EstateType }> = ({
  activeEstate,
}) => {
  const {
    assetDetails: { buildingInfo, propertyDetails },
  } = activeEstate;

  return (
    <div>
      <DefaultAssetDetailsTemplate
        propertyDetails={propertyDetails}
        buildingInfo={buildingInfo}
      />
      <AssetDetailsMapBlock
        address={activeEstate.assetDetails.propertyDetails.fullAddress}
        coordinates={activeEstate.assetDetails.coordinates}
      />
    </div>
  );
};

/**
 *
 * Generic Template screen based on asset type
 * no types for now, cuz there isn't any API for asset types
 */
const AssetDetailsTemplate: FC<{ activeEstate: EstateType }> = ({
  activeEstate,
}) => {
  const Template = useMemo(
    () =>
      (Boolean(activeEstate.assetType)
        ? pickTemplateBasedOnAssetType[activeEstate.assetType.toLowerCase()]
        : DefaultAssetTemplate) ?? DefaultAssetTemplate,
    [activeEstate.assetType]
  );

  const tempProps = useMemo(
    () => getTemplatePropsBasedOnAssetType(activeEstate),
    [activeEstate]
  );

  return <Template {...tempProps} />;
};

const getTemplatePropsBasedOnAssetType = (activeEstate: EstateType) => {
  if (!activeEstate.assetType) return { activeEstate };
  switch (activeEstate.assetType.toLowerCase()) {
    case BitcoinMiners:
    case Resort:
    case Debt:
    case Treasuries:
    case InsuranceContract:
      return {
        data: activeEstate.assetDetails.propertyDetails,
      };

    case Hotel:
      return {
        data: {
          ...activeEstate.assetDetails.propertyDetails,
          name: activeEstate.name,
        },
      };

    case Commodities:
    case MixedUseRealEstate:
      return {
        detailsData: activeEstate.assetDetails.propertyDetails,
        buildingData: activeEstate.assetDetails.buildingInfo,
      };
    default:
      return { activeEstate };
  }
};
