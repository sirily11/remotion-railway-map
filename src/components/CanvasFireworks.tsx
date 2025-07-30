"use client";

import { useCallback, useRef, useEffect } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";

interface CanvasFireworksProps {
  trigger: boolean;
}

export const CanvasFireworks = ({ trigger }: CanvasFireworksProps) => {
  const refAnimationInstance = useRef<any>(null);

  const makeShot = useCallback((particleRatio: number, opts: any) => {
    refAnimationInstance.current &&
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
  }, []);

  const fire = useCallback(() => {
  makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
      scalar: 0.8,
      colors: ["#FFD700", "#FF69B4", "#00CED1"],
    });

    makeShot(0.2, {
      spread: 60,
      scalar: 1.2,
      colors: ["#FF6347", "#9370DB", "#32CD32"],
    });

    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ["#FFD700", "#FF69B4", "#00CED1", "#FF6347"],
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ["#9370DB", "#32CD32"],
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: [
        "#FFD700",
        "#FF69B4",
        "#00CED1",
        "#FF6347",
        "#9370DB",
        "#32CD32",
      ],
    });
  }, [makeShot]);

  useEffect(() => {
    if (trigger) {
      fire();
      // Multiple bursts for firework effect
      setTimeout(() => fire(), 300);
      setTimeout(() => fire(), 600);
    }
  }, [trigger, fire]);

  return (
    <ReactCanvasConfetti
      onInit={({ confetti }) => {
        refAnimationInstance.current = confetti;
      }}
      style={{
        position: "absolute",
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    />
  );
};
