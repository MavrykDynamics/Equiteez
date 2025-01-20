import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { FC, useCallback, useState } from "react";
import { useAppContext } from "~/providers/AppProvider/AppProvider";
import { CustomSuspense } from "../CustomSuspense";
import { TableHeader } from "~/lib/atoms/Table/TableHeader";

const containerStyle = {
  width: "100%",
  height: "507px",
};

export const LocationMap: FC<{
  coordinates?: { lat: number; lng: number };
}> = ({
  // TODO remove default values
  coordinates = { lat: 14.660612746894753, lng: 121.01257318017728 },
}) => {
  const { IS_WEB } = useAppContext();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });

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

  return (
    <>
      <TableHeader>Location</TableHeader>
      <div>
        <CustomSuspense loading={!isLoaded || !IS_WEB}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={coordinates}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}
          ></GoogleMap>
        </CustomSuspense>
      </div>
    </>
  );
};
