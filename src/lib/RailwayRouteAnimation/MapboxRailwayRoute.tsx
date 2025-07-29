import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import mapboxgl, { Map, Marker } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';
import { RailwayRouteProps } from './constants';
import { positionToPoint, routeCoordinateToPoint } from './utils/geo-utils';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAP_BOX_API_KEY as string;

// High-tech Mapbox styles
const MAP_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  navigation: 'mapbox://styles/mapbox/navigation-night-v1',
  blueprint: 'mapbox://styles/mapbox/light-v11', // Can be customized with filters
  custom: 'mapbox://styles/jonnyburger/clgtb8stl002z01o5d15ye0u0', // Original from example
};

export const MapboxRailwayRoute: React.FC<RailwayRouteProps & { mapStyle?: keyof typeof MAP_STYLES }> = ({
  startPosition,
  endPosition,
  route,
  animationStartDelay,
  animationDuration,
  mapStyle = 'dark',
  mapboxZoom,
  mapboxAltitude = 50000,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender('Loading map...'));
  const [mapReady, setMapReady] = useState(false);
  const startMarkerRef = useRef<Marker | null>(null);
  const endMarkerRef = useRef<Marker | null>(null);

  // Convert positions to coordinates
  const startCoord = useMemo(() => positionToPoint(startPosition), [startPosition]);
  const endCoord = useMemo(() => positionToPoint(endPosition), [endPosition]);
  
  // Create route line - memoize to prevent re-renders
  const routeCoordinates = useMemo(() => {
    return route && route.length > 0
      ? route.map(coord => [coord.longitude, coord.latitude])
      : [[startCoord.longitude, startCoord.latitude], [endCoord.longitude, endCoord.latitude]];
  }, [route, startCoord, endCoord]);

  // Animation progress
  const animation = interpolate(
    frame,
    [animationStartDelay, animationStartDelay + animationDuration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.ease),
    }
  );

  // Label animations
  const startLabelOpacity = interpolate(
    frame,
    [0, animationStartDelay],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const endLabelOpacity = spring({
    fps,
    frame: frame - animationStartDelay - animationDuration,
    config: {
      damping: 200,
    },
    durationInFrames: 20,
  });

  useEffect(() => {
    // Only initialize map once
    if (mapRef.current) return;

    const bounds = new mapboxgl.LngLatBounds()
      .extend([startCoord.longitude, startCoord.latitude])
      .extend([endCoord.longitude, endCoord.latitude]);

    const mapOptions: mapboxgl.MapboxOptions = {
      container: 'map',
      style: MAP_STYLES[mapStyle],
      interactive: false,
      fadeDuration: 0,
      preserveDrawingBuffer: true,
    };

    // If zoom is specified, use center and zoom instead of bounds
    if (mapboxZoom !== undefined) {
      const center = bounds.getCenter();
      mapOptions.center = center;
      mapOptions.zoom = mapboxZoom;
    } else {
      mapOptions.bounds = bounds;
      mapOptions.fitBoundsOptions = { padding: 100 };
    }

    const _map = new Map(mapOptions);

    _map.on('style.load', () => {
      // Add route source
      _map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates,
          },
        },
      });

      // Add glow effect layers for high-tech look
      _map.addLayer({
        type: 'line',
        source: 'route',
        id: 'route-glow-outer',
        paint: {
          'line-color': '#00ffff',
          'line-width': 20,
          'line-blur': 15,
          'line-opacity': 0.4,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      _map.addLayer({
        type: 'line',
        source: 'route',
        id: 'route-glow-inner',
        paint: {
          'line-color': '#00ffff',
          'line-width': 10,
          'line-blur': 5,
          'line-opacity': 0.6,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      _map.addLayer({
        type: 'line',
        source: 'route',
        id: 'route-line',
        paint: {
          'line-color': '#ffffff',
          'line-width': 3,
          'line-opacity': 0.9,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      // Add station markers
      _map.addSource('stations', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [startCoord.longitude, startCoord.latitude],
              },
              properties: {
                name: startPosition.name,
                type: 'start',
              },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [endCoord.longitude, endCoord.latitude],
              },
              properties: {
                name: endPosition.name,
                type: 'end',
              },
            },
          ],
        },
      });

      // Station circles with glow
      _map.addLayer({
        type: 'circle',
        source: 'stations',
        id: 'station-glow',
        paint: {
          'circle-radius': 25,
          'circle-color': '#00ffff',
          'circle-blur': 1,
          'circle-opacity': 0.4,
        },
      });

      _map.addLayer({
        type: 'circle',
        source: 'stations',
        id: 'station-circle',
        paint: {
          'circle-radius': 12,
          'circle-color': '#ffffff',
          'circle-stroke-color': '#00ffff',
          'circle-stroke-width': 3,
        },
      });

      // We'll add custom markers with HTML elements instead of using Mapbox layers for labels
    });

    _map.on('load', () => {
      continueRender(handle);
      mapRef.current = _map;
      
      // Create custom HTML markers for station labels
      const createLabelElement = (text: string) => {
        const el = document.createElement('div');
        el.style.cssText = `
          background: white;
          color: black;
          padding: 12px 24px;
          border-radius: 24px;
          font-family: 'DIN Pro Bold', 'Arial Unicode MS Bold', sans-serif;
          font-size: 48px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transform: translateY(-80px);
          transition: opacity 0.3s ease-in-out;
        `;
        el.textContent = text;
        return el;
      };
      
      // Create start station marker
      const startLabelEl = createLabelElement(startPosition.name);
      startMarkerRef.current = new Marker({ element: startLabelEl, anchor: 'bottom' })
        .setLngLat([startCoord.longitude, startCoord.latitude])
        .addTo(_map);
      
      // Create end station marker
      const endLabelEl = createLabelElement(endPosition.name);
      endMarkerRef.current = new Marker({ element: endLabelEl, anchor: 'bottom' })
        .setLngLat([endCoord.longitude, endCoord.latitude])
        .addTo(_map);
      
      // Give a small delay to ensure all layers are ready
      setTimeout(() => setMapReady(true), 100);
    });

    return () => {
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
      if (endMarkerRef.current) {
        endMarkerRef.current.remove();
        endMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [handle, mapStyle, routeCoordinates, startCoord, endCoord, startPosition.name, endPosition.name, mapboxZoom]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const handleFrame = () => {
      const routeDistance = turf.lineDistance(turf.lineString(routeCoordinates));
      const alongRoute = turf.along(
        turf.lineString(routeCoordinates),
        routeDistance * animation
      ).geometry.coordinates;

      // Update line progress
      const visibleRoute = routeCoordinates.slice(0, Math.ceil(routeCoordinates.length * animation));
      if (animation > 0 && animation < 1) {
        visibleRoute.push(alongRoute);
      }

      try {
        const source = mapRef.current?.getSource('route');
        if (source && 'setData' in source) {
          source.setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: visibleRoute,
            },
          });
        }

        // Update station label visibility
        if (startMarkerRef.current && endMarkerRef.current) {
          const startEl = startMarkerRef.current.getElement();
          const endEl = endMarkerRef.current.getElement();
          
          // Only show start label before animation starts
          if (startEl) {
            startEl.style.opacity = frame < animationStartDelay ? '1' : '0';
          }
          
          // Only show end label after animation completes
          if (endEl) {
            endEl.style.opacity = frame > animationStartDelay + animationDuration ? '1' : '0';
          }
        }
        
        // Camera follows the route
        const camera = mapRef.current?.getFreeCameraOptions();
        if (camera && mapRef.current) {
          const altitude = mapboxAltitude; // Use configurable altitude
          
          camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
            {
              lng: alongRoute[0],
              lat: alongRoute[1],
            },
            altitude
          );

          // Look ahead on the route
          const lookAheadDistance = Math.min(routeDistance * (animation + 0.1), routeDistance);
          const lookAtPoint = turf.along(
            turf.lineString(routeCoordinates),
            lookAheadDistance
          ).geometry.coordinates;

          camera.lookAtPoint({
            lng: lookAtPoint[0],
            lat: lookAtPoint[1],
          });

          mapRef.current.setFreeCameraOptions(camera);
        }
      } catch (error) {
        console.error('Error updating map:', error);
      }
    };

    // Run immediately if map is loaded, otherwise wait for idle
    if (mapRef.current?.loaded()) {
      handleFrame();
    } else {
      mapRef.current?.once('idle', handleFrame);
    }
  }, [mapReady, animation, routeCoordinates, frame, animationStartDelay, animationDuration]);

  return (
    <AbsoluteFill>
      <div 
        ref={ref} 
        id="map" 
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#000',
          position: 'absolute',
          top: 0,
          left: 0,
        }} 
      />
    </AbsoluteFill>
  );
};