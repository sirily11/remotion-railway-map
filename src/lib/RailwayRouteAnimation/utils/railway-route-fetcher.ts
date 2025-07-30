import { RouteCoordinate } from "../constants";

// Railway route fetching options
export interface RouteOptions {
  method:
    | "straight"
    | "curved"
    | "osm"
    | "overpass"
    | "railway"
    | "openrailway";
  routeProfile?: "driving" | "walking" | "cycling";
  railProfile?: string;
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
  options: RouteOptions = { method: "curved" },
): Promise<RouteCoordinate[]> {
  switch (options.method) {
    case "osm":
      return fetchOSMRoute(
        startLat,
        startLon,
        endLat,
        endLon,
        options.routeProfile,
      );
    case "overpass":
      return fetchOverpassRoute(
        startLat,
        startLon,
        endLat,
        endLon,
        startName,
        endName,
      );
    case "railway":
      return fetchSimpleRailwayRoute(startLat, startLon, endLat, endLon);
    case "openrailway":
      return fetchOpenRailwayRoute(
        startLat,
        startLon,
        endLat,
        endLon,
        options.railProfile,
      );
    case "straight":
      return generateStraightRoute(startLat, startLon, endLat, endLon);
    case "curved":
    default:
      return generateCurvedRoute(startLat, startLon, endLat, endLon);
  }
}

