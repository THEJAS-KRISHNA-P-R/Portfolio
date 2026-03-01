---
name: thejas-portfolio
description: >
  Context and conventions for Thejas Krishna P R's personal 3D gamified portfolio
  website. Use this skill whenever working on this project — whether writing new
  features, debugging, adding components, editing content, or extending any part
  of the codebase. Trigger on any task involving this portfolio project: adding a
  new zone, fixing car physics, updating project data, integrating 21st.dev or
  reactbits.dev components, editing the HUD, working on the standard portfolio view,
  modifying the Zustand store, or anything related to the Next.js + React Three Fiber
  + Rapier stack used here.
---

# Thejas Krishna P R — 3D Portfolio Project

This is a personal gamified 3D portfolio website. The user navigates a low-poly
world in a car and drives into zones to discover portfolio content. There is also
a standard HTML fallback view for recruiters.

Always read this skill before making any changes to the project.

---

## Owner

| Field | Value |
|-------|-------|
| Name | Thejas Krishna P R |
| Email | thejas2124@gmail.com |
| Phone | +91 7907242282 |
| College | Christ College of Engineering, APJ Abdul Kalam Technological University |
| Degree | B.Tech Computer Science Engineering (2024 – present) |
| Class XII | SNGS Higher Secondary School, Kerala — 95.3% (2023–24) |
| Class X | Kamala Nehru Memorial Vocational HSS, Thiruvananthapuram — 98.7% (2021–22) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS (with custom theme tokens) |
| 3D Engine | React Three Fiber (`@react-three/fiber`) |
| 3D Helpers | `@react-three/drei` |
| Physics | `@react-three/rapier` |
| Animation | Framer Motion |
| State | Zustand with `persist` middleware |
| UI Components | 21st.dev (structural) + reactbits.dev (visual effects) |
| Fonts | Space Grotesk, JetBrains Mono, Inter (via `next/font/google`) |
| Dev Tools | Leva (debug panel) |

---

## Project Structure

```
/app
  layout.tsx          ← fonts, metadata, global CMD+K + PixelTrail setup
  page.tsx            ← AnimatePresence toggle between game/standard mode
/components
  /game
    World.tsx         ← R3F Canvas, Physics wrapper, KeyboardControls
    Car.tsx           ← physics car, WASD controls, camera follow, turbo, spawn cinematic
    Terrain.tsx       ← simplex noise height map, trees, boulders, zone buildings
    TriggerZone.tsx   ← sensor collider + glow visuals + Html label (uses pendingZone)
    Football.tsx      ← dynamic RigidBody football sphere
    GoalPost.tsx      ← goal post with sensor collider for scoring
    GoalCelebration.tsx ← particle burst on goal scored
  /ui
    HUD.tsx           ← in-game overlay (speed, turbo bar, controls, dock, goals)
    Modal.tsx         ← GlassCard overlay, AnimatePresence, section routing
    SkipButton.tsx    ← "View Standard Portfolio" fixed button
    StandardPortfolio.tsx ← full HTML fallback layout
    ZoneConfirmModal.tsx ← zone entry confirmation popup
    TurboVignette.tsx ← green vignette flash on turbo fire
  /sections
    AboutSkills.tsx   ← Garage zone: bio, education, skills grid
    Projects.tsx      ← Lab zone: project cards with full CRUD
    Achievements.tsx  ← Podium zone: vertical timeline
    Entrepreneurship.tsx ← Shop zone: Golden Crown Arts & Crafts
    Certifications.tsx ← Certs Hall zone: cert cards + add form
  /ui/21st            ← 21st.dev components (see design system below)
  /ui/reactbits       ← reactbits.dev components (see design system below)
/store
  usePortfolioStore.ts ← all global state (incl. goals, pendingZone, scrollTarget)
/lib
  constants.ts        ← ZONES object, positions, colors
  theme.ts            ← design tokens
```

---

## The 5 Zones

