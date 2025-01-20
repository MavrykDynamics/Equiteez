// Google maps
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";

import { useAppContext } from "~/providers/AppProvider/AppProvider";
import { CustomSuspense } from "~/templates/CustomSuspense";
import { getWalkScoreData } from "~/lib/apis/walk-score";
import { Spinner } from "~/lib/atoms/Spinner";
import { FC, useCallback, useEffect, useState } from "react";
import { DistanceBlock } from "./DistanceBlock/DistanceBlock";

/**
 *
 * Maps section -------------------
 */

// fake map data
const containerStyle = {
  width: "406px",
  height: "507px",
};

type WalkScoreState = {
  transit: number | "-";
  bike: number | "-";
  walk: number | "-";
  isLoading: boolean;
};

export const AssetDetailsMapBlock: FC<{
  coordinates: { lat: number; lng: number };
  address: string;
}> = ({ coordinates, address }) => {
  const { IS_WEB } = useAppContext();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });

  const [isMarkerClicked, setIsMarkerClicked] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // scores data
  const [scores, setScores] = useState<WalkScoreState>(() => ({
    transit: "-",
    walk: "-",
    bike: "-",
    isLoading: true,
  }));

  useEffect(() => {
    if (IS_WEB) {
      (async function () {
        try {
          const walkScoreData = await getWalkScoreData({
            address,
            lat: coordinates.lat.toString(),
            lon: coordinates.lng.toString(),
          });

          setScores({
            isLoading: false,
            walk: walkScoreData.walkscore ?? "-",
            bike: walkScoreData.bike?.score ?? "-",
            transit: walkScoreData.transit?.score ?? "-",
          });
        } catch (e) {
          setScores((prev) => ({ ...prev, isLoading: false }));
          console.log(e);
        }
      })();
    }
  }, [IS_WEB, address, coordinates.lat, coordinates.lng]);

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
    <section className="px-7 py-8 flex flex-col rounded-3xl shadow-card mt-8 bg-white border border-gray-100">
      <h3 className="text-content text-card-headline mb-6">Neighborhood</h3>
      <div className="grid grid-cols-2 gap-x-6">
        <div className="flex flex-col">
          <p className="text-body mb-8">
            Lorem ipsum dolor sit amet consectetur. Odio et consectetur vitae
            bibendum nec pellentesque eu tellus pellentesque. Pellentesque et
            sapien nibh faucibus ut leo sagittis egestas.
          </p>

          <div className="flex flex-col gap-y-4 flex-1">
            {scores.isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <>
                <DistanceBlock type="walk" score={scores.walk} />
                <DistanceBlock type="transport" score={scores.transit} />
                <DistanceBlock type="bicycle" score={scores.bike} />
              </>
            )}
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
            ></MarkerF>
          </GoogleMap>
        </CustomSuspense>
      </div>
    </section>
  );
};
