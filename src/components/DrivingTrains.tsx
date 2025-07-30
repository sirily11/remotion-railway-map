"use client";

import { motion } from "framer-motion";
import { Train, TramFront, TrainFront } from "lucide-react";
import { useEffect, useState } from "react";

interface DrivingTrain {
  id: number;
  Icon: typeof Train;
  y: number;
  duration: number;
  delay: number;
  size: number;
  direction: "left" | "right";
  color: string;
}

const TRAIN_ICONS = [Train, TramFront, TrainFront];
const TRAIN_COLORS = [
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#f9ca24",
  "#f0932b",
  "#eb4d4b",
  "#6ab04c",
  "#c7ecee",
];

export const DrivingTrains = () => {
  const [trains, setTrains] = useState<DrivingTrain[]>([]);

  useEffect(() => {
    const generateTrains = () => {
      const newTrains: DrivingTrain[] = [];

      // Generate trains at different heights
      for (let i = 0; i < 8; i++) {
        const direction = Math.random() > 0.5 ? "left" : "right";
        newTrains.push({
          id: i,
          Icon: TRAIN_ICONS[Math.floor(Math.random() * TRAIN_ICONS.length)],
          y: 10 + i * 12, // Distribute trains across the screen height
          duration: 20 + Math.random() * 15,
          delay: i * 3,
          size: 40 + Math.random() * 30,
          direction,
          color: TRAIN_COLORS[Math.floor(Math.random() * TRAIN_COLORS.length)],
        });
      }
      setTrains(newTrains);
    };

    generateTrains();
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 2 }}
    >
      {trains.map((train) => {
        const Icon = train.Icon;
        return (
          <motion.div
            key={train.id}
            className="absolute"
            initial={{
              x: train.direction === "left" ? "110vw" : "-10vw",
              y: `${train.y}vh`,
            }}
            animate={{
              x: train.direction === "left" ? "-10vw" : "110vw",
            }}
            transition={{
              duration: train.duration,
              delay: train.delay,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              color: train.color,
            }}
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                transform:
                  train.direction === "right" ? "scaleX(-1)" : "scaleX(1)",
              }}
            >
              <Icon size={train.size} strokeWidth={2.5} />
            </motion.div>

            {/* Add train tracks */}
            <div
              className="absolute top-full left-1/2 transform -translate-x-1/2"
              style={{
                width: "200vw",
                height: "2px",
                background: `repeating-linear-gradient(
                  to right,
                  ${train.color}40,
                  ${train.color}40 10px,
                  transparent 10px,
                  transparent 20px
                )`,
                marginTop: "-2px",
              }}
            />
          </motion.div>
        );
      })}

      {/* Add some train stations */}
      {[15, 50, 85].map((xPos, i) => (
        <motion.div
          key={`station-${i}`}
          className="absolute"
          style={{
            left: `${xPos}%`,
            bottom: "10%",
            fontSize: "60px",
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            delay: i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          🏢
        </motion.div>
      ))}
    </div>
  );
};
