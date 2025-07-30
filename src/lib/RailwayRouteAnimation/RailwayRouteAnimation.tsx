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

export const RailwayRouteAnimation: React.FC<RailwayRouteProps> = (props) => {
  const {
    startPosition,
    endPosition,
    route,
    stops,
    segments,
    durationInFrames,
    animationStartDelay,
    animationDuration,
    tileStyle,
    zoom: propsZoom,
  } = props;
  
  // Use stops if provided, otherwise fall back to start/end positions
  const journeyStops = useMemo(() => {
    if (stops && stops.length >= 2) {
      return stops;
    }
    if (startPosition && endPosition) {
      return [startPosition, endPosition];
    }
    throw new Error('Either stops array or startPosition/endPosition must be provided');
  }, [stops, startPosition, endPosition]);
  
  // Use segments if provided, otherwise use single route or empty
  const routeSegments = useMemo(() => {
    if (segments) {
      return segments;
    }
    if (route) {
      return [route];
    }
    return Array(journeyStops.length - 1).fill([]);
  }, [segments, route, journeyStops.length]);
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Convert positions to points
  const stopPoints = useMemo(() => {
    return journeyStops.map(stop => positionToPoint(stop));
  }, [journeyStops]);
  
  // Calculate overall journey bounds
  const { zoom, centerPoint } = useMemo(() => {
    const lats = stopPoints.map(p => p.latitude);
    const lngs = stopPoints.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Use props zoom if provided, otherwise calculate
    if (propsZoom !== undefined) {
      return {
        zoom: propsZoom,
        centerPoint: { latitude: centerLat, longitude: centerLng }
      };
    }
    
    // Calculate zoom to fit all stops
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    // Rough zoom calculation (you may need to adjust this)
    let calculatedZoom = 12;
    if (maxDiff > 2) calculatedZoom = 6;
    else if (maxDiff > 1) calculatedZoom = 7;
    else if (maxDiff > 0.5) calculatedZoom = 8;
    else if (maxDiff > 0.2) calculatedZoom = 9;
    else if (maxDiff > 0.1) calculatedZoom = 10;
    else if (maxDiff > 0.05) calculatedZoom = 11;
    
    return {
      zoom: calculatedZoom,
      centerPoint: { latitude: centerLat, longitude: centerLng }
    };
  }, [stopPoints, propsZoom]);

  // Calculate which segment we're currently animating
  const numSegments = journeyStops.length - 1;
  const segmentDuration = animationDuration / numSegments;
  
  const currentSegmentIndex = useMemo(() => {
    const progress = frame - animationStartDelay;
    if (progress < 0) return -1;
    if (progress >= animationDuration) return numSegments - 1;
    return Math.floor(progress / segmentDuration);
  }, [frame, animationStartDelay, animationDuration, segmentDuration, numSegments]);
  
  // Animation progress within current segment
  const segmentAnimation = useMemo(() => {
    if (currentSegmentIndex < 0) return 0;
    const segmentStart = animationStartDelay + currentSegmentIndex * segmentDuration;
    const segmentEnd = segmentStart + segmentDuration;
    return interpolate(
      frame,
      [segmentStart, segmentEnd],
      [0, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.ease),
      }
    );
  }, [frame, animationStartDelay, currentSegmentIndex, segmentDuration]);

  // Calculate label opacities for all stops
  const stopLabelOpacities = useMemo(() => {
    return journeyStops.map((_, index) => {
      if (index === 0) {
        // Start station fades out after animation starts
        return 1 - spring({
          fps,
          frame: frame - animationStartDelay,
          config: { damping: 200 },
          durationInFrames: 20,
        });
      } else {
        // Other stations fade in when reached
        const arrivalTime = animationStartDelay + (index * segmentDuration);
        return spring({
          fps,
          frame: frame - arrivalTime,
          config: { damping: 200 },
          durationInFrames: 20,
        });
      }
    });
  }, [journeyStops, fps, frame, animationStartDelay, segmentDuration]);
  
  // Scale animation for reached stops
  const stopScales = useMemo(() => {
    return journeyStops.map((_, index) => {
      if (index === 0) return 1; // Start station always at normal scale
      const arrivalTime = animationStartDelay + (index * segmentDuration);
      return spring({
        fps,
        frame: frame - arrivalTime + 3,
        config: { damping: 200 },
        durationInFrames: 20,
      });
    });
  }, [journeyStops, fps, frame, animationStartDelay, segmentDuration]);

  // Calculate current camera center based on animation progress
  const center: Point = useMemo(() => {
    if (currentSegmentIndex < 0) {
      // During delay, stay at the first stop instead of showing overall view
      return stopPoints[0];
    }
    
    const fromStop = stopPoints[currentSegmentIndex];
    const toStop = stopPoints[Math.min(currentSegmentIndex + 1, stopPoints.length - 1)];
    
    return {
      latitude: interpolate(
        segmentAnimation,
        [0, 1],
        [fromStop.latitude, toStop.latitude]
      ),
      longitude: interpolate(
        segmentAnimation,
        [0, 1],
        [fromStop.longitude, toStop.longitude]
      ),
    };
  }, [currentSegmentIndex, stopPoints, segmentAnimation]);

  // Calculate offsets for all stops
  const stopOffsets = useMemo(() => {
    return stopPoints.map(point => getOffset({
      center: point,
      height,
      width,
      zoom,
    }));
  }, [stopPoints, height, width, zoom]);

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

  // Calculate marker positions relative to current camera center
  const markerStyles = useMemo(() => {
    const currentOffset = getOffset({
      center,
      height,
      width,
      zoom,
    });
    
    return stopOffsets.map(stopOffset => ({
      marginLeft: stopOffset.x - currentOffset.x,
      marginTop: stopOffset.y - currentOffset.y,
    }));
  }, [center, height, width, zoom, stopOffsets]);

  return (
    <AbsoluteFill style={{ backgroundColor: getBackgroundColor(tileStyle) }}>
      {/* Map Tiles */}
      <AbsoluteFill>
        <TilesLayer area={area} offset={offset} zoom={zoom} style={tileStyle} />
      </AbsoluteFill>

      {/* Route Animations for all segments */}
      {routeSegments.map((segment, index) => {
        if (index > currentSegmentIndex) return null; // Don't show future segments
        
        const segmentProgress = index === currentSegmentIndex ? segmentAnimation : 1;
        const fromOffset = stopOffsets[index];
        const toOffset = stopOffsets[index + 1];
        const offsetDiff = {
          x: toOffset.x - fromOffset.x,
          y: toOffset.y - fromOffset.y,
        };
        
        return (
          <AbsoluteFill key={`route-${index}`} style={markerStyles[index]}>
            <RouteAnimator
              startOffset={{ x: 0, y: 0 }}
              endOffset={offsetDiff}
              route={segment}
              width={width}
              height={height}
              progress={segmentProgress}
              zoom={zoom}
              center={center}
            />
          </AbsoluteFill>
        );
      })}

      {/* Station Markers for all stops */}
      {journeyStops.map((stop, index) => {
        // Determine label position based on neighbors
        const prevPoint = index > 0 ? stopPoints[index - 1] : null;
        const nextPoint = index < stopPoints.length - 1 ? stopPoints[index + 1] : null;
        const currentPoint = stopPoints[index];
        
        let labelPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
        if (prevPoint && nextPoint) {
          // For intermediate stops, position label away from the route
          const avgLat = (prevPoint.latitude + nextPoint.latitude) / 2;
          const avgLng = (prevPoint.longitude + nextPoint.longitude) / 2;
          
          if (currentPoint.latitude > avgLat) labelPosition = 'top';
          else labelPosition = 'bottom';
        } else if (prevPoint) {
          // End stop
          labelPosition = getLabelPosition(prevPoint, currentPoint, false);
        } else if (nextPoint) {
          // Start stop
          labelPosition = getLabelPosition(currentPoint, nextPoint, true);
        }
        
        return (
          <AbsoluteFill key={`marker-${index}`} style={markerStyles[index]}>
            <StationMarker
              name={stop.name}
              labelPosition={labelPosition}
              opacity={stopLabelOpacities[index]}
              scale={stopScales[index]}
            />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};