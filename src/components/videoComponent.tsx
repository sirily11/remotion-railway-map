"use client";

import { defaultRailwayRouteProps } from "@/lib/RailwayRouteAnimation/constants";
import { RailwayRouteWithFetch } from "@/lib/RailwayRouteAnimation/RailwayRouteWithFetch";
import { Player } from "@remotion/player";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useMemo, useState } from "react";
import {
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { RailwayRouteForm } from "./RailwayRouteForm";
import { CanvasFireworks } from "./CanvasFireworks";

export const VideoComponent = () => {
  const [showUpdateAnimation, setShowUpdateAnimation] = useState(false);

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
    cameraSmoothing: 0.2,
  };

  const [formData, setFormData] = useLocalStorage(
    "railwayRouteFormData",
    defaultFormData,
  );

  const handleFormChange = (newData: any) => {
    setFormData(newData);
    // Show firework animation
    setShowUpdateAnimation(false);
    setTimeout(() => {
      setShowUpdateAnimation(true);
      setTimeout(() => setShowUpdateAnimation(false), 1000);
    }, 10);
  };

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
    <div className="min-h-screen relative">
      <div className="container mx-auto py-8">
        <h1 className="text-6xl font-bold mb-8 text-center font-[family-name:var(--font-bubblegum)] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
          🚂 Railway Journey Animation
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Player - Left Column */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-8">
              <div
                className="rounded-3xl overflow-hidden shadow-lg border-4 bg-card relative transform hover:scale-[1.02] transition-transform duration-300"
                style={{
                  borderWidth: "4px",
                  borderColor: "#FFB6C1",
                  boxShadow: "0 10px 40px rgba(255, 182, 193, 0.3)",
                }}
              >
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

                {/* Canvas Firework Effect */}
                <CanvasFireworks trigger={showUpdateAnimation} />
              </div>

              <div
                className="mt-4 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-3 relative overflow-hidden"
                style={{ borderWidth: "3px", borderColor: "#E6B8FF" }}
              >
                <h3 className="font-bold text-lg mb-3 font-[family-name:var(--font-fredoka)]">
                  Video Settings
                </h3>
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
            <div
              className="bg-gradient-to-br from-yellow-50 to-pink-50 border-4 rounded-3xl p-8 shadow-lg relative overflow-hidden transform hover:scale-[1.01] transition-transform duration-300"
              style={{
                borderWidth: "4px",
                borderColor: "#FFDAB9",
                boxShadow: "0 10px 40px rgba(255, 218, 185, 0.3)",
              }}
            >
              <h2 className="text-2xl font-bold mb-6 font-[family-name:var(--font-fredoka)] text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                Route Settings
              </h2>
              <RailwayRouteForm
                formData={formData}
                onChange={handleFormChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
