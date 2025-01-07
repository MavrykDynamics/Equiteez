/* eslint-disable react/no-unescaped-entities */
import { FC } from "react";

import { useEstatesContext } from "~/providers/EstatesProvider/estates.provider";
import { AssetDetailsMapBlock } from "./components/AssetDetailsMapBlock";
import { DefaultAssetDetailsTemplate } from "~/templates/AssetTables/AssetTables";
import { EstateType } from "~/providers/EstatesProvider/estates.types";

export const PropertyDetailsTab = () => {
  const { activeEstate } = useEstatesContext();

  return (
    <div>
      <DefaultAssetTemplate activeEstate={activeEstate} />
    </div>
  );
};

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
