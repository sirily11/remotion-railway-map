import { Position, RouteCoordinate } from "../constants";

export interface Point {
  latitude: number;
  longitude: number;
}

// Calculate distance between two points using Haversine formula
export const getDistanceBetweenTwoPoints = (
  start: Point,
  end: Point,
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (end.latitude - start.latitude) * (Math.PI / 180);
  const dLon = (end.longitude - start.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(start.latitude * (Math.PI / 180)) *
      Math.cos(end.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// Get closer endpoint for better map centering
export const getCloserEndPoint = (start: Point, end: Point): Point => {
  const distance = getDistanceBetweenTwoPoints(start, end);

  if (distance > 20000) {
    // If points are on opposite sides of the world, adjust longitude
    const adjustedEnd = { ...end };
    if (Math.abs(start.longitude - end.longitude) > 180) {
      if (start.longitude > end.longitude) {
        adjustedEnd.longitude = end.longitude + 360;
      } else {
        adjustedEnd.longitude = end.longitude - 360;
      }
    }
    return adjustedEnd;
  }

  return end;
};

// Calculate optimal zoom level based on distance
export const calculateZoom = (start: Point, end: Point): number => {
  return 14;
};

// Convert Position to Point
export const positionToPoint = (position: Position): Point => ({
  latitude: parseFloat(position.coordinate.latitude),
  longitude: parseFloat(position.coordinate.longitude),
});

// Convert RouteCoordinate to Point
export const routeCoordinateToPoint = (coord: RouteCoordinate): Point => ({
  latitude: parseFloat(coord.latitude),
  longitude: parseFloat(coord.longitude),
});

// Get label position based on relative positions
export const getLabelPosition = (
  point1: Point,
  point2: Point,
  isStart: boolean,
): "top" | "bottom" | "left" | "right" => {
  if (isStart) {
    return point1.latitude > point2.latitude ? "top" : "bottom";
  } else {
    return point2.latitude > point1.latitude ? "top" : "bottom";
  }
};
