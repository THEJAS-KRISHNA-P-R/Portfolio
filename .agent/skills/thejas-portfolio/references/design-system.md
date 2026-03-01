# Design System Reference

Full documentation for all UI components used in the portfolio.

---

## 21st.dev Components

Install via: `npx shadcn@latest add "https://21st.dev/r/[component-name]"`
Or manually copy source into `/components/ui/21st/`

### FloatingDock — `/components/ui/21st/FloatingDock.tsx`
**Used in:** `HUD.tsx` (bottom-center)
- 5 items, one per zone
- Each item: zone emoji icon, zone label, zone color
- Active zone item glows brighter + scales up
- Click → `setTeleportTarget(zone.position)` + visual feedback
- Position: fixed bottom-8 left-1/2 -translate-x-1/2

### GlowingCard — `/components/ui/21st/GlowingCard.tsx`
**Used in:** `Projects.tsx`, `Achievements.tsx`, `AboutSkills.tsx`
- Props: `glowColor` (string) — matches current zone color
- Glow intensifies on hover
- Dark background `#0f1923`, subtle border `#1a2332`
- Use for: project cards, achievement cards, education cards, stats cards

### AnimatedTabs — `/components/ui/21st/AnimatedTabs.tsx`
**Used in:** `Modal.tsx`, `Projects.tsx`, `AboutSkills.tsx`
- Underline indicator animates between tabs using Framer Motion `layoutId`
- Tab text color transitions to zone color when active
- Use for: "About | Skills" in Garage, "My Projects | Add New" in Lab

### SpotlightHero — `/components/ui/21st/SpotlightHero.tsx`
**Used in:** `StandardPortfolio.tsx` (hero section)
- Dark background with radial spotlight that follows mouse position
- Spotlight color: `#4fc3f7` (lab cyan) by default
- Full viewport height

### VerticalTimeline — `/components/ui/21st/VerticalTimeline.tsx`
**Used in:** `Achievements.tsx`
- Left-side vertical line
- Icon nodes at each entry (use achievement emoji)
- Date badge on the right
- Each entry wrapped in `FadeIn` from reactbits for scroll reveal

### CommandMenu — `/components/ui/21st/CommandMenu.tsx`
**Used in:** Global (`app/layout.tsx` or `ClientLayout.tsx`)
- Trigger: `CMD+K` / `CTRL+K` keydown listener
- Items:
  ```
  🏎️  Go to The Garage     → setTeleportTarget([-20, 0, -20])
  🔬  Go to The Lab         → setTeleportTarget([20, 0, -20])
  🏆  Go to The Podium      → setTeleportTarget([20, 0, 20])
  🛍️  Go to The Shop        → setTeleportTarget([-20, 0, 20])
  🏅  Go to Certs Hall      → setTeleportTarget([0, 0, -35])
  ───────────────────────────
  📋  View Standard Portfolio → setIsGameMode(false)
  🎮  Enter 3D Game Mode      → setIsGameMode(true)
  ```
- Portal overlay, z-index 100

### GlowButton — `/components/ui/21st/GlowButton.tsx`
**Used in:** Everywhere — replaces ALL plain `<button>` elements
- Variants:
  - `primary` — uses active zone color as glow + border
  - `ghost` — transparent bg, subtle border
  - `danger` — red `#e94560` for delete actions
- Props: `variant`, `onClick`, `href` (renders as anchor if provided), `disabled`
- Animated border glow on hover, scale `0.97` on press

---

## reactbits.dev Components

Copy-paste source from https://reactbits.dev into `/components/ui/reactbits/`

### SplitText — `/components/ui/reactbits/SplitText.tsx`
**Used in:** `HUD.tsx` (name), `StandardPortfolio.tsx` (hero heading)
- Splits text into individual letter spans
- Each letter animates in from above on mount
- Stagger: `0.03s` per letter
- Source: https://reactbits.dev/text-animations/split-text

### BlurText — `/components/ui/reactbits/BlurText.tsx`
**Used in:** All modal section headings (h2 level)
- Text starts blurred + offset, clears on mount
- Trigger on every modal open (key the component to `activeZone`)
- Source: https://reactbits.dev/text-animations/blur-text

