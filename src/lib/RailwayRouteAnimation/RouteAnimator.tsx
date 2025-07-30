import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { LINE_WIDTH, LINE_STROKE_WIDTH, LINE_COLOR, RouteCoordinate } from './constants';
import { getXFromLongitude, getYFromLatitude } from './utils/mercator';

interface RouteAnimatorProps {
  startOffset: { x: number; y: number };
  endOffset: { x: number; y: number };
  route?: RouteCoordinate[];
  width: number;
  height: number;
  progress: number;
  zoom?: number;
  center?: { latitude: number; longitude: number };
}

const getPathFromRoute = ({
  route,
  startOffset,
  endOffset,
  width,
  height,
  zoom = 12,
}: {
  route: RouteCoordinate[];
  startOffset: { x: number; y: number };
  endOffset: { x: number; y: number };
  width: number;
  height: number;
  zoom?: number;
}) => {
  if (route.length === 0) return '';
  
  // Convert all route points to mercator projection
  const projectedPoints = route.map(coord => ({
    x: getXFromLongitude(parseFloat(coord.longitude), zoom),
    y: getYFromLatitude(parseFloat(coord.latitude), zoom),
  }));
  
  // Get the first point as reference
  const firstPoint = projectedPoints[0];
  
  // Convert route coordinates to SVG path
  const pathPoints = projectedPoints.map((point, index) => {
    // Calculate relative position from the first point
    const relativeX = point.x - firstPoint.x;
    const relativeY = point.y - firstPoint.y;
    
    // Position relative to center, accounting for the segment offset
    const x = width / 2 + relativeX;
    const y = height / 2 + relativeY;
    
    if (index === 0) {
      return `M ${x} ${y}`;
    }
    return `L ${x} ${y}`;
  });
  
  return pathPoints.join(' ');
};

const getCurvedPath = ({
  width,
  height,
  endOffset,
  startOffset,
}: {
  width: number;
  height: number;
  endOffset: { x: number; y: number };
  startOffset: { x: number; y: number };
}) => {
  const start = [
    width / 2 + startOffset.x,
    height / 2 + startOffset.y,
  ];
  const end = [width / 2 + endOffset.x, height / 2 + endOffset.y];
  
  // Calculate control point for quadratic bezier curve
  const distance = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
  );
  const curveHeight = Math.min(400, distance * 0.3);
  
  const controlPoint = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 - curveHeight,
  ];

  return `M ${start.join(' ')} Q ${controlPoint.join(' ')} ${end.join(' ')}`;
};

export const RouteAnimator: React.FC<RouteAnimatorProps> = ({
  startOffset,
  endOffset,
  route,
  width,
  height,
  progress,
  zoom,
  center,
}) => {
  const pathData = useMemo(() => {
    if (route && route.length > 0) {
      return getPathFromRoute({
        route,
        startOffset,
        endOffset,
        width,
        height,
        zoom,
      });
    }
    
    return getCurvedPath({
      width,
      height,
      endOffset,
      startOffset,
    });
  }, [route, startOffset, endOffset, width, height, zoom]);

  const { strokeDasharray, strokeDashoffset } = evolvePath(progress, pathData);

  return (
    <>
      {/* White stroke background */}
      <AbsoluteFill>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            overflow: 'visible',
          }}
        >
          <path
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            d={pathData}
            fill="none"
            stroke="white"
            strokeWidth={LINE_STROKE_WIDTH}
          />
        </svg>
      </AbsoluteFill>
      
      {/* Colored line */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            overflow: 'visible',
          }}
        >
          <path
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            d={pathData}
            fill="none"
            stroke={LINE_COLOR}
            strokeWidth={LINE_WIDTH}
          />
        </svg>
      </AbsoluteFill>
    </>
  );
};