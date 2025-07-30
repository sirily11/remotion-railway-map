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
              coordinate: { latitude: 35.4687988, longitude: 135.3951224 },
              name: "Higashi Maizuru Station",
            },
            {
              coordinate: { latitude: 35.3023425, longitude: 135.2523702 },
              name: "Ayabe Station",
            },
            {
              coordinate: { latitude: 35.2991, longitude: 135.1957 },
              name: "Fukuchiyama Station",
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
        id="MultiStopRailwayRoute"
        component={RailwayRouteAnimation}
        durationInFrames={defaultRailwayRouteProps.durationInFrames}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          stops: [
            {
              coordinate: { latitude: 35.6762, longitude: 139.6503 },
              name: "Tokyo Station",
            },
            {
              coordinate: { latitude: 35.1033, longitude: 138.86 },
              name: "Atami Station",
            },
          ],
          durationInFrames: 300,
          animationStartDelay: 30,
          animationDuration: 240,
          tileStyle: "osm" as const,
          zoom: 8,
        }}
        schema={RailwayRouteCompositionProps}
      />
    </>
  );
};
