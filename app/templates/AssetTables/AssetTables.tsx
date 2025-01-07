import { Table } from "~/lib/atoms/Table/Table";
import { TableDescription } from "~/lib/atoms/Table/TableDescription";
import { TableHeader } from "~/lib/atoms/Table/TableHeader";
import { TableItem } from "~/lib/atoms/Table/TableItem";
import { LocationMap } from "../LocationMap/LocationMap";
import { Spacer } from "~/lib/atoms/Spacer";
import { FC } from "react";
import { InfoTooltip } from "~/lib/organisms/InfoTooltip";
import { EstateType } from "~/providers/EstatesProvider/estates.types";
import Money from "~/lib/atoms/Money";

// TODO update templates based on API data (no API data at the moment)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SharedAssetDetailsTemplate: FC<{ data: any }> = ({ data }) => {
  return (
    <Table className="bg-white">
      <TableHeader>About</TableHeader>
      <TableDescription>{data.description}</TableDescription>
      <TableItem>
        <p>Asset Type</p>
        <p>{data.assetType}</p>
      </TableItem>
      <TableItem>
        <p>Full Address</p>
        <p>{data.fullAddress}</p>
      </TableItem>
      <TableItem>
        <p>Country</p>
        <p>{data.country}</p>
      </TableItem>
      <TableItem>
        <p>Neighborhood</p>
        <p>{data.neighborhood}</p>
      </TableItem>
      <TableItem>
        <p>Rental Type</p>
        <p>{data.rentalType}</p>
      </TableItem>
      <TableItem>
        <div className="flex items-center gap-x-1">
          Rented? <InfoTooltip content={"Rented"} />
        </div>
        <p>{data.rented}</p>
      </TableItem>
      <TableItem>
        <div className="flex items-center gap-x-1">
          Rent Subsidy?
          <InfoTooltip content={"Rent Subsidy?"} />
        </div>
        <p>{data.rentSubsidy}</p>
      </TableItem>
      <TableItem>
        <p>Asset Manager</p>
        <p>{data.assetManager}</p>
      </TableItem>
      <TableItem isLast>
        <p>Parking</p>
        <p>{data.parking}</p>
      </TableItem>
    </Table>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SharedAssetBuildingInfoTemplate: FC<{ data: any }> = ({
  data,
}) => {
  return (
    <Table className="bg-white">
      <TableHeader>Building Info</TableHeader>
      <TableItem>
        <p>Stories</p>
        <p>{data.stories}</p>
      </TableItem>
      <TableItem>
        <p>
          Lot Size (<span className="normal-case">sqft</span>)
        </p>

        <div className="flex gap-1">{data.lotSize}</div>
      </TableItem>
      <TableItem>
        <p>
          Interior Size (<span className="normal-case">sqft</span>)
        </p>
        <p>{data.interiorSize}</p>
      </TableItem>
      <TableItem>
        <p>Building Class</p>
        <p>{data.buildingClass}</p>
      </TableItem>
      <TableItem>
        <p>Foundation</p>
        <p>{data.foundation}</p>
      </TableItem>
      <TableItem>
        <p>Exterior Walls</p>
        <p>{data.exteriorWalls}</p>
      </TableItem>
      <TableItem>
        <p>Roof Type</p>
        <p>{data.roofType}</p>
      </TableItem>
      <TableItem>
        <p>Heating</p>
        <p>{data.heating}</p>
      </TableItem>
      <TableItem>
        <p>Cooling</p>
        <p>{data.cooling}</p>
      </TableItem>
      <TableItem isLast>
        <p>Renovated</p>
        <p>{data.renovated}</p>
      </TableItem>
    </Table>
  );
};

// --------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BitCoinMinersTemplate: FC<{ data: any }> = ({ data }) => {
  return (
    <div>
      <Table className="bg-white">
        <TableHeader>About</TableHeader>
        <TableDescription>{data.description}</TableDescription>
        <TableItem>
          <p>Location</p>
          <p>{data.location}</p>
        </TableItem>
        <TableItem>
          <p>Full Address</p>
          <p>{data.fullAddress}</p>
        </TableItem>
        <TableItem>
          <p>Capacity</p>
          <p>{data.capacity}</p>
        </TableItem>
        <TableItem>
          <p>Mining Hardware</p>
          <p>{data.miningHardware}</p>
        </TableItem>
        <TableItem>
          <p>Model</p>
          <p>{data.model}</p>
        </TableItem>
        <TableItem>
          <p>Hashrate</p>
          <p>{data.hashRate}</p>
        </TableItem>
        <TableItem>
          <p>Power Consumption</p>
          <p>{data.powerConsumption}</p>
        </TableItem>
        <TableItem>
          <p>Efficiency</p>
          <p>{data.efficiency}</p>
        </TableItem>
        <TableItem>
          <p>Energy Source</p>
          <p>{data.energySource}</p>
        </TableItem>
        <TableItem>
          <p>Energy Cost</p>
          <p>{data.energyCost}</p>
        </TableItem>
        <TableItem>
          <p>Cost Of Electricity</p>
          <p>{data.electricityCost}</p>
        </TableItem>
        <TableItem>
          <p>Daily Production</p>
          <p>{data.dailyProduction}</p>
        </TableItem>
        <TableItem>
          <p>Redundancy</p>
          <p>{data.redundancy}</p>
        </TableItem>
        <TableItem>
          <p>Connectivity</p>
          <p>{data.connectivity}</p>
        </TableItem>
        <TableItem>
          <p>Power Source</p>
          <p>{data.powerSource}</p>
        </TableItem>
        <TableItem>
          <p>Cooling</p>
          <p>{data.cooling}</p>
        </TableItem>
        <TableItem isLast>
          <p>Security</p>
          <p>{data.security}</p>
        </TableItem>
      </Table>
      <Spacer height={32} />
      <Table className="bg-white">
        <LocationMap />
      </Table>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ResortTemplate: FC<{ data: any }> = ({ data }) => {
  return (
    <div>
      <Table className="bg-white">
        <TableHeader>About</TableHeader>
        <TableDescription>{data.description}</TableDescription>
        <TableItem>
          <p>Location</p>
          <p>{data.location}</p>
        </TableItem>
        <TableItem>
          <p>Full Address</p>
          <p>{data.fullAddress}</p>
        </TableItem>
        <TableItem>
          <p>Room Design</p>
          <p>{data.roomDesign}</p>
        </TableItem>
        <TableItem>
          <p>Dining</p>
          <p>{data.dining}</p>
        </TableItem>
        <TableItem>
          <p>Spa</p>
          <p>{data.spa}</p>
        </TableItem>
        <TableItem>
          <p>Wellness Activities</p>
          <p>{data.activities}</p>
        </TableItem>
        <TableItem>
          <p>Exclusive Beach Access</p>
          <p>{data.beachAccsess}</p>
        </TableItem>
        <TableItem>
          <p>Views</p>
          <p>{data.views}</p>
        </TableItem>
        <TableItem>
          <p>Recreation</p>
          <p>{data.recreation}</p>
        </TableItem>
        <TableItem>
          <p>Watersports</p>
          <p className="whitespace-pre-wrap max-w-[50%]">{data.watersports}</p>
        </TableItem>
        <TableItem>
          <p>Atmosphere</p>
          <p>{data.atmosphere}</p>
        </TableItem>
        <TableItem isLast>
          <p>Adventure</p>
          <p>{data.adventure}</p>
        </TableItem>
      </Table>
      <Spacer height={32} />
      <Table className="bg-white">
        <LocationMap />
      </Table>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HotelTemplate: FC<{ data: any }> = ({ data }) => {
  // pass name
  return (
    <div>
      <Table className="bg-white">
        <TableHeader>About</TableHeader>
        <TableDescription>{data.description}</TableDescription>
        <TableItem>
          <p>Name</p>
          <p>{data.name}</p>
        </TableItem>
        <TableItem>
          <p>Location</p>
          <p>{data.location}</p>
        </TableItem>
        <TableItem>
          <p>Address</p>
          <p>{data.fullAddress}</p>
        </TableItem>
        <TableItem>
          <p>Number of Rooms</p>
          <p>{data.rooms}</p>
        </TableItem>
        <TableItem>
          <p>Room Sizes</p>
          <p>{data.roomSizes}</p>
        </TableItem>
        <TableItem>
          <p>Restauarant Capacity</p>
          <p>{data.capacity}</p>
        </TableItem>
        <TableItem>
          <p>Conference Facilities</p>
          <p>{data.conferenceFacilities}</p>
        </TableItem>
        <TableItem>
          <p>Amenities</p>
          <p>{data.amenities}</p>
        </TableItem>
        <TableItem>
          <p>Additional Facilities</p>
          <p>{data.additionalFacilities}</p>
        </TableItem>
        <TableItem>
          <p>Land Size</p>
          <p>{data.landSize}</p>
        </TableItem>
        <TableItem isLast>
          <p>Natural Features</p>
          <p>{data.natural}</p>
        </TableItem>
      </Table>
      <Spacer height={32} />
      <Table className="bg-white">
        <LocationMap />
      </Table>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DebtTemplate: FC<{ data: any }> = ({ data }) => {
  return (
    <div>
      <Table className="bg-white">
        <TableHeader>About</TableHeader>
        <TableDescription>{data.description}</TableDescription>
        <TableItem>
          <p>Total Value</p>
          <p>{data.totalValue}</p>
        </TableItem>
        <TableItem>
          <p>Properties</p>
          <p>{data.fullpropertiesAddress}</p>
        </TableItem>
        <TableItem>
          <p>LTV Ratio</p>
          <p>{data.ltvRatio}</p>
        </TableItem>
        <TableItem>
          <p>Yield</p>
          <p>{data.yield}</p>
        </TableItem>
        <TableItem>
          <p>Borrowed Profile</p>
          <p>{data.borrowedProfile}</p>
        </TableItem>
        <TableItem>
          <p>Underwriting</p>
          <p>{data.underwriting}</p>
        </TableItem>
        <TableItem>
          <p>Regions Covered</p>
          <p>{data.regions}</p>
        </TableItem>
        <TableItem>
          <p>Loan Types</p>
          <p>{data.loanTypes}</p>
        </TableItem>
        <TableItem>
          <p>Investment Risk</p>
          <p>{data.investmentRisk}</p>
        </TableItem>
        <TableItem isLast>
          <p>Liquidity</p>
          <p>{data.liquidity}</p>
        </TableItem>
      </Table>
      <Spacer height={32} />
      <Table className="bg-white">
        <LocationMap />
      </Table>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TreasuriesTemplate: FC<{ data: any }> = ({ data }) => {
  return (
    <div>
      <Table className="bg-white">
        <TableHeader>About</TableHeader>
        <TableDescription>{data.description}</TableDescription>
        <TableItem>
          <p>Face Value</p>
          <p>{data.propertyType}</p>
        </TableItem>
        <TableItem>
          <p>Maturity</p>
          <p>{data.maturity}</p>
        </TableItem>
        <TableItem>
          <p>Issuer</p>
          <p>{data.issuer}</p>
        </TableItem>
        <TableItem>
          <p>Yield</p>
          <p>{data.yield}</p>
        </TableItem>
        <TableItem>
          <p>Payment Frequency</p>
          <p>{data.paymentFrequency}</p>
        </TableItem>
        <TableItem>
          <p>Bond Type</p>
          <p>{data.bondType}</p>
        </TableItem>
        <TableItem>
          <p>Security</p>
          <p>{data.security}</p>
        </TableItem>
        <TableItem>
          <p>Market Price</p>
          <p>{data.marketPrice}</p>
        </TableItem>
        <TableItem>
          <p>Risk Level</p>
          <p>{data.riskLevel}</p>
        </TableItem>
        <TableItem>
          <p>Investor Suitability</p>
          <p>{data.investorSuitability}</p>
        </TableItem>
        <TableItem>
          <p>Capital Preservation</p>
          <p>{data.capitalPreservation}</p>
        </TableItem>
        <TableItem>
          <p>Interest Rate</p>
          <p>{data.interestRate}</p>
        </TableItem>
        <TableItem>
          <p>Liquidity</p>
          <p>{data.liquidity}</p>
        </TableItem>
        <TableItem>
          <p>Tax Treatment</p>
          <p>{data.taxTreatment}</p>
        </TableItem>
        <TableItem isLast>
          <p>Current Demand</p>
          <p>{data.currentDemand}</p>
        </TableItem>
      </Table>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const InsuranceContractTemplate: FC<{ data: any }> = ({ data }) => {
  return (
    <div>
      <SharedAssetDetailsTemplate data={data} />
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CommoditiesTemplate: FC<{ data: any }> = ({ data }) => {
  return (
    <div>
      <SharedAssetDetailsTemplate data={data} />
      <Spacer height={32} />
      <SharedAssetBuildingInfoTemplate data={data} />
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MixedUseRealEstateTemplate: FC<{ data: any }> = ({ data }) => {
  return (
    <div>
      <SharedAssetDetailsTemplate data={data} />
      <Spacer height={32} />
      <SharedAssetBuildingInfoTemplate data={data} />
      <Spacer height={32} />
      <LocationMap />
    </div>
  );
};

// DEFAULT secondary market TEMPLATE

export const DefaultAssetDetailsTemplate: FC<{
  propertyDetails: EstateType["assetDetails"]["propertyDetails"];
  buildingInfo: EstateType["assetDetails"]["buildingInfo"];
}> = ({ propertyDetails, buildingInfo }) => {
  return (
    <>
      <Table className="bg-white">
        <TableHeader>About</TableHeader>
        <TableDescription>{propertyDetails.description}</TableDescription>
        <TableItem>
          <p>Property Type</p>
          <p>{propertyDetails.propertyType}</p>
        </TableItem>
        <TableItem>
          <p>Full Address</p>
          <p>{propertyDetails.fullAddress}</p>
        </TableItem>
        <TableItem>
          <p>Country</p>
          <p>{propertyDetails.country}</p>
        </TableItem>
        <TableItem>
          <p>Neighborhood</p>
          <p>Hubbell - Lyndon</p>
        </TableItem>
        <TableItem>
          <p>Rental Type</p>
          <p>{propertyDetails.rentalType}</p>
        </TableItem>
        <TableItem>
          <div className="flex items-center gap-x-1">
            Rented? <InfoTooltip content={"Rented"} />
          </div>
          <p>{propertyDetails.rented}</p>
        </TableItem>
        <TableItem>
          <div className="flex items-center gap-x-1">
            Rent Subsidy?
            <InfoTooltip content={"Rent Subsidy?"} />
          </div>
          <p>{propertyDetails.rentSubsidy}</p>
        </TableItem>
        <TableItem>
          <p>Property Manager</p>
          <p>{propertyDetails.propertyManager}</p>
        </TableItem>
        <TableItem isLast>
          <p>Parking</p>
          <p>{propertyDetails.parking}</p>
        </TableItem>
      </Table>
      <div className="mb-8" />
      <Table className="bg-white">
        <TableHeader>Building Info</TableHeader>
        <TableItem>
          <p>Stories</p>
          <p>{buildingInfo.stories} stories</p>
        </TableItem>
        <TableItem>
          <p>
            Lot Size (<span className="normal-case">sqft</span>)
          </p>

          <div className="flex gap-1">
            <Money>{buildingInfo.lotSize}</Money>{" "}
            <span className="normal-case">sqft</span>
          </div>
        </TableItem>
        <TableItem>
          <p>
            Interior Size (<span className="normal-case">sqft</span>)
          </p>
          <div className="flex gap-1">
            <Money>{buildingInfo.interiorSize}</Money>{" "}
            <span className="normal-case">sqft</span>
          </div>
        </TableItem>
        <TableItem>
          <p>Building Class</p>
          <p>{buildingInfo.buildingClass}</p>
        </TableItem>
        <TableItem>
          <p>Foundation</p>
          <p>{buildingInfo.foundation}</p>
        </TableItem>
        <TableItem>
          <p>Exterior Walls</p>
          <p>{buildingInfo.exteriorWalls}</p>
        </TableItem>
        <TableItem>
          <p>Roof Type</p>
          <p>{buildingInfo.roofType}</p>
        </TableItem>
        <TableItem>
          <p>Heating</p>
          <p>{buildingInfo.heating}</p>
        </TableItem>
        <TableItem>
          <p>Cooling</p>
          <p>{buildingInfo.cooling}</p>
        </TableItem>
        <TableItem isLast>
          <p>Renovated</p>
          <p>{buildingInfo.renovated}</p>
        </TableItem>
      </Table>
    </>
  );
};
