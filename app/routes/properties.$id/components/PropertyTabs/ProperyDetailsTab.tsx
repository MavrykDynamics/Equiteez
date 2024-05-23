import { FC, useCallback, useState } from 'react';
import clsx from 'clsx';

// components
import { Table } from '~/atoms/Table/Table';
import { TableDescription } from '~/atoms/Table/TableDescription';
import { TableHeader } from '~/atoms/Table/TableHeader';
import { TableItem } from '~/atoms/Table/TableItem';

// Google maps
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

// Icons
import WalkIcon from 'app/assets/propertyId/icons/walk.svg?react';
import TransportIcon from 'app/assets/propertyId/icons/transport.svg?react';
import BicycleIcon from 'app/assets/propertyId/icons/bicycle.svg?react';

// styles
import styles from './propertyTabs.module.css';
import { useAppContext } from '~/providers/AppProvider/AppProvider';
import { InfoTooltip } from '~/organisms/InfoTooltip';

export const PropertyDetailsTab = () => {
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
          <p className="flex items-center gap-x-1">
            Rented? <InfoTooltip content={'Rented'} />
          </p>
          <p>Fully Rented</p>
        </TableItem>
        <TableItem>
          <p className="flex items-center gap-x-1">
            Rent Subsidy?
            <InfoTooltip content={'Rent Subsidy?'} />
          </p>
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
      <PropertyDetailsMap />
    </div>
  );
};

/**
 *
 * Maps section -------------------
 */

// fake map data
const containerStyle = {
  width: '406px',
  height: '507px',
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

const PropertyDetailsMap = () => {
  const { IS_WEB } = useAppContext();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  return (
    <section className="px-7 py-8 flex flex-col rounded-3xl shadow-card mt-8">
      <h3 className="text-content text-card-headline mb-6">Neighborhood</h3>
      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <p className="text-body mb-8">
            Lorem ipsum dolor sit amet consectetur. Odio et consectetur vitae
            bibendum nec pellentesque eu tellus pellentesque. Pellentesque et
            sapien nibh faucibus ut leo sagittis egestas.
          </p>

          <div className="flex flex-col gap-y-4">
            <DistanceBlock type="walk" />
            <DistanceBlock type="transport" />
            <DistanceBlock type="bicycle" />
          </div>
        </div>
        <div>
          {isLoaded && IS_WEB ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={10}
              onLoad={onLoad}
              onUnmount={onUnmount}
            >
              {/* Child components, such as markers, info windows, etc. */}
              <></>
            </GoogleMap>
          ) : (
            <>Loading map...</>
          )}
        </div>
      </div>
    </section>
  );
};

type DistanceBlockProps = {
  type: keyof typeof distanceData;
};

const distanceData = {
  walk: {
    distance: 44,
    Icon: WalkIcon,
    label: 'Walk',
    description: 'Most errands require a car.',
  },
  transport: {
    distance: 52,
    Icon: TransportIcon,
    label: 'Transport',
    description: 'A few nearby public transportation options.',
  },
  bicycle: {
    distance: 29,
    Icon: BicycleIcon,
    label: 'Bike',
    description: 'Minimal bike infrastructure',
  },
};

const DistanceBlock: FC<DistanceBlockProps> = ({ type }) => {
  const { Icon, distance, label, description } = distanceData[type];

  return (
    <div className="flex items-center gap-x-4">
      <div
        className={clsx(
          'w-[52px] h-[52px] rounded-full overflow-hidden bg-green-opacity',
          'flex items-center justify-center relative'
        )}
      >
        <Icon />
        <p className={styles.mapBlockNumber}>{distance}</p>
      </div>
      <div className="flex flex-col gap-y-[2px] items-start">
        <p className="text-content text-buttons">{label}</p>
        <p className="text-body-xs text-content-secondary">{description}</p>
      </div>
    </div>
  );
};
