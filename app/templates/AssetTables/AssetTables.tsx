import { Table } from "~/lib/atoms/Table/Table";
import { TableDescription } from "~/lib/atoms/Table/TableDescription";
import { TableHeader } from "~/lib/atoms/Table/TableHeader";
import { TableItem } from "~/lib/atoms/Table/TableItem";

export const AssetTable = () => {
  return <div>AssetTables</div>;
};

// 1 ---------------------

// about -> description
// key -> value
// value type -> text | address | Number with symbols | link
// location -> map (OPTIONAL)

export const BitCoinMinersTable = () => {
  return (
    <div>
      <Table className="bg-white">
        <TableHeader>About</TableHeader>
        <TableDescription>{propertyDetails.description}</TableDescription>
        <TableItem>
          <p>Location</p>
          <p>{propertyDetails.propertyType}</p>
        </TableItem>
        <TableItem>
          <p>Full Address</p>
          <p>{propertyDetails.fullAddress}</p>
        </TableItem>
        <TableItem>
          <p>Capacity</p>
          <p>{propertyDetails.country}</p>
        </TableItem>
        <TableItem>
          <p>Mining Hardware</p>
          <p>Hubbell - Lyndon</p>
        </TableItem>
        <TableItem>
          <p>Model</p>
          <p>{propertyDetails.rentalType}</p>
        </TableItem>
        <TableItem>
          <p>Hashrate</p>
          <p>{propertyDetails.rented}</p>
        </TableItem>
        <TableItem>
          <p>Power Consumption</p>
          <p>{propertyDetails.rentSubsidy}</p>
        </TableItem>
        <TableItem>
          <p>Efficiency</p>
          <p>{propertyDetails.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Energy Source</p>
          <p>{propertyDetails.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Energy Cost</p>
          <p>{propertyDetails.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Cost Of Electricity</p>
          <p>{propertyDetails.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Daily Production</p>
          <p>{propertyDetails.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Redundancy</p>
          <p>{propertyDetails.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Connectivity</p>
          <p>{propertyDetails.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Power Source</p>
          <p>{propertyDetails.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Cooling</p>
          <p>{propertyDetails.propertyManager}</p>
        </TableItem>
        <TableItem>
          <p>Security</p>
          <p>{propertyDetails.propertyManager}</p>
        </TableItem>
      </Table>

      {/* Map here id needed */}
    </div>
  );
};
