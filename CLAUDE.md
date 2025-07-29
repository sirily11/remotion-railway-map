# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Install dependencies
pnpm install

# Start Next.js development server
pnpm run dev

# Open Remotion Studio for video editing
npx remotion studio

# Render a video locally
pnpm exec remotion render

# Lint the codebase
pnpm run lint

# Build the Next.js application
pnpm run build
```

### AWS Lambda Deployment
```bash
# Deploy Lambda function and Remotion Bundle
node deploy.mjs

# Upgrade Remotion to the latest version
pnpm exec remotion upgrade
```

## Architecture Overview

This is a Next.js application integrated with Remotion for programmatic video generation. Key components:

### Video Compositions
- **Main composition**: Located in `src/remotion/MyComp/Main.tsx`, configured in `src/remotion/Root.tsx`
- **Constants**: Video dimensions, FPS, and duration defined in `types/constants.ts`
- **Webpack override**: Custom configuration in `src/remotion/webpack-override.mjs`

### Map Animation Features
- **MapAnimation**: Custom map animation library in `src/lib/MapAnimation/` with tile rendering, point-to-point animations, and mercator projections
- **MapboxExample**: Integration with Mapbox GL for 3D map animations in `src/lib/MapboxExample/`

### Lambda Integration
- **API Routes**: Lambda render endpoints at `src/app/api/lambda/render/route.ts` and `src/app/api/lambda/progress/route.ts`
- **Configuration**: Lambda settings (region, RAM, disk, timeout) in `config.mjs`
- **Deployment**: Automated deployment script in `deploy.mjs`

### UI Components
- **Player Controls**: Video player and rendering controls in `src/components/`
- **Styling**: Tailwind CSS v4 with Remotion integration

## Environment Setup

Required environment variables (copy `.env.example` to `.env`):
- `REMOTION_AWS_ACCESS_KEY_ID`: AWS access key for Lambda deployment
- `REMOTION_AWS_SECRET_ACCESS_KEY`: AWS secret key for Lambda deployment
- `REMOTION_MAPBOX_TOKEN`: Mapbox access token for map visualizations

## Testing

Check package.json for test scripts once tests are implemented. Currently, ensure all TypeScript compiles and linting passes before committing.