import { RouteCoordinate } from '../constants';

// Railway route fetching options
export interface RouteOptions {
  method: 'straight' | 'curved' | 'openrailrouting' | 'overpass';
  railProfile?: 'tgv_all' | 'non_tgv' | 'tramtrain' | 'all_tracks' | 'all_tracks_1435';
}

// Station info for Overpass API
interface StationInfo {
  name: string;
  lat: number;
  lon: number;
  id?: string;
}

// Fetch railway route between two stations
export async function fetchRailwayRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  startName: string,
  endName: string,
  options: RouteOptions = { method: 'curved' }
): Promise<RouteCoordinate[]> {
  switch (options.method) {
    case 'openrailrouting':
      return fetchOpenRailRoute(startLat, startLon, endLat, endLon, options.railProfile);
    case 'overpass':
      return fetchOverpassRoute(startLat, startLon, endLat, endLon, startName, endName);
    case 'straight':
      return generateStraightRoute(startLat, startLon, endLat, endLon);
    case 'curved':
    default:
      return generateCurvedRoute(startLat, startLon, endLat, endLon);
  }
}

// OpenRailRouting API (powered by GraphHopper)
async function fetchOpenRailRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  profile: string = 'all_tracks'
): Promise<RouteCoordinate[]> {
  try {
    // OpenRailRouting API endpoint
    // Available profiles: tgv_all, non_tgv, tramtrain, all_tracks, all_tracks_1435
    const url = `https://routing.openrailrouting.org/route?point=${startLat},${startLon}&point=${endLat},${endLon}&profile=${profile}&locale=en&elevation=false&instructions=false`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch route from OpenRailRouting');
    }
    
    const data = await response.json();
    
    // Extract coordinates from GraphHopper response
    if (data.paths && data.paths[0] && data.paths[0].points) {
      const coordinates = data.paths[0].points.coordinates;
      return coordinates.map(([lon, lat]: [number, number]) => ({
        longitude: lon,
        latitude: lat,
      }));
    }
    
    throw new Error('Invalid response from OpenRailRouting');
  } catch (error) {
    console.error('OpenRailRouting error:', error);
    // Fallback to curved route
    return generateCurvedRoute(startLat, startLon, endLat, endLon);
  }
}

// Overpass API to find railway tracks between stations
async function fetchOverpassRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  startName: string,
  endName: string
): Promise<RouteCoordinate[]> {
  try {
    // Create bounding box
    const minLat = Math.min(startLat, endLat) - 0.1;
    const maxLat = Math.max(startLat, endLat) + 0.1;
    const minLon = Math.min(startLon, endLon) - 0.1;
    const maxLon = Math.max(startLon, endLon) + 0.1;
    
    // Overpass query to find railway ways between stations
    const query = `
      [out:json][timeout:25];
      (
        // Find railway tracks in the bounding box
        way["railway"~"rail|narrow_gauge|light_rail"]
          (${minLat},${minLon},${maxLat},${maxLon});
      );
      (._;>;);
      out geom;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch data from Overpass API');
    }
    
    const data = await response.json();
    
    // Process the railway ways to find a route
    // This is simplified - in reality you'd need path finding
    const wayNodes: RouteCoordinate[] = [];
    
    if (data.elements) {
      // Extract all nodes from ways
      data.elements
        .filter((el: any) => el.type === 'way' && el.geometry)
        .forEach((way: any) => {
          way.geometry.forEach((node: any) => {
            wayNodes.push({
              latitude: node.lat,
              longitude: node.lon,
            });
          });
        });
    }
    
    // If we found railway tracks, return them
    if (wayNodes.length > 0) {
      return wayNodes;
    }
    
    // Fallback to curved route
    return generateCurvedRoute(startLat, startLon, endLat, endLon);
  } catch (error) {
    console.error('Overpass API error:', error);
    return generateCurvedRoute(startLat, startLon, endLat, endLon);
  }
}

// Generate a straight line route
function generateStraightRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  points: number = 100
): RouteCoordinate[] {
  const route: RouteCoordinate[] = [];
  
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    route.push({
      latitude: startLat + (endLat - startLat) * t,
      longitude: startLon + (endLon - startLon) * t,
    });
  }
  
  return route;
}

// Generate a curved route (quadratic bezier)
function generateCurvedRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  points: number = 100
): RouteCoordinate[] {
  const route: RouteCoordinate[] = [];
  
  // Calculate control point for curve
  const midLat = (startLat + endLat) / 2;
  const midLon = (startLon + endLon) / 2;
  
  // Offset the control point perpendicular to the line
  const dx = endLon - startLon;
  const dy = endLat - startLat;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const offset = distance * 0.2; // 20% offset
  
  // Perpendicular vector
  const perpX = -dy / distance;
  const perpY = dx / distance;
  
  const controlLat = midLat + perpY * offset;
  const controlLon = midLon + perpX * offset;
  
  // Generate bezier curve points
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const t1 = 1 - t;
    
    // Quadratic bezier formula
    const lat = t1 * t1 * startLat + 2 * t1 * t * controlLat + t * t * endLat;
    const lon = t1 * t1 * startLon + 2 * t1 * t * controlLon + t * t * endLon;
    
    route.push({
      latitude: lat,
      longitude: lon,
    });
  }
  
  return route;
}

// Fetch station coordinates by name (using Overpass)
export async function fetchStationByName(stationName: string): Promise<StationInfo | null> {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["railway"="station"]["name"~"${stationName}",i];
        node["railway"="halt"]["name"~"${stationName}",i];
      );
      out body;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch station data');
    }
    
    const data = await response.json();
    
    if (data.elements && data.elements.length > 0) {
      const station = data.elements[0];
      return {
        name: station.tags.name,
        lat: station.lat,
        lon: station.lon,
        id: station.id,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching station:', error);
    return null;
  }
}