```typescript
// From /lib/constants.ts
export const ZONES = {
  garage: { id:'garage', label:'🏎️ The Garage', color:'#e94560', position:[-20,0,-20] },
  lab:    { id:'lab',    label:'🔬 The Lab',    color:'#4fc3f7', position:[20,0,-20]  },
  podium: { id:'podium', label:'🏆 The Podium', color:'#f5a623', position:[20,0,20]   },
  shop:   { id:'shop',   label:'🛍️ The Shop',  color:'#7ed321', position:[-20,0,20]  },
  certs:  { id:'certs',  label:'🏅 Certs Hall', color:'#9b59b6', position:[0,0,-35]   },
}
```

| Zone ID | Label | Color | Content |
|---------|-------|-------|---------|
| `garage` | 🏎️ The Garage | `#e94560` | About + Education + Skills |
| `lab` | 🔬 The Lab | `#4fc3f7` | Projects (full CRUD) |
| `podium` | 🏆 The Podium | `#f5a623` | Achievements + Awards |
| `shop` | 🛍️ The Shop | `#7ed321` | Golden Crown Arts & Crafts |
| `certs` | 🏅 Certs Hall | `#9b59b6` | Certifications |

---

## Zustand Store Shape

```typescript
// /store/usePortfolioStore.ts

type Project = {
  id: string
  title: string
  description: string
  tech: string[]
  liveUrl?: string
  githubUrl?: string
}

type Certification = {
  id: string
  name: string
  issuer: string
  date: string
  url?: string
}

interface PortfolioStore {
  // Game state
  activeZone: string | null
  setActiveZone: (zone: string | null) => void
  isGameMode: boolean
  setIsGameMode: (val: boolean) => void
  carSpeed: number
  setCarSpeed: (speed: number) => void
  teleportTarget: [number, number, number] | null
  setTeleportTarget: (pos: [number,number,number] | null) => void

  // Projects (persisted)
  projects: Project[]
  addProject: (p: Omit<Project, 'id'>) => void
  updateProject: (id: string, p: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Certifications (persisted)
  certifications: Certification[]
  addCertification: (c: Omit<Certification, 'id'>) => void
  deleteCertification: (id: string) => void
}
```

Persist key: `'thejas-portfolio-storage'`
Only `projects` and `certifications` are persisted (not game state).

---

## Design System

Read `references/design-system.md` for the full component list and usage rules.

**Quick reference:**

### 21st.dev Components (`/components/ui/21st/`)
| File | Used In |
|------|---------|
| `FloatingDock.tsx` | HUD bottom-center zone navigation |
| `GlowingCard.tsx` | Project cards, achievement cards |
| `AnimatedTabs.tsx` | Modal sub-navigation |
| `SpotlightHero.tsx` | StandardPortfolio hero |
| `VerticalTimeline.tsx` | Achievements section |
| `CommandMenu.tsx` | CMD+K global palette |
| `GlowButton.tsx` | All buttons (replaces plain `<button>`) |

### reactbits.dev Components (`/components/ui/reactbits/`)
| File | Used In |
|------|---------|
| `SplitText.tsx` | Name heading animations |
| `BlurText.tsx` | Modal section headings |
| `SpinningText.tsx` | Loading screen |
| `PixelTrail.tsx` | Custom cursor (game mode only) |
| `Aurora.tsx` | Loading screen + hero background |
| `TiltedCard.tsx` | Certification cards |
| `Counter.tsx` | Stats: grades, project count |
| `FadeIn.tsx` | StandardPortfolio scroll reveals |
| `Marquee.tsx` | Tech stack infinite strip |
| `GlassCard.tsx` | Modal container (frosted glass) |

### Design Rules (enforce always)
1. Never use plain `<button>` → always `GlowButton`
2. Never use plain `<input>` → styled input with `focus:ring` in zone color
3. All cards → `GlowingCard` or `TiltedCard`
4. Modal headings → `BlurText`
5. Modal container → `GlassCard` with `1px border` of active zone color
6. Cursor in game mode → `PixelTrail`
7. Section headings in StandardPortfolio → `SplitText`

---

## Theme Tokens

