---
name: thejas-standard-portfolio
description: >
  Context, design system, theme architecture, and debugging guide for building
  and maintaining the Standard Portfolio view (StandardPortfolio.tsx) of Thejas
  Krishna P R's personal portfolio website. Use this skill whenever working on
  the standard portfolio page — building new sections, fixing layout bugs,
  changing colors, debugging component issues, updating content, integrating
  21st.dev or reactbits.dev components, or modifying the theme. Also trigger
  when the user mentions: StandardPortfolio, portfolioTheme, SP sections,
  the "View Standard Portfolio" button, color scheme changes, or any of the
  named sections (hero, about, projects, achievements, certifications,
  entrepreneurship, contact). Always read this skill before touching any
  StandardPortfolio.tsx or portfolioTheme.ts code.
---

# Thejas Standard Portfolio — Build & Debug Guide

This skill covers everything needed to build, extend, and debug the
Standard Portfolio view of Thejas Krishna P R's personal portfolio.

Always read `references/theme.md` and `references/sections.md` before
making any changes. Never hardcode colors, radii, or font names — always
use `portfolioTheme` from `/lib/portfolioTheme.ts`.

---

## File Map

```
/lib/portfolioTheme.ts          ← SINGLE SOURCE OF TRUTH for all design tokens
/components/ui/StandardPortfolio.tsx  ← main portfolio page component
/components/sections/
  AboutSkills.tsx               ← reused in both 3D modal and standard view
  Projects.tsx                  ← reused in both 3D modal and standard view
  Achievements.tsx              ← reused in both 3D modal and standard view
  Certifications.tsx            ← reused in both 3D modal and standard view
  Entrepreneurship.tsx          ← reused in both 3D modal and standard view
/components/game/
  Football.tsx                  ← dynamic RigidBody football sphere
  GoalPost.tsx                  ← goal post with sensor collider
  GoalCelebration.tsx           ← particle burst on goal scored
/components/ui/
  ZoneConfirmModal.tsx          ← zone entry confirmation popup
  TurboVignette.tsx             ← green edge flash on turbo fire
  HUD.tsx                       ← speedometer, turbo bar, controls, dock
/components/ui/21st/            ← 21st.dev components
/components/ui/reactbits/       ← reactbits.dev components
```

---

## Theme Architecture

**The golden rule: never hardcode a color, radius, or font.**

All design tokens live in `/lib/portfolioTheme.ts`.
Import like this:

```ts
import { portfolioTheme as pt } from '@/lib/portfolioTheme'

// Use like:
style={{ background: pt.bg.surface }}
style={{ color: pt.accent.primary }}
style={{ borderRadius: pt.radius.lg }}
style={{ transition: pt.transition.default }}
```

For Tailwind arbitrary values use CSS variables injected by `getThemeCSSVars()`:
```tsx
className="bg-[var(--color-primary)]"
className="text-[var(--color-muted)]"
className="border-[var(--color-border)]"
```

CSS variables are injected in `app/layout.tsx` via:
```tsx
import { getThemeCSSVars } from '@/lib/portfolioTheme'
const cssVars = getThemeCSSVars()
<html style={cssVars as React.CSSProperties}>
```

**To change the entire color scheme:** edit ONLY `/lib/portfolioTheme.ts`.
Nothing else needs to change. See `references/theme.md` for full token map.

---

## Color Palette (current)

| Token | Value | Usage |
|-------|-------|-------|
| `bg.page` | `#050a0a` | Page background |
| `bg.surface` | `#0a1a14` | Card backgrounds |
| `bg.surface2` | `#0d1f2d` | Alt surface (blue) |
| `text.primary` | `#e8f5e9` | Headings, bold |
| `text.muted` | `#5a8a6a` | Body, descriptions |
| `text.faint` | `#1a3a2a` | Labels, dividers |
| `accent.primary` | `#00e676` | Green — CTAs, active |
| `accent.secondary` | `#1e90ff` | Blue — links, badges |
| `accent.pink` | `#ff4d7d` | Pink — awards, karate |
| `accent.yellow` | `#f5c842` | Yellow — gold, prizes |
| `border.subtle` | `rgba(0,230,118,0.08)` | Default borders |
| `border.soft` | `rgba(0,230,118,0.15)` | Hover borders |
| `border.strong` | `rgba(0,230,118,0.30)` | Active borders |

---

## Page Sections

| Section ID | Component | Description |
|------------|-----------|-------------|
| `#hero` | inline in StandardPortfolio | Name, role, stats, CTAs |
| `#about` | `<AboutSkills />` | Bio, education, skills |
| `#projects` | `<Projects />` | Project cards + CRUD |
| `#achievements` | `<Achievements />` | Timeline + stats |
| `#certifications` | `<Certifications />` | Cert cards + add form |
| `#entrepreneurship` | `<Entrepreneurship />` | Golden Crown Arts |
| `#contact` | inline in StandardPortfolio | Email, contact cards |

Read `references/sections.md` for full build spec of each section.

---

## Component Usage Rules

### 21st.dev (from `/components/ui/21st/`)
| Component | Used In |
|-----------|---------|
| `GlowingCard` | Project cards, achievement cards |
| `VerticalTimeline` | Achievements section |
| `AnimatedTabs` | About section (About/Skills tabs) |
| `GlowButton` | All buttons — never use plain `<button>` |
| `SpotlightHero` | Hero section background |
| `CommandMenu` | CMD+K global (shared with 3D world) |