// OpenStreetMap routing using OSRM (Open Source Routing Machine)
async function fetchOSMRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  profile: string = "driving",
): Promise<RouteCoordinate[]> {
  try {
    // OSRM public demo server endpoint
    // Note: For production, consider hosting your own OSRM instance
    const url = `https://router.project-osrm.org/route/v1/${profile}/${startLon},${startLat};${endLon},${endLat}?geometries=geojson&overview=full`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch route from OSRM");
    }

    const data = await response.json();

    // Extract coordinates from OSRM response
    if (data.routes && data.routes[0] && data.routes[0].geometry) {
      const coordinates = data.routes[0].geometry.coordinates;
      return coordinates.map(([lon, lat]: [number, number]) => ({
        longitude: lon,
        latitude: lat,
      }));
    }

    throw new Error("Invalid response from OSRM");
  } catch (error) {
    console.error("OSRM error:", error);
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
  endName: string,
): Promise<RouteCoordinate[]> {
  try {
    // Create bounding box with some padding
    const latPadding = Math.abs(endLat - startLat) * 0.2 + 0.01;
    const lonPadding = Math.abs(endLon - startLon) * 0.2 + 0.01;
    const minLat = Math.min(startLat, endLat) - latPadding;
    const maxLat = Math.max(startLat, endLat) + latPadding;
    const minLon = Math.min(startLon, endLon) - lonPadding;
    const maxLon = Math.max(startLon, endLon) + lonPadding;

    // Enhanced Overpass query to find railway routes and stations
    const query = `
      [out:json][timeout:30];
      (
        // Find railway stations near start and end points
        node["railway"="station"](around:1000,${startLat},${startLon});
        node["railway"="halt"](around:1000,${startLat},${startLon});
        node["railway"="stop"](around:1000,${startLat},${startLon});
      )->.start_stations;
      
      (
        node["railway"="station"](around:1000,${endLat},${endLon});
        node["railway"="halt"](around:1000,${endLat},${endLon});
        node["railway"="stop"](around:1000,${endLat},${endLon});
      )->.end_stations;
      
      // Find all railway tracks in the expanded bounding box
      (
        way["railway"~"^(rail|narrow_gauge|light_rail|subway|tram|preserved)$"]
          (${minLat},${minLon},${maxLat},${maxLon});
        // Also include railway relations (for complex routes)
        relation["railway"="rail"](${minLat},${minLon},${maxLat},${maxLon});
      )->.railways;
      
      // Get all ways that connect our stations
      (
        way.railways(bn.start_stations)(bn.end_stations);
        way.railways(bn.start_stations);
        way.railways(bn.end_stations);
      );
      
      // Get all nodes for visualization
      (._;>;);
      out geom;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from Overpass API");
    }

    const data = await response.json();

    if (!data.elements || data.elements.length === 0) {
      console.log("No railway tracks found in the area");
      return generateCurvedRoute(startLat, startLon, endLat, endLon);
    }

    // Find the railway segments closest to start and end points
    const ways = data.elements.filter(
      (el: any) => el.type === "way" && el.geometry,
    );

    if (ways.length === 0) {
      return generateCurvedRoute(startLat, startLon, endLat, endLon);
    }

    // Process railway ways to build a connected route
    const wayMap = new Map<string, any>();
    const nodeToWays = new Map<string, string[]>();

    // Build graph of ways and their connections
    ways.forEach((way: any) => {
      wayMap.set(way.id.toString(), way);
      if (way.nodes) {
        way.nodes.forEach((nodeId: number) => {
          const nodeIdStr = nodeId.toString();
          if (!nodeToWays.has(nodeIdStr)) {
            nodeToWays.set(nodeIdStr, []);
          }
          nodeToWays.get(nodeIdStr)!.push(way.id.toString());
        });
      }
    });

    // Find ways closest to start and end
    let startWay: any = null;
    let endWay: any = null;
    let minStartDist = Infinity;
    let minEndDist = Infinity;

    for (const way of ways) {
      if (!way.geometry) continue;

      for (const node of way.geometry) {
        const distToStart = getDistance(startLat, startLon, node.lat, node.lon);
        const distToEnd = getDistance(endLat, endLon, node.lat, node.lon);

        if (distToStart < minStartDist) {
          minStartDist = distToStart;
          startWay = way;
        }

        if (distToEnd < minEndDist) {
          minEndDist = distToEnd;
          endWay = way;
        }
      }
    }

    // If we found both start and end ways, try to find a path
    if (startWay && endWay) {
      // Simple case: same way
      if (startWay.id === endWay.id && startWay.geometry) {
        const coords = startWay.geometry.map((node: any) => ({
          latitude: node.lat,
          longitude: node.lon,
        }));

        // Find closest points on the way to start and end
        let startIdx = 0;
        let endIdx = coords.length - 1;
        let minStartDist = Infinity;
        let minEndDist = Infinity;

        coords.forEach((coord: RouteCoordinate, idx: number) => {
          const distToStart = getDistance(
            startLat,
            startLon,
            coord.latitude,
            coord.longitude,
          );
          const distToEnd = getDistance(
            endLat,
            endLon,
            coord.latitude,
            coord.longitude,
          );

          if (distToStart < minStartDist) {
            minStartDist = distToStart;
            startIdx = idx;
          }

          if (distToEnd < minEndDist) {
            minEndDist = distToEnd;
            endIdx = idx;
          }
        });

        // Return the segment between start and end
        if (startIdx <= endIdx) {
          return coords.slice(startIdx, endIdx + 1);
        } else {
          return coords.slice(endIdx, startIdx + 1).reverse();
        }
      }

      // Different ways: try to find connected path (simplified)
      // For now, just combine both ways
      const combinedCoords: RouteCoordinate[] = [];

      if (startWay.geometry) {
        startWay.geometry.forEach((node: any) => {
          combinedCoords.push({
            latitude: node.lat,
            longitude: node.lon,
          });
        });
      }

      if (endWay.geometry && endWay.id !== startWay.id) {
        endWay.geometry.forEach((node: any) => {
          combinedCoords.push({
            latitude: node.lat,
            longitude: node.lon,
          });
        });
      }

      if (combinedCoords.length > 0) {
        return combinedCoords;
      }
    }

    // Fallback to curved route
    return generateCurvedRoute(startLat, startLon, endLat, endLon);
  } catch (error) {
    console.error("Overpass API error:", error);
    return generateCurvedRoute(startLat, startLon, endLat, endLon);
  }
}

// Helper function to calculate distance between two points
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// OpenRailway API - dedicated railway routing service
async function fetchOpenRailwayRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  profile: string = "all_tracks",
): Promise<RouteCoordinate[]> {
  try {
    // OpenRailway uses GraphHopper routing engine with railway data
    // Note: This is a conceptual implementation - you may need an API key
    const url = `https://routing.openrailrouting.org/route?point=${startLat},${startLon}&point=${endLat},${endLon}&profile=${"all_tracks"}&locale=en&elevation=false&instructions=false&points_encoded=false`;

    const response = await fetch(url);
    if (!response.ok) {
      console.log("OpenRailway API not available, falling back to Overpass");
      return fetchSimpleRailwayRoute(startLat, startLon, endLat, endLon);
    }

    const data = await response.json();

    // Extract coordinates from response
    if (data.paths && data.paths[0] && data.paths[0].points) {
      const coordinates = data.paths[0].points.coordinates;
      return coordinates.map(([lon, lat]: [number, number]) => ({
        longitude: lon,
        latitude: lat,
      }));
    }

    throw new Error("Invalid response from OpenRailway");
  } catch (error) {
    console.error("OpenRailway error:", error);
    // Fallback to simple railway route
    return fetchSimpleRailwayRoute(startLat, startLon, endLat, endLon);
  }
}

