# Bird Brawl

## Overview

Bird Brawl is a multiplayer platform fighting game inspired by Super Smash Bros, Brawlhalla, and Rivals of Aether. Players select from 10 unique bird characters, each with distinct stats and special abilities, and compete in fast-paced combat on platforms with power-ups. The game supports up to 4 players with configurable human/AI control.

The application is built as a full-stack TypeScript project with a React frontend using Vite, an Express backend, and Drizzle ORM for database interactions. The game features canvas-based rendering, real-time game physics, AI opponents, particle effects, and a retro-arcade visual style.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks (useState, useRef, useCallback) for local state; TanStack Query for server state
- **UI Components**: Shadcn/ui component library with Radix UI primitives and Tailwind CSS styling
- **Design System**: Custom Tailwind configuration with CSS variables for theming, following "new-york" style preset

**Key Design Decisions**:
- Canvas-based game rendering for performance with 2D graphics context
- Game loop implemented with `requestAnimationFrame` via `useRef` to maintain stable frame rate
- Separation of concerns: game logic (`gameEngine.ts`), rendering (`gameRenderer.ts`), and React components
- Character selection screen uses controlled components with local state before transitioning to game

### Game Engine Architecture

**Core Game Loop** (client/src/lib/gameEngine.ts):
- Physics simulation with gravity, velocity, and collision detection
- Entity management for birds, platforms, power-ups, particles, and AI minions
- AI behavior using state machines and pathfinding
- Special abilities system with cooldowns and timers
- Power-up spawning and effect application

**Rendering Pipeline** (client/src/lib/gameRenderer.ts):
- Layer-based rendering: background → particles → platforms → entities → HUD → overlays
- Screen shake and hitstop effects for combat feedback
- Kill feed and health bars for player awareness
- Gradient backgrounds and particle systems for visual polish

**Game State Management**:
- Centralized game state stored in ref to avoid re-renders during game loop
- Pressed keys tracked separately in ref for responsive controls
- Four distinct player control schemes defined in shared schema

### Backend Architecture

**Framework**: Express.js with TypeScript
- **Server Structure**: HTTP server created via Node's `http` module for future WebSocket support
- **Middleware**: JSON body parsing with raw body preservation for webhook verification
- **Static Serving**: Production builds served from `dist/public` directory
- **Development Mode**: Vite dev server middleware integration with HMR over custom path

**Current Implementation**:
- Minimal API surface (routes.ts placeholder for future endpoints)
- In-memory storage abstraction (MemStorage) implementing IStorage interface
- User CRUD operations defined but not actively used by game
- Logging middleware for request tracking and performance monitoring

**Design Rationale**: 
Backend is prepared for future multiplayer features but currently game runs entirely client-side. The storage layer provides a foundation for user accounts, leaderboards, or match history without requiring immediate database provisioning.

### Data Layer

**ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Location**: `shared/schema.ts` for type sharing between client and server
- **Migration Strategy**: Drizzle Kit with migrations output to `./migrations` directory
- **Database Setup**: Expects `DATABASE_URL` environment variable

**Shared Schema Architecture**:
- TypeScript interfaces and types for game entities (Bird, Platform, PowerUp, etc.)
- Zod schemas for runtime validation via drizzle-zod
- Configuration objects for bird types and power-ups exported as constants
- Game constants (GAME_CONFIG, PLAYER_CONTROLS) centralized for consistency

**Separation Strategy**:
Game data (bird stats, power-up configs) lives in shared schema as TypeScript constants rather than database tables, allowing for compile-time type safety and zero-latency access during gameplay. Database schema (users table) prepared for persistent user data when multiplayer features are added.

### Build System

**Production Build** (script/build.ts):
- Two-phase build: Vite for client bundle → esbuild for server bundle
- Server bundling with selective dependency externalization (allowlist for cold start optimization)
- Output: Single `dist/index.cjs` file with bundled dependencies + `dist/public` static assets

**Development Workflow**:
- `dev` script runs tsx directly on server/index.ts
- Vite middleware provides HMR and module transformation
- TypeScript compilation checking via `tsc --noEmit`

**Rationale**: esbuild bundling reduces filesystem I/O during cold starts by inlining dependencies. Vite handles complex client build (React, CSS, asset optimization) while esbuild provides fast server bundling.

## External Dependencies

### UI Component Libraries
- **Radix UI**: Unstyled, accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **Shadcn/ui**: Pre-styled Radix components with Tailwind CSS integration
- **Lucide React**: Icon library for UI elements

### Styling
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Component variant management for consistent styling
- **clsx + tailwind-merge**: Conditional class application and conflict resolution

### State Management & Data Fetching
- **TanStack Query (React Query)**: Server state management with caching and background updates
- **React Hook Form + Zod**: Form handling with schema validation (prepared for future features)

### Database & ORM
- **Drizzle ORM**: TypeScript-first ORM for PostgreSQL with type inference
- **drizzle-zod**: Zod schema generation from Drizzle tables
- **pg**: PostgreSQL client driver

### Development Tools
- **Vite**: Frontend build tool and dev server with React plugin
- **esbuild**: JavaScript bundler for production server builds
- **tsx**: TypeScript execution for development server
- **Replit Plugins**: Cartographer (source maps), dev banner, runtime error overlay (development only)

### Session Management (Prepared)
- **express-session**: Session middleware
- **connect-pg-simple**: PostgreSQL-backed session store
- **memorystore**: In-memory session fallback

### Routing
- **Wouter**: Minimalist client-side routing (~1.2KB)

**Dependency Strategy**: Project includes comprehensive authentication and session management dependencies (passport, express-session) despite not currently implementing user accounts. This provides a foundation for rapid feature addition when multiplayer/persistent features are developed.