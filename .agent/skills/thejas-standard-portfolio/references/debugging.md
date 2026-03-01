# Debugging Playbook

Step-by-step debugging for every known issue in the standard portfolio.

---

## Step 1 — Always Do This First

Before debugging any issue:

1. Check browser console for errors — read them fully
2. Check terminal (Next.js dev server) for build errors
3. Confirm you are running `npm run build && npm run start` NOT `npm run dev`
   (HMR in dev mode causes false positives for many visual bugs)
4. Hard refresh: CMD+Shift+R (Mac) / CTRL+Shift+R (Windows)
5. Check that the file you edited was actually saved

---

## Issue: Colors not changing after editing portfolioTheme.ts

**Symptoms:** Changed a hex value in portfolioTheme.ts, page looks the same.

**Checklist:**
```
□ Is getThemeCSSVars() called in app/layout.tsx?
  Look for: <html style={cssVars as React.CSSProperties}>
  If missing: import { getThemeCSSVars } from '@/lib/portfolioTheme'
              const cssVars = getThemeCSSVars()
              add style={cssVars} to <html>

□ Is the component using portfolioTheme or a hardcoded value?
  Search the component for any raw hex values like #050a0a or #00e676
  Replace ALL of them with pt.accent.primary etc.

□ Is the Tailwind class using the CSS var correctly?
  Wrong:   className="bg-[#00e676]"
  Correct: className="bg-[var(--color-primary)]"
  Or use:  style={{ background: pt.accent.primary }}

□ Did you rebuild after the change?
  Run: npm run build && npm run start
```

---

## Issue: "use client" / Hydration errors

**Symptoms:** Error like "useState can only be used in Client Components"
or "Hydration failed because the server rendered HTML didn't match"

**Fix:**
```
Add "use client" as the FIRST line of any component that uses:
  - useState, useEffect, useRef, useCallback
  - framer-motion (motion.div etc)
  - zustand store reads
  - Any reactbits component
  - Any 21st.dev component with animations
  - window, document, localStorage

StandardPortfolio.tsx MUST have "use client" at the top.
All section components MUST have "use client" at the top.
```

---

## Issue: ReactBits component crashes or shows nothing

**Symptoms:** Component renders blank, or throws "Cannot find module" error.

**Fix:**
```
ReactBits components are copy-paste only — there is no npm package.
Check /components/ui/reactbits/[ComponentName].tsx exists.
If the file exists but is empty or has placeholder comments:
  1. Go to https://reactbits.dev
  2. Find the component
  3. Copy the full source code
  4. Paste into the file
  5. Adapt any hardcoded colors to use portfolioTheme tokens

Common missing files:
  SplitText.tsx   → https://reactbits.dev/text-animations/split-text
  BlurText.tsx    → https://reactbits.dev/text-animations/blur-text
  Aurora.tsx      → https://reactbits.dev/backgrounds/
  TiltedCard.tsx  → https://reactbits.dev/components/tilted-card
  Counter.tsx     → https://reactbits.dev/components/counter
  FadeIn.tsx      → https://reactbits.dev/animations/
  Marquee.tsx     → https://reactbits.dev/components/marquee
```

---

## Issue: 21st.dev component not working

**Symptoms:** Import error, component doesn't render, missing styles.

**Fix:**
```
Install via CLI:
  npx shadcn@latest add "https://21st.dev/r/[component-name]"

Or copy manually:
  1. Go to https://21st.dev
  2. Find the component
  3. Copy source into /components/ui/21st/[ComponentName].tsx
  4. Replace any hardcoded colors with portfolioTheme tokens
  5. Add "use client" at top if not present

If the component uses shadcn/ui primitives (Button, Card etc):
  Run: npx shadcn@latest init (if not already done)
  Then install the required primitive first
```

---

## Issue: FadeIn scroll reveal not triggering

**Symptoms:** Content never appears, or appears immediately without animation.

**Fix:**
```
□ Is the FadeIn component wrapping a direct child, not deeply nested?
  FadeIn uses IntersectionObserver on its immediate child element.

□ Is the parent container overflow: hidden?
  overflow:hidden clips IntersectionObserver — remove it or use overflow:clip

□ Is the section inside a conditional render that starts as false?
  IntersectionObserver won't observe elements that don't exist in DOM yet.
  Solution: always render the section, use opacity/transform for hiding.

□ Is threshold too high?
  Default threshold 0.1 should work. If not try threshold={0.01}

Correct usage:
  <FadeIn>
    <section id="about">
      ...content...
    </section>
  </FadeIn>
```

---

## Issue: Counter not animating

**Symptoms:** Number shows as final value immediately, no count-up.

**Fix:**
```
Counter needs a trigger to start. Two approaches:

APPROACH 1 — Trigger on mount (simpler):
  Pass start={true} immediately if the section is visible on load.
  For sections below the fold, use IntersectionObserver:

  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true)
    })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  <div ref={ref}>
    <Counter value={98.7} trigger={visible} />
  </div>

APPROACH 2 — Use FadeIn trigger:
  Wrap Counter in FadeIn and start counting when FadeIn fires.
```

---

## Issue: Aurora background too bright / distracting

