/* eslint-disable react/no-unescaped-entities */
import { FC, useCallback, useState } from 'react';
import clsx from 'clsx';

// components
import { Table } from '~/atoms/Table/Table';
import { TableDescription } from '~/atoms/Table/TableDescription';
import { TableHeader } from '~/atoms/Table/TableHeader';
import { TableItem } from '~/atoms/Table/TableItem';

// Google maps
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

// Icons
import WalkIcon from 'app/assets/propertyId/icons/walk.svg?react';
import TransportIcon from 'app/assets/propertyId/icons/transport.svg?react';
import BicycleIcon from 'app/assets/propertyId/icons/bicycle.svg?react';

// styles
import styles from './propertyTabs.module.css';
import { useAppContext } from '~/providers/AppProvider/AppProvider';
import { InfoTooltip } from '~/organisms/InfoTooltip';
import { CustomSuspense } from '~/templates/CustomSuspense';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';

export const PropertyDetailsTab = () => {
  const { activeEstate } = useEstatesContext();

  if (!activeEstate) return <>Loading...</>;
  const { propertyDetails, buildingInfo } = activeEstate.assetDetails;

  return (
    <div>
      <Table>
        <TableHeader>About the Offering</TableHeader>
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
            Rented? <InfoTooltip content={'Rented'} />
          </div>
          <p>{propertyDetails.rented}</p>
        </TableItem>
        <TableItem>
          <div className="flex items-center gap-x-1">
            Rent Subsidy?
            <InfoTooltip content={'Rent Subsidy?'} />
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
      <Table>
        <TableHeader>Building Info</TableHeader>
        <TableItem>
          <p>Stories</p>
          <p>{buildingInfo.stories} stories</p>
        </TableItem>
        <TableItem>
          <p>Lot Size (sqft)</p>
          <p>{buildingInfo.lotSize} sqft </p>
        </TableItem>
        <TableItem>
          <p>Interior Size (sqft)</p>
          <p>{buildingInfo.interiorSize} sqft</p>
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
      <PropertyDetailsMap coordinates={activeEstate.assetDetails.coordinates} />
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

const PropertyDetailsMap: FC<{ coordinates: { lat: number; lng: number } }> = ({
  coordinates,
}) => {
  const { IS_WEB } = useAppContext();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });

  const [isMarkerClicked, setIsMarkerClicked] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(
    function callback(map: google.maps.Map) {
      // This is just an example of getting and using the map instance!!! don't just blindly copy!
      const bounds = new window.google.maps.LatLngBounds(coordinates);
      map.fitBounds(bounds);

      setMap(map);
    },
    [coordinates]
  );

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const toggleMarkerWindow = useCallback(() => {
    setIsMarkerClicked(!isMarkerClicked);
  }, [isMarkerClicked]);

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
        <CustomSuspense loading={!isLoaded || !IS_WEB}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={coordinates}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {/* Child components, such as markers, info windows, etc. */}
            <MarkerF
              position={coordinates}
              title="The cove"
              onClick={toggleMarkerWindow}
              zIndex={-1}
            >
              {/* <>
                {isMarkerClicked && (
                  <InfoWindow
                    position={center}
                    onCloseClick={toggleMarkerWindow}
                  >
                    <div className="text-content text-body z-10">
                      Real Estate name here
                    </div>
                  </InfoWindow>
                )}
              </> */}
            </MarkerF>
          </GoogleMap>
        </CustomSuspense>
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
