# Bird Brawl - Design Guidelines

## Design Approach
**Reference-Based Approach:** Inspired by Super Smash Bros, Brawlhalla, and Rivals of Aether - combining competitive fighting game clarity with playful, arcade-style presentation.

**Core Principle:** Maximum readability during fast-paced combat while maintaining personality and visual impact through bold typography, clear spatial hierarchy, and purposeful information density.

## Typography System

**Display/Headers:**
- Primary: Bold, condensed sans-serif for character names and major UI elements (e.g., "Press Start 2P" or similar retro gaming font)
- Size scale: 48px (titles), 32px (character names), 24px (section headers)

**Body/UI:**
- Secondary: Clean, high-readability sans-serif for stats, descriptions, and HUD elements
- Size scale: 18px (abilities/descriptions), 16px (stats), 14px (secondary info), 12px (labels)

**Combat Feedback:**
- Large impact text: 64px bold for damage numbers and elimination messages
- Kill feed: 16px medium weight for readability at screen edges

## Layout System

**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16 (p-2, m-4, gap-6, etc.)
- Tight spacing (2-4): Within component groups, icon-to-label
- Medium spacing (6-8): Between related elements, card padding
- Large spacing (12-16): Section separation, screen margins

**Grid System:**
- Character selection: 2x5 grid (2 rows, 5 columns) with equal-width cards
- Player slots: Horizontal 4-column layout
- HUD elements: Corner anchoring with consistent 4-unit margins from edges

## Component Library

### Character Selection Screen

**Layout Structure:**
- Full-screen container with centered content area (max-w-6xl)
- Title banner at top: 16-unit top margin, centered
- Player slots: Horizontal bar below title (gap-4 between slots)
- Character grid: Centered below player slots (gap-3 between cards)
- Start button: Bottom-center, 8-unit bottom margin

**Player Slot Cards:**
- Fixed height container (h-32)
- Two-column internal layout: Character preview (left 40%) | Stats panel (right 60%)
- Border treatment to indicate active/selected state
- Toggle button (Human/AI) at top-right corner
- Empty state shows "Select Character" prompt

**Character Selection Cards:**
- Aspect ratio: Square with slight vertical bias (5:6 ratio)
- Content hierarchy: Bird icon/visual (top 50%), name (bold, 24px), stats row (power/jump/speed icons + values), ability text (truncated, 14px)
- Hover state: Subtle scale transform (1.02) and border highlight
- Selected state: Prominent border, slight glow effect

### In-Game HUD

**Health Bar Positioning:**
- Player 1: Top-left corner (m-4)
- Player 2: Top-right corner (m-4)
- Player 3: Bottom-left corner (m-4)
- Player 4: Bottom-right corner (m-4)

**Health Bar Structure:**
- Width: 240px, Height: 48px
- Name label above bar (16px, bold)
- Background bar (full width)
- Foreground health fill (dynamic width based on HP percentage)
- HP percentage text overlaid (centered, 18px, bold)
- Buff icons row below bar (gap-1, 24px icons)

**Cooldown Indicators:**
- Position: Directly below health bar (gap-2)
- Two circles: Attack cooldown (left), Special cooldown (right)
- Radial fill showing remaining cooldown time
- Icon or letter centered in circle

**Kill Feed:**
- Position: Center-right screen (mr-8)
- Vertical stack of messages (max 6 visible)
- Each entry: 16px text, subtle background, auto-fade after 4 seconds
- New entries slide in from top, push old entries down

**Damage Numbers:**
- Float upward from impact point with fade animation
- Size: 64px bold, outlined text for visibility
- Duration: 1 second total (0.3s rise, 0.7s fade)

### Power-Up Display

**Visual Treatment:**
- Floating icons in game world (32px size)
- Gentle vertical oscillation (±8px)
- Glow effect and particle trail
- Type label appears on proximity (48px range)

**Active Buff Indicators (on HUD):**
- Small icon (24px) with timer bar underneath
- Positioned in row below health bar
- Icon + remaining seconds text (12px)

### Pause/Game Over Overlays

**Overlay Structure:**
- Full-screen semi-transparent backdrop
- Centered content card (max-w-lg)
- Title (48px), stats/results (18px), action buttons (gap-4)
- Button hierarchy: Primary action (larger), secondary actions (smaller)

## Visual Effects Guidelines

**Screen Shake:**
- Translate entire canvas randomly within bounds (max 20px offset)
- Duration: 100-300ms based on impact severity

**Hitstop:**
- Freeze all movement for 2-8 frames on heavy hits
- Maintain particle animations during freeze

**Particle Systems:**
- Attack impacts: 20-50 particles radiating from hit point
- Special abilities: Character-specific particle themes (ice shards, feathers, dust clouds)
- Power-up collection: 15-particle burst from power-up location
- Size range: 4-12px, lifespan: 30-60 frames

## Accessibility Considerations

**Contrast & Readability:**
- All text maintains 4.5:1 minimum contrast ratio against backgrounds
- Health bars use dual indicators (fill bar + percentage text)
- Damage numbers have stroke outlines for visibility over any background

**Input Feedback:**
- Clear visual response to all button presses and keyboard inputs
- Cooldown states clearly distinguishable from ready states
- Selected characters have unmistakable highlight treatment

## Animation Principles

**Character Movement:**
- Smooth interpolation between positions (60fps target)
- Distinct states: idle, jumping, falling, attacking, stunned
- Flip sprite horizontally based on facing direction

**UI Transitions:**
- Character selection hover: 150ms ease-out transform
- Health bar damage: 300ms smooth width transition
- Kill feed entries: 200ms slide-in, 300ms fade-out
- Power-up spawn: 400ms scale-up from zero

**Combat Feedback:**
- Immediate visual response (<16ms) to attack inputs
- Damage numbers appear instantly, then animate
- Screen effects trigger in sync with impact frames

## Responsive Considerations

**Minimum Viewport:** 1280x720 (720p)
**Optimal Viewport:** 1920x1080 (1080p)
**Scaling Strategy:** Maintain aspect ratio, letterbox if needed, scale UI elements proportionally