**Symptoms:** Animated background is too colorful, text hard to read.

**Fix:**
```
In the Aurora component usage, add:
  opacity={0.25}  (or lower — try 0.15)

Also add a dark overlay on top of Aurora:
  <div className="relative">
    <Aurora opacity={0.2} />
    <div
      className="absolute inset-0"
      style={{ background: 'rgba(5,10,10,0.7)' }}
    />
    <div className="relative z-10">
      {/* page content */}
    </div>
  </div>

Aurora colors should only use very dark variants:
  colors={[pt.bg.page, pt.bg.surface, pt.bg.surface2]}
```

---

## Issue: Navigation links not smooth scrolling

**Symptoms:** Clicking nav link jumps to section abruptly.

**Fix:**
```
Add to globals.css or in a <style> tag in layout.tsx:
  html {
    scroll-behavior: smooth;
  }

For offset (so fixed nav doesn't cover section heading):
  Add scroll-margin-top to each section:
  <section id="about" style={{ scrollMarginTop: '80px' }}>

Or use Tailwind: className="scroll-mt-20"
```

---

## Issue: Mobile layout broken

**Symptoms:** Two columns overlapping on mobile, text too small, padding wrong.

**Checklist:**
```
□ Hero: flex-col-reverse md:flex-row
  (reverse so visual appears above text on mobile)

□ All grids: grid-cols-1 md:grid-cols-2

□ Stats row: flex-col sm:flex-row or grid-cols-3 with smaller text on mobile

□ Nav: hidden md:flex for desktop links
       flex md:hidden for hamburger

□ Section padding: py-16 md:py-28 (reduce on mobile)

□ Heading sizes: text-3xl md:text-5xl (scale down on mobile)

□ Marquee: reduce speed and font size on mobile

□ Max-width containers: px-4 md:px-6 (add mobile padding)

□ TiltedCard: disable tilt on touch devices (add touch detection)
```

---

## Issue: GlowingCard glow not visible

**Symptoms:** Card renders but no glow effect on hover.

**Fix:**
```
Three requirements for GlowingCard glow to work:

1. Pass glowColor prop:
   <GlowingCard glowColor={pt.accent.primary}>

2. Parent must NOT have overflow:hidden
   The glow extends outside the card bounds.
   If parent has overflow:hidden, the glow gets clipped.
   Fix: overflow:visible on parent, or use overflow:clip instead.

3. Card must have position:relative
   The glow pseudo-element is absolutely positioned.
```

---

## Issue: Zustand state not updating between 3D and standard view

**Symptoms:** Projects edited in 3D world don't show in standard portfolio.

**Fix:**
```
Both views read from the same zustand store — they should sync automatically.

If not syncing:
□ Check both components import from the same store file:
  import { usePortfolioStore } from '@/store/usePortfolioStore'

□ Check persist middleware is set up correctly in the store:
  import { persist } from 'zustand/middleware'
  The storage key must be: 'thejas-portfolio-storage'

□ Check the standard portfolio is reading live store data, not
  a static copy. It must use:
  const projects = usePortfolioStore(s => s.projects)
  NOT:
  const [projects] = useState(STATIC_PROJECTS_ARRAY)
```

---

## Issue: "View Standard Portfolio" button doesn't work

**Symptoms:** Clicking the button in the 3D world does nothing.

**Fix:**
```
The button calls setIsGameMode(false) from zustand.
In SkipButton.tsx:
  const setIsGameMode = usePortfolioStore(s => s.setIsGameMode)
  <button onClick={() => setIsGameMode(false)}>

In page.tsx, the conditional render must be:
  {isGameMode ? <World /> : <StandardPortfolio />}

Check that isGameMode is read correctly:
  const isGameMode = usePortfolioStore(s => s.isGameMode)
```

---

## Issue: Framer Motion AnimatePresence not transitioning

**Symptoms:** Switching between 3D and standard mode is instant, no animation.

**Fix:**
```
AnimatePresence requires:
  1. mode="wait" prop to wait for exit before entering
  2. Unique key on each child
  3. Both children must be motion.div with exit prop

Correct setup in page.tsx:
  <AnimatePresence mode="wait">
    {isGameMode ? (
      <motion.div
        key="game"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <World />
      </motion.div>
    ) : (
      <motion.div
        key="standard"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        <StandardPortfolio />
      </motion.div>
    )}
  </AnimatePresence>
```

---

## Issue: Build fails on Vercel but works locally

**Symptoms:** `npm run build` passes locally, Vercel deployment fails.

**Common causes:**
```
□ Missing "use client" on components using browser APIs
  window, document, localStorage are not available during SSR
  Add "use client" to every component using these

□ Three.js / R3F imports in non-client components
  All R3F code must be in client components or wrapped in dynamic imports:
  const World = dynamic(() => import('@/components/game/World'), { ssr: false })

□ Missing environment variables
  Check Vercel dashboard → Settings → Environment Variables

□ Type errors that TypeScript catches in strict mode
  Run: npx tsc --noEmit locally to catch these before deploying

□ Image optimization — if using <img> tags instead of Next.js <Image>
  Either switch to <Image> or add hostname to next.config.js
```
