import { z } from "zod";

const point = z.object({
  longitude: z.number().step(0.0000001),
  latitude: z.number().step(0.0000001),
});

export type Point = z.infer<typeof point>;

export const CompositionProps = z.object({
  startLabel: z.string(),
  endLabel: z.string(),
  startPoint: point,
  endPoint: point,
});

export const DURATION_IN_FRAMES = 200;
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const VIDEO_FPS = 30;

export type VideoProps = z.infer<typeof CompositionProps>;
