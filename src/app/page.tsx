"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import { useLocalStorage } from "@uidotdev/usehooks";
import React, { useMemo } from "react";
import {
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { RailwayRouteWithFetch } from "../lib/RailwayRouteAnimation/RailwayRouteWithFetch";
import { RailwayRouteForm } from "../components/RailwayRouteForm";
import { defaultRailwayRouteProps } from "../lib/RailwayRouteAnimation/constants";

const Home: NextPage = () => {
  const defaultFormData = {
    stops: defaultRailwayRouteProps.stops,
    durationInFrames: defaultRailwayRouteProps.durationInFrames,
    animationStartDelay: defaultRailwayRouteProps.animationStartDelay,
    animationDuration: defaultRailwayRouteProps.animationDuration,
    tileStyle: defaultRailwayRouteProps.tileStyle,
    zoom: defaultRailwayRouteProps.zoom,
    fetchRoute: true,
    routeMethod: "openrailway",
    fetchStationCoordinates: false,
    cameraSmoothing: 0.08,
  };

  const [formData, setFormData] = useLocalStorage(
    "railwayRouteFormData",
    defaultFormData
  );

  const inputProps = useMemo(() => {
    return {
      ...formData,
      stops: formData.stops.map((stop: any) => ({
        coordinate: {
          latitude: String(stop.coordinate.latitude),
          longitude: String(stop.coordinate.longitude),
        },
        name: stop.name,
      })),
    };
  }, [formData]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Railway Route Animation Builder
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Player - Left Column */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-8">
              <div className="rounded-lg overflow-hidden shadow-lg border bg-card">
                <Player
                  component={RailwayRouteWithFetch as any}
                  inputProps={inputProps}
                  durationInFrames={
                    formData.durationInFrames || DURATION_IN_FRAMES
                  }
                  fps={VIDEO_FPS}
                  compositionHeight={VIDEO_HEIGHT}
                  compositionWidth={VIDEO_WIDTH}
                  style={{
                    width: "100%",
                    aspectRatio: `${VIDEO_WIDTH} / ${VIDEO_HEIGHT}`,
                  }}
                  controls
                  loop
                />
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Video Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Resolution: {VIDEO_WIDTH}x{VIDEO_HEIGHT} (4K)
                </p>
                <p className="text-sm text-muted-foreground">
                  FPS: {VIDEO_FPS}
                </p>
                <p className="text-sm text-muted-foreground">
                  Duration:{" "}
                  {(formData.durationInFrames || DURATION_IN_FRAMES) /
                    VIDEO_FPS}
                  s
                </p>
              </div>
            </div>
          </div>

          {/* Controls Form - Right Column */}
          <div className="order-1 lg:order-2">
            <div className="bg-card border rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-6">Animation Settings</h2>
              <RailwayRouteForm formData={formData} onChange={setFormData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
