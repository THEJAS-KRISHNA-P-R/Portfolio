# Section Build Specs

Full specification for each section of StandardPortfolio.tsx.
Use this as the reference when building or rebuilding any section.
All colors must use portfolioTheme tokens — see references/theme.md.

---

## SP-1 — Shell, Layout & Navigation

### Nav Bar
- Fixed top, full width, z-50
- Background: `pt.bg.overlay` + `backdrop-blur-xl`
- Border-bottom: `1px solid pt.border.subtle`
- Height: 64px
- Left: "TK" monogram — Space Grotesk, `pt.accent.primary`, 20px
- Center: links — About · Projects · Achievements · Certifications · Contact
  - Font: JetBrains Mono, `pt.text.muted`
  - Hover: `pt.accent.primary`, animated underline slides from left
- Right: "🎮 Enter 3D World" GlowButton → `setIsGameMode(true)`
- Mobile: hamburger → slide-down drawer

### Layout wrapper
- Background: `pt.bg.page`
- Aurora from reactbits as fixed background (z-0)
- Dark overlay on top of Aurora: `rgba(5,10,10,0.75)` (z-1)
- Content: relative z-10
- Max-width: `pt.section.maxWidth` (1100px) centered
- Padding: px-6 on mobile

### Back to top
- Fixed bottom-right, circular, 44×44px
- Background: `pt.bg.surface`, border `pt.border.soft`
- Icon: ↑ in `pt.accent.primary`
- Appears after 400px scroll (useState + useEffect scroll listener)
- Smooth fade-in: Framer Motion opacity 0→1

---

## SP-2 — Hero Section

### Layout
- min-h-screen, flex items-center
- Two columns desktop (60/40 split), stacked mobile (flex-col-reverse)
- Padding: pt-24 pb-16

### Left column
- Availability chip: "Available for opportunities 🟢"
  - Pill, border `pt.border.soft`, bg `rgba(0,230,118,0.06)`
  - Text: `pt.accent.primary`, JetBrains Mono, 12px
- Name: SplitText, Space Grotesk, clamp(40px,6vw,72px), `pt.text.primary`
- Role: BlurText, Inter, 18px, `pt.text.muted`
- Bio: Inter, 15px, `pt.text.muted`, line-height 1.8, max-width 440px
- Stats row: 3 Counter components with dividers
  - 98.7 / Class X, 95.3 / Class XII, 5 / Projects
  - Numbers: Space Grotesk bold `pt.text.primary`
  - Labels: JetBrains Mono `pt.text.muted` uppercase 11px
- CTA row:
  - Primary: bg `pt.accent.primary`, text `pt.bg.page`, rounded-full
  - Secondary: border `pt.border.subtle` → hover `pt.border.strong`
  - Icon buttons: GitHub, LinkedIn

### Right column
- 320×320px square, border-radius `pt.radius.xl`
- Background: linear-gradient using `pt.bg.surface` → `pt.bg.surface2`
- Border: `pt.border.subtle`
- Glow: `0 0 60px pt.glow.primary`
- Center: "TK" initials, 80px, `pt.accent.primary` at 20% opacity
- Badge: "Christ College of Engineering" pill, bottom-right

### Marquee strip
- Full width, py-4
- Border-top and bottom: `pt.border.subtle`
- Content: tech stack items separated by • in `pt.accent.primary` at 40%
- Text: `pt.text.faint`, JetBrains Mono, 13px

---

## SP-3 — About & Skills

### Layout
- Two columns desktop, single mobile
- Padding: `pt.section.paddingY`
- Section label: "ABOUT" — JetBrains Mono, `pt.accent.primary`, 11px, tracking-widest

### Left — About + Education
- Heading: "A bit about me." — Space Grotesk, 36px
- Bio: full text from portfolioTheme content
- Education timeline: 3 cards
  - Background: `rgba(10,26,20,0.6)`, border `pt.border.subtle`, radius `pt.radius.md`
  - Left accent bar: 3px wide
    - B.Tech: `pt.accent.primary`
    - XII: `pt.accent.yellow`
    - X: `pt.accent.pink`
  - Grade badge (right): pill with matching accent color at 10% opacity bg

