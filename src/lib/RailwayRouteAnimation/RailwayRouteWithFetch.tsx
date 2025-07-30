import React, { useState, useEffect } from "react";
import { continueRender, delayRender } from "remotion";
import { RailwayRouteAnimation } from "./RailwayRouteAnimation";
import { RailwayRouteProps, RouteCoordinate } from "./constants";
import {
  fetchRailwayRoute,
  fetchStationByName,
} from "./utils/railway-route-fetcher";

interface RailwayRouteWithFetchProps
  extends Omit<RailwayRouteProps, "route" | "segments"> {
  route?: RouteCoordinate[];
  segments?: RouteCoordinate[][];
  fetchRoute?: boolean;
  routeMethod?:
    | "straight"
    | "curved"
    | "osm"
    | "overpass"
    | "railway"
    | "openrailway";
  fetchStationCoordinates?: boolean; // If true, fetch coordinates by station names
}

export const RailwayRouteWithFetch: React.FC<RailwayRouteWithFetchProps> = ({
  stops,
  fetchRoute = false,
  routeMethod = "railway",
  fetchStationCoordinates = false,
  route: providedRoute,
  segments: providedSegments,
  ...restProps
}) => {
  const [, setRoute] = useState<RouteCoordinate[] | undefined>(
    providedRoute,
  );
  const [segments, setSegments] = useState<RouteCoordinate[][] | undefined>(
    providedSegments,
  );
  const [finalStops, setFinalStops] = useState(stops);
  const [handle] = useState(() =>
    fetchRoute || fetchStationCoordinates
      ? delayRender("Fetching route...")
      : null,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Determine which stops to use
        let journeyStops = stops || [];

        if (journeyStops.length < 2) {
          throw new Error("Need at least 2 stops for a journey");
        }

        // Fetch station coordinates if needed
        if (fetchStationCoordinates) {
          const stationPromises = journeyStops.map((stop) =>
            fetchStationByName(stop.name),
          );
          const stations = await Promise.all(stationPromises);

          const updatedStops = journeyStops.map((stop, index) => {
            const station = stations[index];
            if (station) {
              return {
                coordinate: {
                  latitude: station.lat,
                  longitude: station.lon,
                },
                name: station.name || stop.name,
              };
            }
            return stop;
          });

          setFinalStops(updatedStops);
          journeyStops = updatedStops;
        }

        // Fetch routes if needed
        if (fetchRoute && !providedRoute && !providedSegments) {
          const segmentPromises = [];

          for (let i = 0; i < journeyStops.length - 1; i++) {
            const fromStop = journeyStops[i];
            const toStop = journeyStops[i + 1];

            segmentPromises.push(
              fetchRailwayRoute(
                fromStop.coordinate.latitude,
                fromStop.coordinate.longitude,
                toStop.coordinate.latitude,
                toStop.coordinate.longitude,
                fromStop.name,
                toStop.name,
                { method: routeMethod },
              ),
            );
          }

          const fetchedSegments = await Promise.all(segmentPromises);
          setSegments(fetchedSegments);

          // For backward compatibility, set single route if only 2 stops
          if (journeyStops.length === 2) {
            setRoute(fetchedSegments[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching route data:", error);
        // Continue with default curved route
      } finally {
        if (handle) {
          continueRender(handle);
        }
      }
    };

    if (fetchRoute || fetchStationCoordinates) {
      fetchData();
    } else if (handle) {
      continueRender(handle);
    }
  }, [
    fetchRoute,
    fetchStationCoordinates,
    routeMethod,
    stops,
    providedRoute,
    providedSegments,
    handle,
  ]);

  return (
    <RailwayRouteAnimation
      stops={finalStops}
      segments={segments}
      {...restProps}
    />
  );
};
