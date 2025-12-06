import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type PowerUpType = 'HEALTH' | 'SPEED' | 'RAGE' | 'SHRINK';

export interface PowerUpConfig {
  type: PowerUpType;
  color: string;
  text: string;
}

export const POWER_UP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  HEALTH: { type: 'HEALTH', color: '#ef4444', text: '+40 HP' },
  SPEED: { type: 'SPEED', color: '#06b6d4', text: 'SPEED!' },
  RAGE: { type: 'RAGE', color: '#f97316', text: 'RAGE!' },
  SHRINK: { type: 'SHRINK', color: '#a855f7', text: 'SHRINK!' },
};

export type BirdTypeName = 
  | 'PIGEON' | 'EAGLE' | 'HUMMINGBIRD' | 'TURKEY' | 'PENGUIN' 
  | 'SHOEBILL' | 'MOCKINGBIRD' | 'RAZORBILL' | 'GRINCHHAWK' | 'VULTURE';

export interface BirdTypeConfig {
  id: BirdTypeName;
  name: string;
  power: number;
  jumpHeight: number;
  speed: number;
  color: string;
  flyUpForce: number;
  ability: string;
}

export const BIRD_TYPES: Record<BirdTypeName, BirdTypeConfig> = {
  PIGEON: {
    id: 'PIGEON',
    name: 'Pigeon',
    power: 7,
    jumpHeight: 16,
    speed: 3.8,
    color: '#d1d5db',
    flyUpForce: 0.0,
    ability: 'Double Jump + Heal Burst (Special) - +25 HP!'
  },
  EAGLE: {
    id: 'EAGLE',
    name: 'Eagle',
    power: 9,
    jumpHeight: 18,
    speed: 4.2,
    color: '#991b1b',
    flyUpForce: 0.45,
    ability: 'Glide/Fly Up (Hold Jump) + Dive Bomb (Special)'
  },
  HUMMINGBIRD: {
    id: 'HUMMINGBIRD',
    name: 'Hummingbird',
    power: 4,
    jumpHeight: 24,
    speed: 5.0,
    color: '#22c55e',
    flyUpForce: 0.9,
    ability: 'Hover/Fly Up (Hold Jump) + Flutter Boost (Special)'
  },
  TURKEY: {
    id: 'TURKEY',
    name: 'Turkey',
    power: 11,
    jumpHeight: 10,
    speed: 2.8,
    color: '#92400e',
    flyUpForce: 0.0,
    ability: 'Ground Pound (Special) - AOE smash on land!'
  },
  PENGUIN: {
    id: 'PENGUIN',
    name: 'Penguin',
    power: 8,
    jumpHeight: 8,
    speed: 3.5,
    color: '#1f2937',
    flyUpForce: 0.0,
    ability: 'Ice Slide Dash (Special) - Long freeze slide!'
  },
  SHOEBILL: {
    id: 'SHOEBILL',
    name: 'Shoebill',
    power: 13,
    jumpHeight: 12,
    speed: 3.8,
    color: '#475569',
    flyUpForce: 0.35,
    ability: 'Stun (Special) - 2.5s stun only!'
  },
  MOCKINGBIRD: {
    id: 'MOCKINGBIRD',
    name: 'Charles',
    power: 6,
    jumpHeight: 18,
    speed: 4.0,
    color: '#9333ea',
    flyUpForce: 0.4,
    ability: 'Spawn Lounge (Special) - Heal zone on self!'
  },
  RAZORBILL: {
    id: 'RAZORBILL',
    name: 'Razorbill',
    power: 10,
    jumpHeight: 12,
    speed: 3.5,
    color: '#4338ca',
    flyUpForce: 0.3,
    ability: 'Razor Dive (Special) - Down dash + huge damage!'
  },
  GRINCHHAWK: {
    id: 'GRINCHHAWK',
    name: 'Grinch-Hawk',
    power: 14,
    jumpHeight: 10,
    speed: 2.6,
    color: '#4d7c0f',
    flyUpForce: 0.0,
    ability: 'Heart Grew 3 Sizes - Steals 20 HP from everyone!'
  },
  VULTURE: {
    id: 'VULTURE',
    name: 'Vulture',
    power: 9,
    jumpHeight: 14,
    speed: 3.3,
    color: '#2d1937',
    flyUpForce: 0.25,
    ability: 'Carrion Call (Special) - Swarm of crows + slow! Gains HP when others die!'
  }
};

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  floatOffset: number;
}

export interface CrowMinion {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
  ownerIndex: number;
}

export interface Bird {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: BirdTypeName;
  facingRight: boolean;
  playerIndex: number;
  health: number;
  name: string;
  stunTime: number;
  specialCooldown: number;
  specialMaxCooldown: number;
  attackCooldown: number;
  canDoubleJump: boolean;
  loungeActive: boolean;
  loungeX: number;
  loungeY: number;
  diveTimer: number;
  isGroundPounding: boolean;
  carrionSwarmTimer: number;
  crowSwarmCooldown: number;
  isFlying: boolean;
  speedMultiplier: number;
  powerMultiplier: number;
  sizeMultiplier: number;
  speedTimer: number;
  rageTimer: number;
  shrinkTimer: number;
  isAI: boolean;
}

export interface PlayerSlot {
  index: number;
  isAI: boolean;
  selectedBird: BirdTypeName;
  active: boolean;
}

export interface KillFeedEntry {
  message: string;
  timestamp: number;
}

export interface GameState {
  phase: 'menu' | 'playing' | 'gameOver';
  players: (Bird | null)[];
  platforms: Platform[];
  powerUps: PowerUp[];
  particles: Particle[];
  crowMinions: CrowMinion[];
  killFeed: KillFeedEntry[];
  shakeIntensity: number;
  hitstopFrames: number;
  lastPowerUpSpawnTime: number;
  winner: Bird | null;
}

export interface PlayerControls {
  left: string;
  right: string;
  jump: string;
  attack: string;
  special: string;
}

export const PLAYER_CONTROLS: PlayerControls[] = [
  { left: 'KeyA', right: 'KeyD', jump: 'KeyW', attack: 'Space', special: 'ShiftLeft' },
  { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', attack: 'Enter', special: 'ArrowDown' },
  { left: 'KeyF', right: 'KeyH', jump: 'KeyT', attack: 'KeyY', special: 'KeyU' },
  { left: 'KeyJ', right: 'KeyL', jump: 'KeyI', attack: 'KeyO', special: 'KeyP' },
];

export const GAME_CONFIG = {
  WIDTH: 1280,
  HEIGHT: 720,
  GROUND_Y: 620,
  GRAVITY: 0.75,
  MAX_PLAYERS: 4,
  POWERUP_SPAWN_INTERVAL: 14000,
  MAX_KILL_FEED: 6,
  KILL_FEED_DURATION: 5000,
};
