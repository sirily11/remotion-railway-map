import { Point } from './geo-utils';
import { interpolate } from 'remotion';

interface SmoothingOptions {
  smoothingFactor?: number;
  lookaheadDistance?: number;
  dampingFactor?: number;
}

export const smoothCameraPath = (
  points: Point[],
  currentProgress: number,
  options: SmoothingOptions = {}
): Point => {
  const {
    smoothingFactor = 0.3,
    lookaheadDistance = 0.1,
  } = options;

  if (points.length === 0) {
    throw new Error('No points provided for camera path');
  }

  if (points.length === 1) {
    return points[0];
  }

  // Calculate the exact position along the path
  const totalSegments = points.length - 1;
  const exactIndex = currentProgress * totalSegments;
  const currentIndex = Math.floor(exactIndex);
  const nextIndex = Math.min(currentIndex + 1, points.length - 1);
  const localProgress = exactIndex - currentIndex;

  // Get current interpolated position
  const currentPoint = points[currentIndex];
  const nextPoint = points[nextIndex];
  
  const basePosition = {
    latitude: interpolate(
      localProgress,
      [0, 1],
      [currentPoint.latitude, nextPoint.latitude]
    ),
    longitude: interpolate(
      localProgress,
      [0, 1],
      [currentPoint.longitude, nextPoint.longitude]
    ),
  };

  // Apply lookahead for smoother transitions
  const lookaheadProgress = Math.min(currentProgress + lookaheadDistance, 1);
  const lookaheadExactIndex = lookaheadProgress * totalSegments;
  const lookaheadIndex = Math.floor(lookaheadExactIndex);
  const lookaheadNextIndex = Math.min(lookaheadIndex + 1, points.length - 1);
  const lookaheadLocalProgress = lookaheadExactIndex - lookaheadIndex;

  const lookaheadCurrent = points[lookaheadIndex];
  const lookaheadNext = points[lookaheadNextIndex];

  const lookaheadPosition = {
    latitude: interpolate(
      lookaheadLocalProgress,
      [0, 1],
      [lookaheadCurrent.latitude, lookaheadNext.latitude]
    ),
    longitude: interpolate(
      lookaheadLocalProgress,
      [0, 1],
      [lookaheadCurrent.longitude, lookaheadNext.longitude]
    ),
  };

  // Blend between base position and lookahead position
  const smoothedPosition = {
    latitude: basePosition.latitude * (1 - smoothingFactor) + lookaheadPosition.latitude * smoothingFactor,
    longitude: basePosition.longitude * (1 - smoothingFactor) + lookaheadPosition.longitude * smoothingFactor,
  };

  return {
    latitude: smoothedPosition.latitude,
    longitude: smoothedPosition.longitude,
  };
};

export const applyCameraSmoothing = (
  currentCenter: Point,
  targetCenter: Point,
  smoothingStrength: number = 0.15
): Point => {
  // Exponential smoothing between current and target positions
  const smoothedLat = currentCenter.latitude * (1 - smoothingStrength) + 
                     targetCenter.latitude * smoothingStrength;
  const smoothedLon = currentCenter.longitude * (1 - smoothingStrength) + 
                     targetCenter.longitude * smoothingStrength;

  return {
    latitude: smoothedLat,
    longitude: smoothedLon,
  };
};

export const sampleRoutePoints = (
  points: Point[],
  targetSampleCount: number = 20
): Point[] => {
  if (points.length <= targetSampleCount) {
    // If we already have fewer points than the target, return all points
    return points;
  }

  const sampledPoints: Point[] = [];
  const stepSize = (points.length - 1) / (targetSampleCount - 1);

  // Always include the first point
  sampledPoints.push(points[0]);

  // Sample intermediate points
  for (let i = 1; i < targetSampleCount - 1; i++) {
    const index = Math.round(i * stepSize);
    sampledPoints.push(points[index]);
  }

  // Always include the last point
  sampledPoints.push(points[points.length - 1]);

  return sampledPoints;
};

export const bezierSmoothing = (
  points: Point[],
  progress: number,
  tension: number = 0.3
): Point => {
  if (points.length < 3) {
    // Not enough points for bezier smoothing
    return smoothCameraPath(points, progress);
  }

  const totalSegments = points.length - 1;
  const exactIndex = progress * totalSegments;
  const currentIndex = Math.floor(exactIndex);
  const localProgress = exactIndex - currentIndex;

  // Get control points for Bezier curve
  const p0 = points[Math.max(0, currentIndex - 1)];
  const p1 = points[currentIndex];
  const p2 = points[Math.min(currentIndex + 1, points.length - 1)];
  const p3 = points[Math.min(currentIndex + 2, points.length - 1)];

  // Calculate Catmull-Rom spline (a type of cubic Bezier curve)
  const t = localProgress;
  const t2 = t * t;
  const t3 = t2 * t;

  const v0 = {
    lat: p0.latitude,
    lon: p0.longitude,
  };
  const v1 = {
    lat: p1.latitude,
    lon: p1.longitude,
  };
  const v2 = {
    lat: p2.latitude,
    lon: p2.longitude,
  };
  const v3 = {
    lat: p3.latitude,
    lon: p3.longitude,
  };

  const latitude = 0.5 * (
    (2 * v1.lat) +
    (-v0.lat + v2.lat) * t +
    (2 * v0.lat - 5 * v1.lat + 4 * v2.lat - v3.lat) * t2 +
    (-v0.lat + 3 * v1.lat - 3 * v2.lat + v3.lat) * t3
  );

  const longitude = 0.5 * (
    (2 * v1.lon) +
    (-v0.lon + v2.lon) * t +
    (2 * v0.lon - 5 * v1.lon + 4 * v2.lon - v3.lon) * t2 +
    (-v0.lon + 3 * v1.lon - 3 * v2.lon + v3.lon) * t3
  );

  return {
    latitude: latitude,
    longitude: longitude,
  };
};