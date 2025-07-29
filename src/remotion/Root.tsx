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
        durationInFrames={defaultRailwayRouteProps.durationInFrames}
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
          startPosition: {
            coordinate: { latitude: 35.4687988, longitude: 135.3951224 },
            name: "Higashi Maizuru Station",
          },
          endPosition: {
            coordinate: { latitude: 35.3023425, longitude: 135.2523702 },
            name: "Ayabe Station",
          },
          durationInFrames: 200,
          animationStartDelay: 30,
          animationDuration: 120,
          renderType: "mapbox" as const,
          mapboxStyle: "dark" as const,
          tileStyle: "dark" as const,
          fetchRoute: true,
          routeMethod: "openrailrouting" as const,
          mapboxZoom: 30,
          mapboxAltitude: 10000,
        }}
        schema={RailwayRouteWithFetchCompositionProps}
      />
    </>
  );
};
