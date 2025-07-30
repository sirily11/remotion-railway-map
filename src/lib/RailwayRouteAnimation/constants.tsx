import { z } from "zod";

// Position with coordinate and name
const position = z.object({
  coordinate: z.object({
    longitude: z.number(),
    latitude: z.number(),
  }),
  name: z.string(),
});

// Route coordinate
const routeCoordinate = z.object({
  longitude: z.number(),
  latitude: z.number(),
});

export type Position = z.infer<typeof position>;
export type RouteCoordinate = z.infer<typeof routeCoordinate>;

// Tile style options
export const TileStyle = z.enum([
  "watercolor", // Artistic watercolor style
  "dark", // Dark theme (StadiaMaps - has limits)
  "darkMatter", // Dark theme (CartoDB - free)
  "positron", // Light theme (CartoDB - free)
  "toner", // High contrast B&W (StadiaMaps - has limits)
  "terrain", // Terrain with elevation (StadiaMaps - has limits)
  "satellite", // Satellite imagery (ArcGIS)
  "osm", // OpenStreetMap standard (free, no limits)
  "osmBright", // Bright OSM style (StadiaMaps - has limits)
]);
export type TileStyle = z.infer<typeof TileStyle>;

// Route fetching methods
export const RouteMethod = z.enum([
  "straight", // Direct straight line
  "curved", // Smooth bezier curve
  "osm", // Road routing via OSRM
  "overpass", // Actual railway tracks from OpenStreetMap
  "railway", // Simplified railway-only routing
  "openrailway", // OpenRailway API for rail-specific routing
]);
export type RouteMethod = z.infer<typeof RouteMethod>;

// Composition props
export const RailwayRouteCompositionProps = z.object({
  stops: z
    .array(position)
    .min(2)
    .describe("Array of stops along the journey (minimum 2)"),
  segments: z
    .array(z.array(routeCoordinate))
    .optional()
    .describe("Optional pre-defined route segments between stops"),
  durationInFrames: z
    .number()
    .min(30)
    .default(500)
    .describe("Total duration of the animation in frames"),
  animationStartDelay: z
    .number()
    .min(0)
    .default(30)
    .describe("Delay before animation starts (in frames)"),
  animationDuration: z
    .number()
    .min(30)
    .default(120)
    .describe("Duration of the route animation (in frames)"),
  tileStyle: TileStyle.default("osm").describe("Map tile style"),
  zoom: z
    .number()
    .min(1)
    .max(20)
    .optional()
    .describe("Map zoom level (1-20). Auto-calculated if not provided"),
});

// Extended props with fetching capabilities
export const RailwayRouteWithFetchCompositionProps =
  RailwayRouteCompositionProps.extend({
    fetchRoute: z
      .boolean()
      .default(true)
      .describe("Fetch actual routes between stops"),
    routeMethod: RouteMethod.default("railway").describe(
      "Method to fetch routes",
    ),
    fetchStationCoordinates: z
      .boolean()
      .default(false)
      .describe("Fetch station coordinates by name"),
  });

export type RailwayRouteProps = z.infer<typeof RailwayRouteCompositionProps>;
export type RailwayRouteWithFetchProps = z.infer<
  typeof RailwayRouteWithFetchCompositionProps
>;

// Default example props - Multiple stops journey
export const defaultRailwayRouteProps: RailwayRouteProps = {
  stops: [
    {
      coordinate: {
        latitude: 35.4687988,
        longitude: 135.3951224,
      },
      name: "Higashi Maizuru Station",
    },
    {
      coordinate: {
        latitude: 35.3023425,
        longitude: 135.2523702,
      },
      name: "Ayabe Station",
    },
  ],
  durationInFrames: 600,
  animationStartDelay: 30,
  animationDuration: 180,
  tileStyle: "osm",
  zoom: 15,
};

// Animation constants
export const LABEL_FONT_SIZE = 40;
export const LABEL_MARGIN_TOP = 90;
export const MARKER_SIZE = 40;
export const LINE_WIDTH = 8;
export const LINE_STROKE_WIDTH = 20;
export const LINE_COLOR = "#0066ff";
export const TILE_SIZE = 256;