```typescript
// /lib/theme.ts
export const theme = {
  colors: {
    garage:  '#e94560',   // red
    lab:     '#4fc3f7',   // cyan
    podium:  '#f5a623',   // gold
    shop:    '#7ed321',   // green
    certs:   '#9b59b6',   // purple
    bg:      '#0a0a0f',   // near black
    surface: '#0f1923',   // dark surface
    border:  '#1a2332',   // subtle border
    text:    '#e2e8f0',   // light
    muted:   '#64748b',   // muted
    glow:    '#4fc3f7',   // default glow
  },
  fonts: {
    display: 'Space Grotesk',
    mono:    'JetBrains Mono',
    body:    'Inter',
  }
}
```

Custom Tailwind utilities: `bg-garage`, `text-lab`, `border-podium`, `shadow-certs`, etc.

---

## Portfolio Content

Read `references/content.md` for the full content of every section:
- All 5 projects with descriptions, tech stacks, URLs
- All achievements with dates and descriptions
- All certifications
- Golden Crown Arts & Crafts details
- Full skills list grouped by category
- Education timeline

---

## Car Physics Notes

- Mass: `1`
- Linear damping: `0` | Angular damping: `8`
- Rotation locked to Y-axis only: `enabledRotations={[false, true, false]}`
- Velocity set directly via `setLinvel` along forward vector
- Top speed: `12` normal, +`28` during turbo
- Turbo: Space key, `TURBO_DURATION=1.5s`, recharges after 80 units of distance
- Turning: speed-adaptive (`MAX_TURN_SPEED=2.2`, `MIN_TURN_SPEED=0.8`)
- `TURN_STOP_LERP=0.4` (aggressive, resists terrain torques)
- Camera lerp factor: `0.06` (position), `0.1` (lookAt)
- If car Y < -10: reset to `[0, 3, 0]`
- Spawn cinematic: 2s camera descent from Y=20, input blocked during descent

Tuning tips:
- Floaty car → increase mass to 800, multiply force by 1.6
- Camera jitter → reduce lerp to 0.03
- Car flipping → confirm `enabledRotations={[false,true,false]}`

---

## Performance Guidelines

- `dpr` capped at `[1, 1.5]`
- `<AdaptiveDpr pixelated />` and `<AdaptiveEvents />` always inside Canvas
- `<PerformanceMonitor>` auto-downgrades DPR if FPS < 50
- All Three.js geometries wrapped in `useMemo`
- Terrain trees use `InstancedMesh` (not 25 separate meshes)
- `setCarSpeed` throttled — update zustand every 5 frames only
- Modal content lazily mounted (only when `activeZone` is set)
- All R3F components must have `"use client"` directive

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Trigger zones not firing | Check Car has a collider; verify CuboidCollider args match zone size |
| Build fails on Vercel | Add `"use client"` to all R3F/Three.js components |
| TypeScript errors on Three.js | `npm install --save-dev @types/three` |
| Zustand not persisting | Confirm `persist` middleware wraps the store; check storage key |
| 21st.dev install fails | Copy source manually into `/components/ui/21st/` |
| ReactBits component missing | Visit reactbits.dev, copy source into `/components/ui/reactbits/` |
| White flash on mode switch | Ensure AnimatePresence `mode="wait"` is set in page.tsx |
| Car drifts on slopes | angularDamping must be 8, TURN_STOP_LERP must be 0.4 |
| HeightfieldCollider type error | Use `Array.from(heights)` — needs `number[]` not `Float32Array` |
| Zone modal not appearing | Store needs `pendingZone`; TriggerZone must call `setPendingZone` |
| Football not bouncing | RigidBody needs `restitution={0.7}` |

---

## Section Build Status

All sections 1-7 are complete and build-verified:
- ✅ Section 1: Build Verification
- ✅ Section 2: Car Physics (speed-adaptive turning, turbo boost)
- ✅ Section 3: Terrain with Hills (simplex noise height map)
- ✅ Section 4: Zone Confirm Modal (pendingZone flow)
- ✅ Section 5: Football Mini-Game (goal scoring + celebration)
- ✅ Section 6: HUD Upgrade (speedometer, turbo bar, dock)
- ✅ Section 7: Final Integration + Pink Hover Polish
