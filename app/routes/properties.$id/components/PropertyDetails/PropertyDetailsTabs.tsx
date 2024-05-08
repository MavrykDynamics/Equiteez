import { FC, useCallback, useMemo, useState } from 'react';
import { TabType } from '~/atoms/Tab';
import { Table } from '~/atoms/Table/Table';
import { TableDescription } from '~/atoms/Table/TableDescription';
import { TableHeader } from '~/atoms/Table/TableHeader';
import { TableItem } from '~/atoms/Table/TableItem';
import { TabSwitcher } from '~/organisms/TabSwitcher';

export const PropertyDetailsTabs = () => {
  const [activetabId, setAvtiveTabId] = useState('propertyDetails');

  const handleTabClick = useCallback((id: string) => {
    setAvtiveTabId(id);
  }, []);

  const tabs: TabType[] = useMemo(
    () => [
      {
        id: 'propertyDetails',
        label: 'Property Details',
        handleClick: handleTabClick,
      },
      {
        id: 'financials',
        label: 'Financials',
        handleClick: handleTabClick,
      },
      {
        id: 'blockchain',
        label: 'Blockchain',
        handleClick: handleTabClick,
      },
      {
        id: 'offering',
        label: 'Offering',
        handleClick: handleTabClick,
      },
      {
        id: 'valuation',
        label: 'Valuation',
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  return (
    <section className="flex flex-col">
      <TabSwitcher tabs={tabs} activeTabId={activetabId} />
      <div className="mt-11">
        <PropertyDetailsByTab tabId={activetabId} />
      </div>
    </section>
  );
};

type PropertytabKey = keyof typeof propertyTabsComponents;

type ProprtyDetailsByTabProps = {
  tabId: string;
};

const PropertyDetailsByTab: FC<ProprtyDetailsByTabProps> = ({ tabId }) => {
  const Component = propertyTabsComponents[tabId as PropertytabKey];

  return Component;
};

const PropertyDetailsComponent = () => {
  return (
    <div>
      <Table>
        <TableHeader>About the Offering</TableHeader>
        <TableDescription>
          8646 Ford Ave is a charming single story home located in a
          family-friendly neighborhood in Northport, Alabama. With four spacious
          bedrooms and two bathrooms, there is plenty of space for comfortable
          living. The home features an open concept design that seamlessly
          integrates a breakfast area complete with bar sleek and modern kitchen
          with granite countertops, kitchen island, pantry and sleek counters
          with solid surface. Outside, residents can enjoy the community's
          amenities, including a nearby park with playground, which makes it an
          ideal place for family recreation.
        </TableDescription>
        <TableItem>
          <p>Property Type</p>
          <p>Single Family</p>
        </TableItem>
        <TableItem>
          <p>Full Address</p>
          <p>7335 Wilburton Lane, Northport, AL 35473</p>
        </TableItem>
        <TableItem>
          <p>Country</p>
          <p>USA</p>
        </TableItem>
        <TableItem>
          <p>Neighborhood</p>
          <p>Hubbell - Lyndon</p>
        </TableItem>
        <TableItem>
          <p>Rental Type</p>
          <p>Long-Term</p>
        </TableItem>
        <TableItem>
          <p>Rented?</p>
          <p>Fully Rented</p>
        </TableItem>
        <TableItem>
          <p>Rent Subsidy??</p>
          <p>No</p>
        </TableItem>
        <TableItem>
          <p>Property Manager</p>
          <p>Mutual Property Management LLC</p>
        </TableItem>
        <TableItem isLast>
          <p>Parking</p>
          <p>1 Detached Garage</p>
        </TableItem>
      </Table>
      <div className="mb-8" />
      <Table>
        <TableHeader>Building Info</TableHeader>
        <TableItem>
          <p>Stories</p>
          <p>2 stories</p>
        </TableItem>
        <TableItem>
          <p>Lot Size (sqft)</p>
          <p>1,270 sqft </p>
        </TableItem>
        <TableItem>
          <p>Interior Size (sqft)</p>
          <p>704 sqft</p>
        </TableItem>
        <TableItem>
          <p>Building Class</p>
          <p>C</p>
        </TableItem>
        <TableItem>
          <p>Foundation</p>
          <p>Masonry Block</p>
        </TableItem>
        <TableItem>
          <p>Exterior Walls</p>
          <p>Brick</p>
        </TableItem>
        <TableItem>
          <p>Roof Type</p>
          <p>Asphalt</p>
        </TableItem>
        <TableItem>
          <p>Heating</p>
          <p>Forced Air / Gas</p>
        </TableItem>
        <TableItem>
          <p>Cooling</p>
          <p>None</p>
        </TableItem>
        <TableItem isLast>
          <p>Renovated</p>
          <p>Entirely Renovated</p>
        </TableItem>
      </Table>
    </div>
  );
};

const propertyTabsComponents = {
  propertyDetails: <PropertyDetailsComponent />,
  financials: null,
  blockchain: null,
  offering: null,
  valuation: null,
};