// Simplified railway-only route fetcher
async function fetchSimpleRailwayRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
): Promise<RouteCoordinate[]> {
  try {
    // Calculate bounding box
    const latPadding = Math.abs(endLat - startLat) * 0.1 + 0.005;
    const lonPadding = Math.abs(endLon - startLon) * 0.1 + 0.005;
    const minLat = Math.min(startLat, endLat) - latPadding;
    const maxLat = Math.max(startLat, endLat) + latPadding;
    const minLon = Math.min(startLon, endLon) - lonPadding;
    const maxLon = Math.max(startLon, endLon) + lonPadding;

    // Simple query for just railway tracks
    const query = `
      [out:json][timeout:25];
      // Get all railway tracks in the area
      way["railway"~"^(rail|light_rail|subway|narrow_gauge|tram)$"]
        (${minLat},${minLon},${maxLat},${maxLon});
      out geom;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch railway data");
    }

    const data = await response.json();

    if (!data.elements || data.elements.length === 0) {
      console.log("No railway tracks found");
      return generateCurvedRoute(startLat, startLon, endLat, endLon);
    }

    // Find the railway track closest to both start and end points
    let bestWay: any = null;
    let bestScore = Infinity;

    for (const way of data.elements) {
      if (!way.geometry) continue;

      let minDistToStart = Infinity;
      let minDistToEnd = Infinity;
      let startIdx = 0;
      let endIdx = way.geometry.length - 1;

      // Find closest points on this track to start and end
      way.geometry.forEach((node: any, idx: number) => {
        const distToStart = getDistance(startLat, startLon, node.lat, node.lon);
        const distToEnd = getDistance(endLat, endLon, node.lat, node.lon);

        if (distToStart < minDistToStart) {
          minDistToStart = distToStart;
          startIdx = idx;
        }

        if (distToEnd < minDistToEnd) {
          minDistToEnd = distToEnd;
          endIdx = idx;
        }
      });

      // Score based on how close the track passes to both points
      const score = minDistToStart + minDistToEnd;

      // Only consider tracks that are reasonably close to both points (within ~500m)
      if (score < bestScore && minDistToStart < 0.5 && minDistToEnd < 0.5) {
        bestScore = score;
        bestWay = { way, startIdx, endIdx };
      }
    }

    if (bestWay) {
      const { way, startIdx, endIdx } = bestWay;
      const coords = way.geometry.map((node: any) => ({
        latitude: node.lat,
        longitude: node.lon,
      }));

      // Return the segment between start and end
      if (startIdx <= endIdx) {
        return coords.slice(startIdx, endIdx + 1);
      } else {
        return coords.slice(endIdx, startIdx + 1).reverse();
      }
    }

    // Fallback: return all railway tracks in the area for visualization
    const allRailwayCoords: RouteCoordinate[] = [];
    data.elements.forEach((way: any) => {
      if (way.geometry) {
        way.geometry.forEach((node: any) => {
          allRailwayCoords.push({
            latitude: node.lat,
            longitude: node.lon,
          });
        });
      }
    });

    if (allRailwayCoords.length > 0) {
      console.log("Returning all railway tracks in area");
      return allRailwayCoords;
    }

    // Final fallback
    return generateCurvedRoute(startLat, startLon, endLat, endLon);
  } catch (error) {
    console.error("Railway route fetch error:", error);
    return generateCurvedRoute(startLat, startLon, endLat, endLon);
  }
}

// Generate a straight line route
function generateStraightRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  points: number = 100,
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
  points: number = 100,
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
export async function fetchStationByName(
  stationName: string,
): Promise<StationInfo | null> {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["railway"="station"]["name"~"${stationName}",i];
        node["railway"="halt"]["name"~"${stationName}",i];
      );
      out body;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch station data");
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
    console.error("Error fetching station:", error);
    return null;
  }
}