### reactbits.dev (from `/components/ui/reactbits/`)
| Component | Used In |
|-----------|---------|
| `SplitText` | Hero name animation |
| `BlurText` | Section headings on scroll |
| `Aurora` | Page background |
| `TiltedCard` | Certification cards |
| `Counter` | Hero stats, achievement stats |
| `FadeIn` | All section reveals on scroll |
| `Marquee` | Tech stack strip below hero |
| `GlassCard` | (3D modal only — not used in standard view) |

---

## Design Rules (enforce always)

```
1. border-radius minimum 16px on all cards — use pt.radius.md or higher
2. No hardcoded hex values anywhere in component files
3. All interactive elements: transition pt.transition.default
4. Hover states: translateY(-4px) + border-color pt.border.strong
5. Glow: box-shadow 0 0 40px pt.glow.primary — never hard drop shadows
6. Section padding: pt.section.paddingY (py-28)
7. Max content width: pt.section.maxWidth (1100px) centered
8. All text: font families from pt.font — never hardcode font names
9. Never use purple/pink gradients or floating emoji decorations
10. Generous whitespace — when in doubt add more space not less
```

---

## Debugging Guide

Read `references/debugging.md` for the full debugging playbook.

Quick reference for the most common issues:

### Colors not updating after theme change
→ Check that `getThemeCSSVars()` is called in `app/layout.tsx`
→ Check that the component imports from `portfolioTheme` not hardcoded values
→ Hard refresh browser (CSS vars are cached)

### Component not rendering
→ Check for missing `"use client"` directive — all components using
  hooks, framer-motion, or reactbits must be client components
→ Check that reactbits component source has been pasted into the file
→ Check import path — `/components/ui/reactbits/` not `reactbits`

### FadeIn not triggering on scroll
→ FadeIn needs IntersectionObserver — check it's not inside a
  component that renders conditionally (it won't observe correctly)
→ Wrap the section container, not individual elements

### Counter not counting up
→ Counter needs to be triggered — use IntersectionObserver or
  pass a `trigger` prop when the section comes into view
→ Check `duration` prop — default may be too fast to see

### GlowingCard glow not visible
→ Check `glowColor` prop is passed — it defaults to white
→ Use `pt.accent.primary` as the glowColor value
→ Glow requires the parent to NOT have `overflow: hidden`

### Layout broken on mobile
→ Check all grid layouts have `grid-cols-1 md:grid-cols-2`
→ Hero two-column: `flex-col md:flex-row`
→ Nav links: hidden on mobile, hamburger drawer on small screens
→ Marquee: reduce font size on mobile with responsive classes

### Tailwind arbitrary values not applying
→ CSS vars must be injected before the component renders
→ Check `app/layout.tsx` has `style={getThemeCSSVars()}`
→ Use inline `style` prop as fallback if Tailwind var isn't working

### Aurora background too distracting
→ Reduce Aurora opacity to 0.3 or lower
→ Set Aurora colors to very dark variants of the theme palette
→ Add a dark overlay div on top of Aurora at 60% opacity

### 21st.dev component not found
→ Copy source manually from https://21st.dev into `/components/ui/21st/`
→ Adapt props to use `portfolioTheme` tokens

### Framer Motion hydration error
→ Add `"use client"` to the component
→ Wrap motion elements in `<ClientOnly>` if needed

### Car drifting on slopes
→ angularDamping must be 8, TURN_STOP_LERP must be 0.4
→ enabledRotations must be [false, true, false]

### HeightfieldCollider type error
→ Heights array must be `number[]` not `Float32Array`
→ Use `Array.from(heights)` in Terrain.tsx

### Zone confirm modal not appearing
→ Check that store has `pendingZone` and `setPendingZone`
→ TriggerZone must call `setPendingZone` not `setActiveZone`

### Football not bouncing
→ RigidBody needs `restitution={0.7}` or ball won't bounce

---

## Section Build Status

All sections 1-7 are complete and build-verified:
- ✅ Section 1: Build Verification
- ✅ Section 2: Car Physics
- ✅ Section 3: Terrain with Hills
- ✅ Section 4: Zone Confirm Modal
- ✅ Section 5: Football Mini-Game
- ✅ Section 6: HUD Upgrade
- ✅ Section 7: Final Integration

---

## Navigation Bar Behavior

- Fixed top, full width, z-50
- Background: `pt.bg.overlay` + `backdrop-blur-xl`
- Border-bottom: `1px solid pt.border.subtle`
- Scroll behavior: no color change on scroll (already dark)
- Mobile: hamburger → slide-down drawer with all links
- Active link: `pt.accent.primary` color + animated underline
- "Enter 3D World" button: calls `setIsGameMode(true)` from zustand

---

## Responsive Breakpoints

```
Mobile:   < 768px   — single column, full width
Tablet:   768–1024px — two columns where applicable
Desktop:  > 1024px  — full layout, max-width 1100px centered
```

All grids: `grid-cols-1 md:grid-cols-2`
Hero: `flex-col-reverse md:flex-row` (visual above text on mobile)
Nav: `hidden md:flex` for links, `flex md:hidden` for hamburger
