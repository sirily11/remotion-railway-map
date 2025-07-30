import { Composition } from "remotion";
import { Main } from "./MyComp/Main";
import {
  COMP_NAME,
  defaultMyCompProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { NextLogo } from "./MyComp/NextLogo";
import { RailwayRouteAnimation } from "../lib/RailwayRouteAnimation/RailwayRouteAnimation";
import { RailwayRouteWithFetch } from "../lib/RailwayRouteAnimation/RailwayRouteWithFetch";
import {
  RailwayRouteCompositionProps,
  RailwayRouteWithFetchCompositionProps,
  defaultRailwayRouteProps,
} from "../lib/RailwayRouteAnimation/constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={COMP_NAME}
        component={Main}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultMyCompProps}
      />
      <Composition
        id="NextLogo"
        component={NextLogo}
        durationInFrames={300}
        fps={30}
        width={140}
        height={140}
        defaultProps={{
          outProgress: 0,
        }}
      />
      <Composition
        id="RailwayRoute"
        component={RailwayRouteAnimation}
        durationInFrames={4000}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultRailwayRouteProps}
        schema={RailwayRouteCompositionProps}
      />
      <Composition
        id="RailwayRouteWithFetch"
        component={RailwayRouteWithFetch as any}
        durationInFrames={defaultRailwayRouteProps.durationInFrames}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          stops: [
            {
              coordinate: {
                latitude: "35.64498400968528",
                longitude: "136.07688359750063",
              },
              name: "Tsuruga Station",
            },
            {
              coordinate: {
                latitude: "35.46872006058003",
                longitude: "135.3953369974494",
              },
              name: "Higashi-Maizuru Station",
            },
          ],
          durationInFrames: 600,
          animationStartDelay: 30,
          animationDuration: 500,
          tileStyle: "osm" as const,
          fetchRoute: true,
          routeMethod: "openrailway" as const,
          zoom: 15,
        }}
        schema={RailwayRouteWithFetchCompositionProps}
      />
      <Composition
        id="MountainRouteSmooth"
        component={RailwayRouteWithFetch as any}
        durationInFrames={900}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          stops: [
            {
              coordinate: {
                latitude: "36.5748441",
                longitude: "137.6629677",
              },
              name: "Toyama Station",
            },
            {
              coordinate: {
                latitude: "36.7012011",
                longitude: "137.2137071",
              },
              name: "Takayama Station",
            },
          ],
          durationInFrames: 900,
          animationStartDelay: 30,
          animationDuration: 800,
          tileStyle: "terrain" as const,
          fetchRoute: true,
          routeMethod: "openrailway" as const,
          zoom: 10,
          cameraSmoothing: 0.12, // Higher smoothing for mountain routes
        }}
        schema={RailwayRouteWithFetchCompositionProps}
      />
      <Composition
        id="MountainRouteShaky"
        component={RailwayRouteWithFetch as any}
        durationInFrames={900}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          stops: [
            {
              coordinate: {
                latitude: "36.5748441",
                longitude: "137.6629677",
              },
              name: "Toyama Station",
            },
            {
              coordinate: {
                latitude: "36.7012011",
                longitude: "137.2137071",
              },
              name: "Takayama Station",
            },
          ],
          durationInFrames: 900,
          animationStartDelay: 30,
          animationDuration: 800,
          tileStyle: "terrain" as const,
          fetchRoute: true,
          routeMethod: "openrailway" as const,
          zoom: 10,
          cameraSmoothing: 0.0, // No smoothing (original behavior)
        }}
        schema={RailwayRouteWithFetchCompositionProps}
      />
    </>
  );
};
