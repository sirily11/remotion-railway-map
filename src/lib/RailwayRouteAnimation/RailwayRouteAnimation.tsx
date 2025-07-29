import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { RailwayRouteProps } from './constants';
import { StationMarker } from './StationMarker';
import { RouteAnimator } from './RouteAnimator';
import { TilesLayer } from './TilesLayer';
import { MapboxRailwayRoute } from './MapboxRailwayRoute';
import {
  positionToPoint,
  getCloserEndPoint,
  calculateZoom,
  getLabelPosition,
  Point,
} from './utils/geo-utils';
import { getArea, getOffset } from './utils/get-area';

const getBackgroundColor = (tileStyle: string) => {
  switch (tileStyle) {
    case 'dark':
    case 'darkMatter':
      return '#1a1a1a';
    case 'satellite':
      return '#000';
    case 'watercolor':
    case 'positron':
      return '#f0f0f0';
    default:
      return '#e6e6e6';
  }
};

export const RailwayRouteAnimation: React.FC<RailwayRouteProps> = ({
  startPosition,
  endPosition,
  route,
  durationInFrames,
  animationStartDelay,
  animationDuration,
  renderType,
  mapboxStyle,
  tileStyle,
}) => {
  // If using Mapbox, delegate to MapboxRailwayRoute
  if (renderType === 'mapbox') {
    return (
      <MapboxRailwayRoute
        startPosition={startPosition}
        endPosition={endPosition}
        route={route}
        durationInFrames={durationInFrames}
        animationStartDelay={animationStartDelay}
        animationDuration={animationDuration}
        mapStyle={mapboxStyle}
      />
    );
  }
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Convert positions to points
  const startPoint = positionToPoint(startPosition);
  const unclampedEndPoint = positionToPoint(endPosition);
  const closerEndPoint = getCloserEndPoint(startPoint, unclampedEndPoint);
  
  // Calculate zoom based on distance
  const zoom = calculateZoom(startPoint, closerEndPoint);

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

  // Spring animations for labels
  const startLabelOpacity =
    1 -
    spring({
      fps,
      frame: frame - animationStartDelay,
      config: {
        damping: 200,
      },
      durationInFrames: 20,
    });

  const endLabelOpacity = spring({
    fps,
    frame: frame - animationStartDelay - animationDuration,
    config: {
      damping: 200,
    },
    durationInFrames: 20,
  });

  const endPointScale = spring({
    fps,
    frame: frame - animationStartDelay - animationDuration + 3,
    config: {
      damping: 200,
    },
    durationInFrames: 20,
  });

  // Calculate center point for camera movement
  const center: Point = useMemo(() => {
    return {
      latitude: interpolate(
        animation,
        [0, 1],
        [startPoint.latitude, closerEndPoint.latitude]
      ),
      longitude: interpolate(
        animation,
        [0, 1],
        [startPoint.longitude, closerEndPoint.longitude]
      ),
    };
  }, [
    animation,
    closerEndPoint.latitude,
    closerEndPoint.longitude,
    startPoint.latitude,
    startPoint.longitude,
  ]);

  // Calculate offsets for positioning
  const originalOffset = useMemo(() => {
    return getOffset({
      center: startPoint,
      height,
      width,
      zoom,
    });
  }, [height, startPoint, width, zoom]);

  const endOffset = useMemo(() => {
    return getOffset({
      center: closerEndPoint,
      height,
      width,
      zoom,
    });
  }, [closerEndPoint, height, width, zoom]);

  // Calculate marker positions
  const startMarkerXPosition = -interpolate(
    animation,
    [0, 1],
    [0, endOffset.x - originalOffset.x]
  );
  const startMarkerYPosition = -interpolate(
    animation,
    [0, 1],
    [0, endOffset.y - originalOffset.y]
  );
  const endMarkerXPosition = -interpolate(
    animation,
    [0, 1],
    [originalOffset.x - endOffset.x, 0]
  );
  const endMarkerYPosition = -interpolate(
    animation,
    [0, 1],
    [originalOffset.y - endOffset.y, 0]
  );

  const offsetDifference = useMemo(() => {
    return {
      x: endOffset.x - originalOffset.x,
      y: endOffset.y - originalOffset.y,
    };
  }, [endOffset.x, endOffset.y, originalOffset.x, originalOffset.y]);

  const startMarkerStyle = useMemo(() => {
    return {
      marginLeft: startMarkerXPosition,
      marginTop: startMarkerYPosition,
    };
  }, [startMarkerXPosition, startMarkerYPosition]);

  const endMarkerStyle = useMemo(() => {
    return {
      marginLeft: endMarkerXPosition,
      marginTop: endMarkerYPosition,
    };
  }, [endMarkerXPosition, endMarkerYPosition]);

  // Calculate tile area
  const offset = useMemo(
    () =>
      getOffset({
        zoom,
        center,
        height,
        width,
      }),
    [center, height, width, zoom]
  );

  const area = useMemo(() => {
    return getArea({
      ...center,
      height,
      width,
      zoom,
    });
  }, [center, height, width, zoom]);

  // Determine label positions
  const startLabelPosition = getLabelPosition(startPoint, closerEndPoint, true);
  const endLabelPosition = getLabelPosition(startPoint, closerEndPoint, false);

  return (
    <AbsoluteFill style={{ backgroundColor: getBackgroundColor(tileStyle) }}>
      {/* Map Tiles */}
      <AbsoluteFill>
        <TilesLayer area={area} offset={offset} zoom={zoom} style={tileStyle} />
      </AbsoluteFill>

      {/* Route Animation */}
      <AbsoluteFill style={startMarkerStyle}>
        <RouteAnimator
          startOffset={{ x: 0, y: 0 }}
          endOffset={offsetDifference}
          route={route}
          width={width}
          height={height}
          progress={animation}
        />
      </AbsoluteFill>

      {/* Start Station Marker */}
      <AbsoluteFill style={startMarkerStyle}>
        <StationMarker
          name={startPosition.name}
          labelPosition={startLabelPosition}
          opacity={startLabelOpacity}
        />
      </AbsoluteFill>

      {/* End Station Marker */}
      <AbsoluteFill style={endMarkerStyle}>
        <StationMarker
          name={endPosition.name}
          labelPosition={endLabelPosition}
          opacity={endLabelOpacity}
          scale={endPointScale}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};