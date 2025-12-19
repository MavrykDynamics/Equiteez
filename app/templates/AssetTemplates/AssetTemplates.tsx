import { Table } from "~/lib/atoms/Table/Table";
import { TableDescription } from "~/lib/atoms/Table/TableDescription";
import { TableHeader } from "~/lib/atoms/Table/TableHeader";
import { TableItem } from "~/lib/atoms/Table/TableItem";
import { LocationMap } from "../LocationMap/LocationMap";
import { Spacer } from "~/lib/atoms/Spacer";
import { FC } from "react";
import { EstateType } from "~/providers/MarketsProvider/market.types";
import Money from "~/lib/atoms/Money";
import { HashChip } from "~/lib/molecules/HashChip";
import { assetIconBasedOnKey } from "~/templates/IconsBlock";
import styles from "./styles.module.css";
// TODO update templates based on API data (no API data at the moment)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SharedAssetDetailsTemplate: FC<{ data: any }> = ({ data }) => {
  return (
    <Table className="bg-white">
      <TableHeader>Description</TableHeader>
      <TableDescription>{data.description}</TableDescription>
      <TableItem className={styles.detailsTableItem}>
        <p>Asset Type</p>
        <p>{data.assetType}</p>
      </TableItem>
      <TableItem className={styles.detailsTableItem}>
        <p>Full Address</p>
        <p>{data.fullAddress}</p>
      </TableItem>
      <TableItem className={styles.detailsTableItem}>
        <p>Country</p>
        <p>{data.country}</p>
      </TableItem>
      <TableItem className={styles.detailsTableItem}>
        <p>Neighborhood</p>
        <p>{data.neighborhood}</p>
      </TableItem>
      <TableItem className={styles.detailsTableItem}>
        <p>Rental Type</p>
        <p>{data.rentaltype}</p>
      </TableItem>
      <TableItem className={styles.detailsTableItem}>
        <div className="flex items-center gap-x-1">
          Rented?
          {/* <InfoTooltip content={"Rented"} /> */}
        </div>
        <p>{data.rented}</p>
      </TableItem>
      <TableItem className={styles.detailsTableItem}>
        <div className="flex items-center gap-x-1">
          Rent Subsidy?
          {/* <InfoTooltip content={"Rent Subsidy?"} /> */}
        </div>
        <p>{data.rentSubsidy}</p>
      </TableItem>
      <TableItem className={styles.detailsTableItem}>
        <p>Asset Manager</p>

        <p>
          <HashChip
            hash={data.assetManager}
            className="underline font-semibold"
            trim={false}
          />
        </p>
      </TableItem>
      <TableItem className={styles.detailsTableItem} isLast>
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
export const BitCoinMinersTemplate: FC<{ data: any; basicInfo: any }> = ({
  data,
  basicInfo,
}) => {
  return (
    <div>
      <Table className="bg-white">
        <TableHeader>Description</TableHeader>
        <TableDescription>{data.description}</TableDescription>
        <TableItem className={styles.detailsTableItem}>
          <p>Location</p>
          <p>{data.location}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Full Address</p>
          <p>{data.fullAddress}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Capacity</p>
          <p>{data.capacity}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Mining Hardware</p>
          <p>{data.miningHardware}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Model</p>
          <p>{data.model}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Hashrate</p>
          <p>{data.hashRate}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Power Consumption</p>
          <p>{data.powerConsumption}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Efficiency</p>
          <p>{data.efficiency}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Energy Source</p>
          <p>{data.energySource}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Energy Cost</p>
          <p>{data.energyCost}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Cost Of Electricity</p>
          <p>{data.electricityCost}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Daily Production</p>
          <p>{data.dailyProduction}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Redundancy</p>
          <p>{data.redundancy}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Connectivity</p>
          <p>{data.connectivity}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Power Source</p>
          <p>{data.powerSource}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Cooling</p>
          <p>{data.cooling}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem} isLast>
          <p>Security</p>
          <p>{data.security}</p>
        </TableItem>
      </Table>
      <Spacer height={32} />
      <IconsDetailsTemplate basicInfo={basicInfo} />
      <Table className="bg-white">
        <LocationMap />
      </Table>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ResortTemplate: FC<{ data: any; basicInfo: any }> = ({
  data,
  basicInfo,
}) => {
  return (
    <div>
      <Table className="bg-white">
        <TableHeader>Description</TableHeader>
        <TableDescription>{data.description}</TableDescription>
        <TableItem className={styles.detailsTableItem}>
          <p>Location</p>
          <p>{data.location}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Full Address</p>
          <p>{data.fullAddress}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Room Design</p>
          <p>{data.roomDesign}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Dining</p>
          <p>{data.dining}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Spa</p>
          <p>{data.spa}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Wellness Activities</p>
          <p>{data.activities}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Exclusive Beach Access</p>
          <p>{data.beachAccsess}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Views</p>
          <p>{data.views}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Recreation</p>
          <p>{data.recreation}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Watersports</p>
          <p className="whitespace-pre-wrap text-right">{data.watersports}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Atmosphere</p>
          <p>{data.atmosphere}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem} isLast>
          <p>Adventure</p>
          <p>{data.adventure}</p>
        </TableItem>
      </Table>
      <Spacer height={32} />
      <IconsDetailsTemplate basicInfo={basicInfo} />
      <Table className="bg-white">
        <LocationMap />
      </Table>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HotelTemplate: FC<{ data: any; basicInfo: any }> = ({
  data,
  basicInfo,
}) => {
  return (
    <div>
      <Table className="bg-white">
        <TableHeader>Description</TableHeader>
        <TableDescription>{data.description}</TableDescription>
        <TableItem className={styles.detailsTableItem}>
          <p>Name</p>
          <p>{data.name}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Location</p>
          <p>{data.location}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Address</p>
          <p className="whitespace-pre-wrap text-right">{data.fullAddress}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Number of Rooms</p>
          <p>{data.rooms}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Room Sizes</p>
          <p>{data.roomSizes}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Restauarant Capacity</p>
          <p>{data.capacity}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Conference Facilities</p>
          <p>{data.conferenceFacilities}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Amenities</p>
          <p>{data.amenities}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Additional Facilities</p>
          <p>{data.additionalFacilities}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Land Size</p>
          <p>{data.landSize}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem} isLast>
          <p>Natural Features</p>
          <p className="whitespace-pre-wrap text-right">{data.natural}</p>
        </TableItem>
      </Table>
      <Spacer height={32} />
      <IconsDetailsTemplate basicInfo={basicInfo} />
      <Table className="bg-white">
        <LocationMap />
      </Table>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DebtTemplate: FC<{ data: any; basicInfo: any }> = ({
  data,
  basicInfo,
}) => {
  return (
    <div>
      <Table className="bg-white">
        <TableHeader>Description</TableHeader>
        <TableDescription>{data.description}</TableDescription>
        <TableItem className={styles.detailsTableItem}>
          <p>Total Value</p>
          <p>{data.totalValue}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Total Mortagages</p>
          <p>{data.totalMortgages}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Geographic Focus</p>
          <p>{data.regions}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Loan Types</p>
          <p>{data.loanTypes}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Borrowed Profile</p>
          <p>{data.borrowedProfile}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Underwriting</p>
          <p>{data.underwriting}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Loan-to-Value (LTV) Ratio</p>
          <p>{data.ltvRatio}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Borrower Credit Quality</p>
          <p>{data.creditQuality}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Yield</p>
          <p>{data.yield}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Investment Opportunity</p>
          <p>{data.investmentOpportunity}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Investment Risk</p>
          <p>{data.investmentRisk}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem} isLast>
          <p>Liquidity</p>
          <p>{data.liquidity}</p>
        </TableItem>
      </Table>
      <Spacer height={32} />
      <IconsDetailsTemplate basicInfo={basicInfo} />
      <Table className="bg-white">
        <LocationMap />
      </Table>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TreasuriesTemplate: FC<{ data: any; basicInfo: any }> = ({
  data,
  basicInfo,
}) => {
  return (
    <div>
      <Table className="bg-white">
        <TableHeader>Description</TableHeader>
        <TableDescription>{data.description}</TableDescription>
        <TableItem className={styles.detailsTableItem}>
          <p>Face Value</p>
          <p>{data.faceValue}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Type</p>
          <p>{data.bondType}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Maturity</p>
          <p>{data.maturity}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Issuer</p>
          <p>{data.issuer}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Coupon Rate (Yield)</p>
          <p>{data.couponRate}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Payment Frequency</p>
          <p>{data.paymentFrequency}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Payment Dates</p>
          <p>{data.paymentDates}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Security</p>
          <p>{data.security}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Risk Level</p>
          <p>{data.riskLevel}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Liquidity</p>
          <p>{data.liquidity}</p>
        </TableItem>

        <TableItem className={styles.detailsTableItem} isLast>
          <p>Investor Suitability</p>
          <p>{data.investorSuitability}</p>
        </TableItem>
      </Table>
      <Spacer className="h-[16px] lg:h-[32px]" />
      <IconsDetailsTemplate basicInfo={basicInfo} />
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const InsuranceContractTemplate: FC<{ data: any; basicInfo: any }> = ({
  data,
  basicInfo,
}) => {
  return (
    <div>
      <SharedAssetDetailsTemplate data={data} />
      <Spacer height={32} />
      <IconsDetailsTemplate basicInfo={basicInfo} />
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CommoditiesTemplate: FC<{
  data: any;
  basicInfo: any;
}> = ({ data, basicInfo }) => {
  return (
    <>
      <Table className="bg-white">
        <TableHeader>Description</TableHeader>
        <TableDescription>{data.description}</TableDescription>
        <TableItem className={styles.detailsTableItem}>
          <p>Total Weight</p>
          <p>{data.totalWeight}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Storage</p>
          <p>{data.storage}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Insurance</p>
          <p>{data.insurance}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Standard</p>
          <p>{data.standart}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Market Value</p>
          <p>{data.marketValue}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Annual Appreciation</p>
          <p>{data.annualAppreciation}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Performance</p>
          <p>{data.performance}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Asset Type</p>
          <p>{data.assetType}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Liquidity</p>
          <p>{data.liquidity}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Market Demand</p>
          <p>{data.marketDemand}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Risk Profile</p>
          <p>{data.riskProfile}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Tax Treatment</p>
          <p>{data.taxTreatment}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem} isLast>
          <p>Storage & Security</p>
          <p>{data.security}</p>
        </TableItem>
      </Table>
      <Spacer height={32} />
      <IconsDetailsTemplate basicInfo={basicInfo} />
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MixedUseRealEstateTemplate: FC<{
  data: any;
  basicInfo: any;
}> = ({ data, basicInfo }) => {
  return (
    <div>
      <Table className="bg-white">
        <TableHeader>Description</TableHeader>
        <TableDescription>{data.description}</TableDescription>
        <TableItem className={styles.detailsTableItem}>
          <p>Building Name</p>
          <p>{data.name}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Country</p>
          <p>{data.country}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Neighborhood</p>
          <p>{data.neighborhood}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Type</p>
          <p>{data.type}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Size</p>
          <p>
            <Money>{data.size}</Money> sqft
          </p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Height</p>
          <p>{data.height}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Key Features</p>
          <p className="whitespace-pre-wrap text-right">{data.keyFeatures}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Current Occupancy</p>
          <p>{data.occupancy}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Annual Returns</p>
          <p>{data.annualReturns}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Amenities</p>
          <p>{data.amenities}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Ideal For</p>
          <p>{data.idealFor}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem} isLast>
          <p>Parking</p>
          <p>{data.parking}</p>
        </TableItem>
      </Table>
      <Spacer height={32} />
      <IconsDetailsTemplate basicInfo={basicInfo} />
      <LocationMap />
    </div>
  );
};

export const IconsDetailsTemplate: FC<{
  basicInfo: EstateType["assetDetails"]["basicInfo"];
}> = ({ basicInfo }) => {
  if (!basicInfo || !Object.values(basicInfo).filter(Boolean).length)
    return null;

  return (
    <>
      <Table className="bg-white">
        <TableHeader>What&apos;s In </TableHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-8">
          {Object.entries(basicInfo)
            .filter(([key, value]) => value)
            .map(([key, value]) => {
              const Icon = assetIconBasedOnKey[key];
              return (
                <div
                  key={key}
                  className="w-[192px] flex gap-[8px] mt-4 lg:mt-0"
                >
                  <Icon className="w-[24px] h-[24px] text-[var(--color-yellow-500)]" />
                  <span>{value}</span>
                </div>
              );
            })}
        </div>
      </Table>
      <Spacer height={32} />
    </>
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
        <TableHeader>Description</TableHeader>
        <TableDescription>{propertyDetails.description}</TableDescription>
        <TableItem className={styles.detailsTableItem}>
          <p>Asset Type</p>
          <p className="capitalize">{propertyDetails.propertyType}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Full Address</p>
          <p>{propertyDetails.fullAddress}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Country</p>
          <p>{propertyDetails.country}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Neighborhood</p>
          <p>Hubbell - Lyndon</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Rental Type</p>
          <p>{propertyDetails.rentalType}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <div className="flex items-center gap-x-1">
            Rented?
            {/* <InfoTooltip content={"Rented"} /> */}
          </div>
          <p>{propertyDetails.rented}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <div className="flex items-center gap-x-1">
            Rent Subsidy?
            {/* <InfoTooltip content={"Rent Subsidy?"} /> */}
          </div>
          <p>{propertyDetails.rentSubsidy}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem}>
          <p>Property Manager</p>

          <p>{propertyDetails.propertyManager}</p>
        </TableItem>
        <TableItem className={styles.detailsTableItem} isLast>
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

          <p className="flex gap-1">
            <Money>{buildingInfo.lotSize}</Money>{" "}
            <span className="normal-case">sqft</span>
          </p>
        </TableItem>
        <TableItem>
          <p>
            Interior Size (<span className="normal-case">sqft</span>)
          </p>
          <p className="flex gap-1">
            <Money>{buildingInfo.interiorSize}</Money>{" "}
            <span className="normal-case">sqft</span>
          </p>
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
