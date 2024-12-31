/* eslint-disable react/no-unescaped-entities */

// components
import { Table } from "~/lib/atoms/Table/Table";
import { TableDescription } from "~/lib/atoms/Table/TableDescription";
import { TableHeader } from "~/lib/atoms/Table/TableHeader";
import { TableItem } from "~/lib/atoms/Table/TableItem";

// Google maps

// styles
import { useEstatesContext } from "~/providers/EstatesProvider/estates.provider";
import { PropertyDetailsMap } from "../ProperyDetailsTab";

export const HotelDetailsTab = () => {
  const { activeEstate } = useEstatesContext();

  if (!activeEstate) return <>Loading...</>;
  const { propertyDetails } = activeEstate.assetDetails;

  return (
    <div>
      <Table className="bg-white">
        <TableHeader>About</TableHeader>
        <TableDescription>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {propertyDetails.description}
          </div>
        </TableDescription>
        <TableItem>
          <p>Name</p>
          <p>{activeEstate.name}</p>
        </TableItem>

        <TableItem>
          <p>Location</p>
          <p>{activeEstate.assetDetails.locationTemp ?? "-"}</p>
        </TableItem>
        <TableItem>
          <p>Address</p>
          <p>{propertyDetails.fullAddress}</p>
        </TableItem>
        <TableItem>
          <p>Number of Rooms</p>
          <p>{activeEstate.assetDetails.roomsNumberTemp ?? "-"}</p>
        </TableItem>
        <TableItem>
          <p>Room Sizes</p>
          <p>{activeEstate.assetDetails.roomSizesTemp ?? "-"}</p>
        </TableItem>
        <TableItem>
          <p>Restaurant Capacity</p>
          <p>{activeEstate.assetDetails.capacityTemp ?? "-"}</p>
        </TableItem>
        <TableItem>
          <p>Conference Facilities</p>
          <p>{activeEstate.assetDetails.conferenceFacilitiesTemp ?? "-"}</p>
        </TableItem>
        <TableItem>
          <p>Amenities</p>
          <p>{activeEstate.assetDetails.amenitiesTemp ?? "-"}</p>
        </TableItem>
        <TableItem>
          <p>Additional Facilities</p>
          <p>{activeEstate.assetDetails.additionalFacilitiesTemp ?? "-"}</p>
        </TableItem>
        <TableItem>
          <p>Land Size</p>
          <p>{activeEstate.assetDetails.landSizeTemp ?? "-"}</p>
        </TableItem>
        <TableItem>
          <p>Natural Features</p>
          <p>{activeEstate.assetDetails.naturalTemp ?? "-"}</p>
        </TableItem>
      </Table>
      <div className="mb-8" />
      <PropertyDetailsMap
        address={activeEstate.assetDetails.propertyDetails.fullAddress}
        coordinates={activeEstate.assetDetails.coordinates}
      />
    </div>
  );
};