### SpinningText — `/components/ui/reactbits/SpinningText.tsx`
**Used in:** Loading screen (Suspense fallback in `World.tsx`)
- "LOADING WORLD..." text spins in a circle around a 🚗 emoji
- Source: https://reactbits.dev/text-animations/spinning-text

### PixelTrail — `/components/ui/reactbits/PixelTrail.tsx`
**Used in:** Global, game mode only
- Replaces default cursor with glowing pixel trail
- Trail color: matches `activeZone` color from zustand (default `#4fc3f7`)
- Only visible when `isGameMode === true`
- Mounted in `app/layout.tsx` or `ClientLayout.tsx`
- Source: https://reactbits.dev/cursor-effects/pixel-trail

### Aurora — `/components/ui/reactbits/Aurora.tsx`
**Used in:** Loading screen, `StandardPortfolio.tsx` hero background
- Animated aurora / gradient background
- Colors: `#0a0a0f`, `#0f1923`, `#1a2332`, `#4fc3f7` (subtle cyan tints)
- Source: https://reactbits.dev/backgrounds/

### TiltedCard — `/components/ui/reactbits/TiltedCard.tsx`
**Used in:** `Certifications.tsx` — each cert card
- Tilts toward cursor on hover
- Glossy reflection overlay
- Source: https://reactbits.dev/components/tilted-card

### Counter — `/components/ui/reactbits/Counter.tsx`
**Used in:** `AboutSkills.tsx` stats row, `Achievements.tsx` quick stats
- Animated number count-up on mount (or on IntersectionObserver trigger)
- Props: `value` (number), `duration` (ms), `suffix` (string)
- Usage: `<Counter value={98.7} suffix="%" duration={1500} />`
- Source: https://reactbits.dev/components/counter

### FadeIn — `/components/ui/reactbits/FadeIn.tsx`
**Used in:** `StandardPortfolio.tsx` — each section, `Achievements.tsx` timeline entries
- Scroll-triggered opacity + translateY reveal
- Default: `y: 24px → 0`, `opacity: 0 → 1`, `duration: 0.5s`
- Source: https://reactbits.dev/animations/

### Marquee — `/components/ui/reactbits/Marquee.tsx`
**Used in:** `StandardPortfolio.tsx` — between hero and About section
- Infinite horizontal scroll, both directions supported
- Content: `"Python • React.js • Next.js • Flutter • React Native • MongoDB Atlas • Supabase • Firebase • Deep Learning • Generative AI • Cybersecurity • Arduino • JavaScript • C/C++ •"`
- Style: muted text `#64748b` on dark surface, small font, continuous
- Source: https://reactbits.dev/components/marquee

### GlassCard — `/components/ui/reactbits/GlassCard.tsx`
**Used in:** `Modal.tsx` container
- `backdrop-blur-xl`, dark bg at `85%` opacity
- Border: `1px solid [activeZone color]`
- The 3D canvas remains subtly visible behind modal
- Source: https://reactbits.dev/components/glass-card

---

## Component Rules (always enforce)

```
1. Never plain <button>          → GlowButton (21st.dev)
2. Never plain <input>           → styled input, focus:ring in zone color
3. All cards                     → GlowingCard or TiltedCard
4. Modal headings (h2)           → BlurText (reactbits)
5. Modal container               → GlassCard (reactbits)
6. Game mode cursor              → PixelTrail (reactbits)
7. StandardPortfolio headings    → SplitText (reactbits)
8. All buttons in forms          → GlowButton with appropriate variant
```

---

## Tailwind Custom Utilities

Extended in `tailwind.config.ts`:

```js
// Colors
'garage':  '#e94560'
'lab':     '#4fc3f7'
'podium':  '#f5a623'
'shop':    '#7ed321'
'certs':   '#9b59b6'
'bg':      '#0a0a0f'
'surface': '#0f1923'
'border-subtle': '#1a2332'

// Fonts
'display': ['Space Grotesk', 'sans-serif']
'mono':    ['JetBrains Mono', 'monospace']
'body':    ['Inter', 'sans-serif']
```

Usage: `bg-garage`, `text-lab`, `border-podium`, `font-display`, `font-mono`
