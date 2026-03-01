# Theme Reference

Complete documentation for `/lib/portfolioTheme.ts`.

---

## Full Token Map

```ts
export const portfolioTheme = {

  bg: {
    page:     '#050a0a',          // main page background
    surface:  '#0a1a14',          // card backgrounds, primary surface
    surface2: '#0d1f2d',          // alternate surface with blue tint
    overlay:  'rgba(5,10,10,0.9)' // nav bar blur overlay
  },

  text: {
    primary: '#e8f5e9',   // headings, bold text, high contrast
    muted:   '#5a8a6a',   // body text, descriptions, secondary
    faint:   '#1a3a2a',   // barely visible — dividers, watermarks
  },

  border: {
    subtle: 'rgba(0,230,118,0.08)',  // default card borders
    soft:   'rgba(0,230,118,0.15)',  // slightly more visible
    strong: 'rgba(0,230,118,0.30)',  // hover states, active elements
  },

  accent: {
    primary:   '#00e676',  // green — primary CTAs, active states
    secondary: '#1e90ff',  // blue — links, tech stack badges
    pink:      '#ff4d7d',  // hot pink — awards, karate, danger
    yellow:    '#f5c842',  // warm yellow — gold medals, prizes
  },

  glow: {
    primary:      'rgba(0,230,118,0.08)',  // default card glow
    primaryHover: 'rgba(0,230,118,0.20)', // hover card glow
    cta:          'rgba(0,230,118,0.30)', // CTA button glow on hover
  },

  radius: {
    sm:   '8px',
    md:   '16px',
    lg:   '20px',
    xl:   '24px',
    full: '9999px',
  },

  font: {
    display: 'Space Grotesk',   // headings, name, numbers
    body:    'Inter',            // descriptions, body text
    mono:    'JetBrains Mono',  // tech badges, stats, labels, code
  },

  transition: {
    default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fast:    'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    slow:    'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  section: {
    paddingY: 'py-28',    // Tailwind class for section vertical padding
    maxWidth: '1100px',   // max content width, centered
  },

} as const
```

---

## CSS Variables (injected via getThemeCSSVars())

| CSS Variable | Token | Value |
|---|---|---|
| `--color-bg` | `bg.page` | `#050a0a` |
| `--color-surface` | `bg.surface` | `#0a1a14` |
| `--color-surface2` | `bg.surface2` | `#0d1f2d` |
| `--color-text` | `text.primary` | `#e8f5e9` |
| `--color-muted` | `text.muted` | `#5a8a6a` |
| `--color-faint` | `text.faint` | `#1a3a2a` |
| `--color-primary` | `accent.primary` | `#00e676` |
| `--color-secondary` | `accent.secondary` | `#1e90ff` |
| `--color-pink` | `accent.pink` | `#ff4d7d` |
| `--color-yellow` | `accent.yellow` | `#f5c842` |
| `--color-border` | `border.subtle` | `rgba(0,230,118,0.08)` |
| `--radius-md` | `radius.md` | `16px` |
| `--radius-lg` | `radius.lg` | `20px` |
| `--transition` | `transition.default` | `all 0.3s...` |

---

## How to Change the Color Scheme

Open `/lib/portfolioTheme.ts` and edit the values. Nothing else changes.

### Example: Switch to Purple/Neon theme
```ts
bg: {
  page:     '#08050f',
  surface:  '#110d1f',
  surface2: '#0d0f1f',
},
text: {
  primary: '#f0e8ff',
  muted:   '#7a6a9a',
  faint:   '#2a1a4a',
},
border: {
  subtle: 'rgba(168,85,247,0.08)',
  soft:   'rgba(168,85,247,0.15)',
  strong: 'rgba(168,85,247,0.30)',
},
accent: {
  primary:   '#a855f7',  // purple
  secondary: '#6366f1',  // indigo
  pink:      '#f472b6',  // soft pink
  yellow:    '#fbbf24',  // amber
},
glow: {
  primary:      'rgba(168,85,247,0.08)',
  primaryHover: 'rgba(168,85,247,0.20)',
  cta:          'rgba(168,85,247,0.30)',
},
```

### Example: Switch to Ocean/Cyan theme
```ts
bg: {
  page:     '#020d12',
  surface:  '#061a24',
  surface2: '#08202e',
},
accent: {
  primary:   '#00bcd4',  // cyan
  secondary: '#0288d1',  // ocean blue
  pink:      '#e91e8c',  // magenta
  yellow:    '#ffd600',  // bright yellow
},
border: {
  subtle: 'rgba(0,188,212,0.08)',
  soft:   'rgba(0,188,212,0.15)',
  strong: 'rgba(0,188,212,0.30)',
},
glow: {
  primary:      'rgba(0,188,212,0.08)',
  primaryHover: 'rgba(0,188,212,0.20)',
  cta:          'rgba(0,188,212,0.30)',
},
```

---

## Badge Color Patterns

Skill category badges follow this pattern:
```ts
// bg: rgba([r,g,b], 0.08)  border: rgba([r,g,b], 0.2)  text: accent color

Languages:   accent.primary   (green)
Frameworks:  accent.secondary (blue)
Mobile:      accent.yellow    (yellow)
DB/Backend:  accent.primary   (green)
AI/ML:       accent.pink      (pink)
Security:    accent.secondary (blue)
```

Education card accent bars:
```ts
B.Tech:    accent.primary  (#00e676)
Class XII: accent.yellow   (#f5c842)
Class X:   accent.pink     (#ff4d7d)
```

Achievement badge colors:
```ts
Competition win: accent.yellow  (#f5c842)
Certification:   accent.secondary (#1e90ff)
Hardware:        accent.pink    (#ff4d7d) — wait, orange would be better
                                            but we don't have orange in palette
                                            use accent.yellow instead
Sports:          accent.pink    (#ff4d7d)
Seminar:         accent.primary (#00e676)
```
