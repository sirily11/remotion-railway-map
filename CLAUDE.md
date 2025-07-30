# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. Don't every run pnpm dev command! I will have it already running!

## Development Commands

### Core Development

```bash
# Install dependencies
pnpm install

# Start Next.js development server
pnpm run dev

# Open Remotion Studio for video editing
pnpm run remotion
# or
npx remotion studio

# Render a video locally
pnpm run render
# or
pnpm exec remotion render

# Deploy Lambda function and Remotion Bundle
pnpm run deploy
# or
node deploy.mjs

# Lint the codebase
pnpm run lint

# Build the Next.js application
pnpm run build

# Upgrade Remotion to the latest version
pnpm exec remotion upgrade
```

## Architecture Overview

This is a Next.js application (v15) integrated with Remotion (v4.0.327) for programmatic video generation, specializing in animated railway route visualizations.

### Video Compositions

- **Entry point**: `src/remotion/index.ts` registers the root component
- **Root component**: `src/remotion/Root.tsx` defines all available compositions
- **Main compositions**:
  - `MyComp`: Default composition in `src/remotion/MyComp/Main.tsx`
  - `RailwayRoute`: Railway route animations with predefined routes
  - `RailwayRouteWithFetch`: Railway animations that fetch routes dynamically from APIs
  - `MultiStopRailwayRoute`: Multi-stop railway journey animations
- **Video settings**: 3840x2160 (4K), 30 FPS, defined in `types/constants.ts`
- **Webpack config**: Tailwind v4 integration via `src/remotion/webpack-override.mjs`

### Railway Route Animation System

Located in `src/lib/RailwayRouteAnimation/`:

- **Route fetching**: Multiple methods (straight, curved, OSM/OSRM, Overpass API, OpenRailway API)
- **Map tiles**: Supports various tile providers (OSM, CartoDB, StadiaMaps, ArcGIS satellite)
- **Animation**: Smooth camera movements, route drawing, station markers
- **Utilities**: Mercator projection, geo calculations, area bounds

### Lambda Deployment

- **API Routes**:
  - `/api/lambda/render`: Initiates video rendering on AWS Lambda
  - `/api/lambda/progress`: Checks rendering progress
- **Configuration** (`config.mjs`):
  - Region: us-east-1
  - RAM: 3009 MB
  - Disk: 10240 MB
  - Timeout: 240 seconds
- **Deployment**: Run `node deploy.mjs` to deploy/update Lambda function and site bundle

### Environment Variables

Copy `.env.example` to `.env`:

- `REMOTION_AWS_ACCESS_KEY_ID`: AWS credentials for Lambda
- `REMOTION_AWS_SECRET_ACCESS_KEY`: AWS credentials for Lambda

### Key Libraries

- **Next.js** 15.2.4 with App Router
- **Remotion** 4.0.327 (core, player, lambda, shapes, paths)
- **@turf/turf** for geo calculations
- **Tailwind CSS v4** via @remotion/tailwind-v4
- **TypeScript** 5.8.2 with strict typing

## Working with Railway Routes

The railway route animations support multiple data sources:

- **Predefined routes**: Hard-coded coordinates in composition props
- **OSM/OSRM**: Road-based routing (cars, bikes, walking)
- **Overpass API**: Actual railway track data from OpenStreetMap
- **OpenRailway API**: Railway-specific routing

Route methods can be specified via the `routeMethod` prop in compositions.