### Right — Skills
- Heading: "What I work with." — Space Grotesk, 28px
- Skill pills: rounded-full, px-4 py-1.5, JetBrains Mono, 13px
  - Grouped by category with small label above each group
  - Staggered FadeIn animation on scroll
- Karate highlight card at bottom:
  - 🥋 circle left, text right
  - Border: `rgba(255,77,125,0.15)`, radius `pt.radius.md`

---

## SP-4 — Projects

### Layout
- Full width, padding `pt.section.paddingY`
- Section label: "PROJECTS"
- Header row: heading left, "+ Add Project" button right

### Project cards
- 2-column grid desktop, 1-column mobile
- GlowingCard from 21st.dev, glowColor=`pt.accent.primary`
- Background: `pt.bg.surface`, radius `pt.radius.lg`, padding 28px
- Hover: translateY(-4px), border `pt.border.strong`
- Transition: `pt.transition.default`
- Card anatomy:
  - Top: project number (JetBrains Mono, faint) + edit/delete icons (appear on hover)
  - Title: Space Grotesk, 22px, `pt.text.primary`
  - Description: Inter, 14px, `pt.text.muted`, 3 lines max + show more
  - Tech badges: `pt.accent.secondary` color scheme
  - Bottom row: Live ↗ + GitHub links + "View details →"
- Digital Repair Café: "🥇 First Prize" badge in `pt.accent.yellow`

### CRUD form
- Same 3-step wizard as Projects.tsx in 3D world
- Reads/writes same zustand store
- Step indicators in `pt.accent.primary`

---

## SP-5 — Achievements & Certifications

### Achievements
- Section label: "ACHIEVEMENTS"
- Heading: "Recognition & wins."
- Quick stats row: 4 Counter cards
  - 1× Gold, 4× Silver, 2× Prizes, 2× Certs
- VerticalTimeline from 21st.dev
  - 7 entries from content.md, most recent first
  - Timeline line: `rgba(0,230,118,0.15)`
  - Each entry wrapped in FadeIn

### Certifications
- Section label: "CERTIFICATIONS"  
- Heading: "Credentials."
- 3 TiltedCard components (reactbits)
  - Meta card: issuer badge in `pt.accent.secondary`
  - Google card: issuer badge in `pt.accent.pink`
  - AI Workshop: full-width highlight card in `pt.accent.yellow`
- "+ Add Certification" button below

---

## SP-6 — Entrepreneurship + Contact + Footer

### Entrepreneurship
- Full-width card: gradient `pt.bg.surface` → `pt.bg.surface2`
- Two columns: left text, right visual (👑 emoji)
- "What is a Nettipattam?" info card below
- Contact for orders CTA

### Contact
- Centered, max-width 600px
- Heading: "Let's work together."
- 3 contact cards: Email, Phone, Location
- Large CTA button: "Send me an email →"
  - bg `pt.accent.primary`, text `pt.bg.page`, rounded-full
  - hover: glow `pt.glow.cta`

### Footer
- 3 columns: branding | nav links | "Back to 3D" button
- Border-top: `pt.border.subtle`
- Copyright: JetBrains Mono, `pt.text.faint`, 11px
- NO "built with ❤️" or similar

---

## Responsive Rules (apply to all sections)

```
Mobile first. Use these Tailwind patterns consistently:

Grids:        grid-cols-1 md:grid-cols-2
Flex:         flex-col md:flex-row
Hero columns: flex-col-reverse md:flex-row
Headings:     text-3xl md:text-5xl
Section pad:  py-16 md:py-28
Horizontal:   px-4 md:px-6
Hidden:       hidden md:flex (nav links)
              flex md:hidden (hamburger)
```
