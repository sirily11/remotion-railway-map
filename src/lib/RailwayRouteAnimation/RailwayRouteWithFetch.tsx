import React, { useState, useEffect } from 'react';
import { continueRender, delayRender } from 'remotion';
import { RailwayRouteAnimation } from './RailwayRouteAnimation';
import { RailwayRouteProps, RouteCoordinate } from './constants';
import { fetchRailwayRoute, fetchStationByName } from './utils/railway-route-fetcher';

interface RailwayRouteWithFetchProps extends Omit<RailwayRouteProps, 'route'> {
  route?: RouteCoordinate[];
  fetchRoute?: boolean;
  routeMethod?: 'straight' | 'curved' | 'openrailrouting' | 'overpass';
  fetchStationCoordinates?: boolean; // If true, fetch coordinates by station names
}

export const RailwayRouteWithFetch: React.FC<RailwayRouteWithFetchProps> = ({
  startPosition,
  endPosition,
  fetchRoute = false,
  routeMethod = 'openrailrouting',
  fetchStationCoordinates = false,
  route: providedRoute,
  ...restProps
}) => {
  const [route, setRoute] = useState<RouteCoordinate[] | undefined>(providedRoute);
  const [finalStartPosition, setFinalStartPosition] = useState(startPosition);
  const [finalEndPosition, setFinalEndPosition] = useState(endPosition);
  const [handle] = useState(() => fetchRoute || fetchStationCoordinates ? delayRender('Fetching route...') : null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let actualStartPos = startPosition;
        let actualEndPos = endPosition;

        // Fetch station coordinates if needed
        if (fetchStationCoordinates) {
          const [startStation, endStation] = await Promise.all([
            fetchStationByName(startPosition.name),
            fetchStationByName(endPosition.name),
          ]);

          if (startStation) {
            actualStartPos = {
              coordinate: {
                latitude: startStation.lat,
                longitude: startStation.lon,
              },
              name: startStation.name || startPosition.name,
            };
            setFinalStartPosition(actualStartPos);
          }

          if (endStation) {
            actualEndPos = {
              coordinate: {
                latitude: endStation.lat,
                longitude: endStation.lon,
              },
              name: endStation.name || endPosition.name,
            };
            setFinalEndPosition(actualEndPos);
          }
        }

        // Fetch route if needed
        if (fetchRoute && !providedRoute) {
          const fetchedRoute = await fetchRailwayRoute(
            actualStartPos.coordinate.latitude,
            actualStartPos.coordinate.longitude,
            actualEndPos.coordinate.latitude,
            actualEndPos.coordinate.longitude,
            actualStartPos.name,
            actualEndPos.name,
            { method: routeMethod }
          );
          
          setRoute(fetchedRoute);
        }
      } catch (error) {
        console.error('Error fetching route data:', error);
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
    startPosition,
    endPosition,
    providedRoute,
    handle,
  ]);

  return (
    <RailwayRouteAnimation
      startPosition={finalStartPosition}
      endPosition={finalEndPosition}
      route={route}
      {...restProps}
    />
  );
};