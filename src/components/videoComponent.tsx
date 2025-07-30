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
import { FlyingEmojis } from "./FlyingEmojis";

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
      <FlyingEmojis />
      <div className="container mx-auto py-8">
        <h1 className="text-6xl font-bold mb-8 text-center relative">
          <span className="inline-block animate-bounce" style={{ animationDelay: "0s" }}>🌸</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: "0.1s" }}> </span>
          <span className="inline-block animate-bounce" style={{ animationDelay: "0.2s" }}>🚂</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: "0.3s" }}> </span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400" style={{ animationDelay: "0.4s" }}>R</span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400" style={{ animationDelay: "0.5s" }}>a</span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400" style={{ animationDelay: "0.6s" }}>i</span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400" style={{ animationDelay: "0.7s" }}>l</span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400" style={{ animationDelay: "0.8s" }}>w</span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400" style={{ animationDelay: "0.9s" }}>a</span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400" style={{ animationDelay: "1.0s" }}>y</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: "1.1s" }}> </span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400" style={{ animationDelay: "1.2s" }}>J</span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400" style={{ animationDelay: "1.3s" }}>o</span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400" style={{ animationDelay: "1.4s" }}>u</span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400" style={{ animationDelay: "1.5s" }}>r</span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400" style={{ animationDelay: "1.6s" }}>n</span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400" style={{ animationDelay: "1.7s" }}>e</span>
          <span className="inline-block animate-bounce text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400" style={{ animationDelay: "1.8s" }}>y</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: "1.9s" }}> </span>
          <span className="inline-block animate-bounce" style={{ animationDelay: "2.0s" }}>🎨</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: "2.1s" }}> </span>
          <span className="inline-block animate-bounce" style={{ animationDelay: "2.2s" }}>✨</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Player - Left Column */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-8 relative">
              <div
                className="rounded-3xl overflow-hidden shadow-lg border-4 bg-card relative transform hover:scale-[1.02] transition-transform duration-300"
                style={{ 
                  borderWidth: "4px",
                  borderColor: "#FFB6C1",
                  boxShadow: "0 10px 40px rgba(255, 182, 193, 0.3)"
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
                <div className="absolute top-2 right-2 text-3xl animate-pulse">⭐</div>
                <h3 className="font-bold text-lg mb-3">
                  <span className="inline-block animate-wiggle">🎬</span> Video Settings <span className="inline-block animate-wiggle">💕</span>
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
                boxShadow: "0 10px 40px rgba(255, 218, 185, 0.3)"
              }}
            >
              <div className="absolute -top-6 -right-6 text-8xl opacity-20 rotate-12">🌈</div>
              <h2 className="text-2xl font-bold mb-6">
                <span className="inline-block animate-bounce">⚙️</span> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Magical</span> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Settings</span> 
                <span className="inline-block animate-bounce">✨</span>
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
