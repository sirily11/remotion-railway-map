import { z } from "zod";

// Position with coordinate and name
const position = z.object({
  coordinate: z.object({
    longitude: z.number().step(0.0000001),
    latitude: z.number().step(0.0000001),
  }),
  name: z.string(),
});

// Route coordinate
const routeCoordinate = z.object({
  longitude: z.number().step(0.0000001),
  latitude: z.number().step(0.0000001),
});

export type Position = z.infer<typeof position>;
export type RouteCoordinate = z.infer<typeof routeCoordinate>;

// Map render types
export const MapRenderType = z.enum(["tiles", "mapbox"]);
export type MapRenderType = z.infer<typeof MapRenderType>;

// Mapbox style options
export const MapboxStyle = z.enum([
  "dark",
  "satellite",
  "navigation",
  "blueprint",
  "custom",
]);
export type MapboxStyle = z.infer<typeof MapboxStyle>;

// Tile style options
export const TileStyle = z.enum([
  "watercolor",
  "dark",
  "darkMatter",
  "positron",
  "toner",
  "terrain",
  "satellite",
  "osm",
  "osmBright",
]);
export type TileStyle = z.infer<typeof TileStyle>;

// Route fetching methods
export const RouteMethod = z.enum([
  "straight",
  "curved",
  "openrailrouting",
  "overpass",
]);
export type RouteMethod = z.infer<typeof RouteMethod>;

// Composition props
export const RailwayRouteCompositionProps = z.object({
  startPosition: position,
  endPosition: position,
  route: z.array(routeCoordinate).optional(),
  durationInFrames: z.number().min(30).default(500),
  animationStartDelay: z.number().min(0).default(30),
  animationDuration: z.number().min(30).default(120),
  renderType: MapRenderType.default("tiles"),
  mapboxStyle: MapboxStyle.default("dark"),
  tileStyle: TileStyle.default("dark"),
  mapboxZoom: z.number().min(0).max(100).default(10).optional(),
  mapboxAltitude: z.number().min(0).default(50000).optional(),
});

// Extended props with fetching capabilities
export const RailwayRouteWithFetchCompositionProps =
  RailwayRouteCompositionProps.extend({
    fetchRoute: z.boolean().default(false),
    routeMethod: RouteMethod.default("openrailrouting"),
    fetchStationCoordinates: z.boolean().default(false),
  });

export type RailwayRouteProps = z.infer<typeof RailwayRouteCompositionProps>;
export type RailwayRouteWithFetchProps = z.infer<
  typeof RailwayRouteWithFetchCompositionProps
>;

// Default example props - Higashi Maizuru to Ayabe
export const defaultRailwayRouteProps: RailwayRouteProps = {
  startPosition: {
    coordinate: {
      latitude: 35.4687988,
      longitude: 135.3951224,
    },
    name: "Higashi Maizuru Station",
  },
  endPosition: {
    coordinate: {
      latitude: 35.3023425,
      longitude: 135.2523702,
    },
    name: "Ayabe Station",
  },
  durationInFrames: 200,
  animationStartDelay: 30,
  animationDuration: 120,
  renderType: "tiles",
  mapboxStyle: "dark",
  tileStyle: "dark",
};

// Animation constants
export const LABEL_FONT_SIZE = 40;
export const LABEL_MARGIN_TOP = 90;
export const MARKER_SIZE = 40;
export const LINE_WIDTH = 8;
export const LINE_STROKE_WIDTH = 20;
export const LINE_COLOR = "#0066ff";
export const TILE_SIZE = 256;
