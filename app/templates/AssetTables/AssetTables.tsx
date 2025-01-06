import { Table } from "~/lib/atoms/Table/Table";
import { TableDescription } from "~/lib/atoms/Table/TableDescription";
import { TableHeader } from "~/lib/atoms/Table/TableHeader";
import { TableItem } from "~/lib/atoms/Table/TableItem";
import { LocationMap } from "../LocationMap/LocationMap";
import { Spacer } from "~/lib/atoms/Spacer";
import { FC } from "react";
import { InfoTooltip } from "~/lib/organisms/InfoTooltip";
import Money from "~/lib/atoms/Money";

// TODO update templates based on API data (no API data at the moment)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SharedAssetDetailsTemplate: FC<{ data: any }> = ({ data }) => {
  return (
    <Table className="bg-white">
      <TableHeader>About</TableHeader>
      <TableDescription>{data.description}</TableDescription>
      <TableItem>
        <p>Property Type</p>
        <p>{data.propertyType}</p>
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
        <p>Hubbell - Lyndon</p>
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
        <p>{data.propertyManager}</p>
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
        <p>{data.stories} stories</p>
      </TableItem>
      <TableItem>
        <p>
          Lot Size (<span className="normal-case">sqft</span>)
        </p>

        <div className="flex gap-1">
          <Money>{data.lotSize}</Money>{" "}
          <span className="normal-case">sqft</span>
        </div>
      </TableItem>
      <TableItem>
        <p>
          Interior Size (<span className="normal-case">sqft</span>)
        </p>
        <div className="flex gap-1">
          <Money>{data.interiorSize}</Money>{" "}
          <span className="normal-case">sqft</span>
        </div>
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
          <p>{data.propertyType}</p>
        </TableItem>
        <TableItem>
          <p>Full Address</p>
          <p>{data.fullAddress}</p>
        </TableItem>
        <TableItem>
          <p>Capacity</p>
          <p>{data.country}</p>
        </TableItem>
        <TableItem>
          <p>Mining Hardware</p>
          <p>Hubbell - Lyndon</p>
        </TableItem>
        <TableItem>
          <p>Model</p>
          <p>{data.rentalType}</p>
        </TableItem>
        <TableItem>
          <p>Hashrate</p>
          <p>{data.rented}</p>
        </TableItem>
        <TableItem>
          <p>Power Consumption</p>
          <p>{data.rentSubsidy}</p>
        </TableItem>
        <TableItem>
          <p>Efficiency</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Energy Source</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Energy Cost</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Cost Of Electricity</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Daily Production</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Redundancy</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Connectivity</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Power Source</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Cooling</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem isLast>
          <p>Security</p>
          <p>{data.propertyManager}</p>
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
  return (
    <div>
      <Table className="bg-white">
        <TableHeader>About</TableHeader>
        <TableDescription>{data.description}</TableDescription>
        <TableItem>
          <p>Location</p>
          <p>{data.propertyType}</p>
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
          <p>Hubbell - Lyndon</p>
        </TableItem>
        <TableItem>
          <p>Spa</p>
          <p>{data.rentalType}</p>
        </TableItem>
        <TableItem>
          <p>Wellness Activities</p>
          <p>{data.rented}</p>
        </TableItem>
        <TableItem>
          <p>Exclusive Beach Access</p>
          <p>{data.rentSubsidy}</p>
        </TableItem>
        <TableItem>
          <p>Views</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Recreation</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Watersports</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Atmosphere</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem isLast>
          <p>Adventure</p>
          <p>{data.propertyManager}</p>
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
          <p>{data.propertyType}</p>
        </TableItem>
        <TableItem>
          <p>Properties</p>
          <p>{data.fullAddress}</p>
        </TableItem>
        <TableItem>
          <p>LTV Ratio</p>
          <p>{data.roomDesign}</p>
        </TableItem>
        <TableItem>
          <p>Yield</p>
          <p>Hubbell - Lyndon</p>
        </TableItem>
        <TableItem>
          <p>Borrowed Profile</p>
          <p>{data.rentalType}</p>
        </TableItem>
        <TableItem>
          <p>Underwriting</p>
          <p>{data.rented}</p>
        </TableItem>
        <TableItem>
          <p>Regions Covered</p>
          <p>{data.rentSubsidy}</p>
        </TableItem>
        <TableItem>
          <p>Loan Types</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Investment Risk</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem isLast>
          <p>Liquidity</p>
          <p>{data.propertyManager}</p>
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
          <p>{data.fullAddress}</p>
        </TableItem>
        <TableItem>
          <p>Issuer</p>
          <p>{data.roomDesign}</p>
        </TableItem>
        <TableItem>
          <p>Yield</p>
          <p>Hubbell - Lyndon</p>
        </TableItem>
        <TableItem>
          <p>Payment Frequency</p>
          <p>{data.rentalType}</p>
        </TableItem>
        <TableItem>
          <p>Bond Type</p>
          <p>{data.rented}</p>
        </TableItem>
        <TableItem>
          <p>Security</p>
          <p>{data.rentSubsidy}</p>
        </TableItem>
        <TableItem>
          <p>Market Price</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Risk Level</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Investor Suitability</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Capital Preservation</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Interest Rate</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Liquidity</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Tax Treatment</p>
          <p>{data.propertyManager}</p>
        </TableItem>
        <TableItem isLast>
          <p>Current Demand</p>
          <p>{data.propertyManager}</p>
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
