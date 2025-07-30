"use client";

import { useCallback, useEffect } from "react";
import Particles from "@tsparticles/react";
import type { Container, Engine } from "@tsparticles/engine";
import { loadFireworksPreset } from "@tsparticles/preset-fireworks";

export const FireworkParticles = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFireworksPreset(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    if (container) {
      // Trigger fireworks manually after container loads
      setTimeout(() => {
        container.refresh();
      }, 100);
    }
  }, []);

  return (
    <Particles
      id="fireworks"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        preset: "fireworks",
        background: {
          color: {
            value: "transparent",
          },
        },
        particles: {
          number: {
            value: 0,
          },
          color: {
            value: ["#FFD700", "#FF69B4", "#00CED1", "#FF6347", "#9370DB", "#32CD32"],
          },
          life: {
            duration: {
              sync: false,
              value: 3,
            },
            count: 1,
          },
          move: {
            enable: true,
            gravity: {
              enable: true,
              acceleration: 10,
            },
            speed: { min: 10, max: 20 },
            decay: 0.1,
            direction: "none",
            straight: false,
            outModes: {
              default: "destroy",
              top: "none",
            },
          },
        },
        emitters: {
          life: {
            count: 2,
            duration: 0.1,
            delay: 0.1,
          },
          rate: {
            delay: 0.3,
            quantity: 1,
          },
          size: {
            width: 0,
            height: 0,
          },
          position: {
            x: 50,
            y: 50,
          },
        },
      }}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 50,
      }}
    />
  );
};