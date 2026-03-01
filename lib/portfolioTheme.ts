// /lib/portfolioTheme.ts
// ─────────────────────────────────────────────────────────────────
// CHANGE YOUR ENTIRE PORTFOLIO LOOK HERE — one file, instant update
// ─────────────────────────────────────────────────────────────────

export const portfolioTheme = {

    // ── Backgrounds ────────────────────────────────────────────────
    bg: {
        page: '#050a0a',   // main page background
        surface: '#0a1a14',   // card backgrounds
        surface2: '#0d1f2d',   // alternate surface (blue tint)
        overlay: 'rgba(5,10,10,0.9)', // nav blur overlay
    },

    // ── Text ───────────────────────────────────────────────────────
    text: {
        primary: '#e8f5e9',   // headings, bold content
        muted: '#5a8a6a',   // body text, descriptions
        faint: '#1a3a2a',   // barely visible labels, dividers
    },

    // ── Borders ────────────────────────────────────────────────────
    border: {
        subtle: 'rgba(0,230,118,0.08)',   // default card borders
        soft: 'rgba(0,230,118,0.15)',   // slightly more visible
        strong: 'rgba(0,230,118,0.30)',   // hover states, active
    },

    // ── Accent Colors ──────────────────────────────────────────────
    accent: {
        primary: '#00e676',   // green — CTAs, active, highlights
        secondary: '#1e90ff',   // blue — links, tech badges
        pink: '#ff4d7d',   // pink — awards, karate, danger
        yellow: '#f5c842',   // yellow — gold, prizes, warnings
    },

    // ── Glow / Shadow ──────────────────────────────────────────────
    glow: {
        primary: 'rgba(0,230,118,0.08)',   // default card glow
        primaryHover: 'rgba(0,230,118,0.20)', // hover glow
        cta: 'rgba(0,230,118,0.30)',   // CTA button glow
    },

    // ── Border Radius ──────────────────────────────────────────────
    radius: {
        sm: '8px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        full: '9999px',
    },

    // ── Typography ─────────────────────────────────────────────────
    font: {
        display: 'Space Grotesk',
        body: 'Inter',
        mono: 'JetBrains Mono',
    },

    // ── Transitions ────────────────────────────────────────────────
    transition: {
        default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    // ── Spacing ────────────────────────────────────────────────────
    section: {
        paddingY: 'py-28',     // Tailwind class for section vertical padding
        maxWidth: '1100px',    // max content width
    },

} as const;

// ── Shorthand helpers (optional, for cleaner JSX) ───────────────
export const pt = portfolioTheme; // short alias

// ── CSS variable injection (call this once in layout.tsx) ────────
// This makes all theme values available as CSS variables too,
// so you can use them in plain CSS or Tailwind arbitrary values.
export function getThemeCSSVars(): Record<string, string> {
    return {
        '--color-bg': portfolioTheme.bg.page,
        '--color-surface': portfolioTheme.bg.surface,
        '--color-surface2': portfolioTheme.bg.surface2,
        '--color-text': portfolioTheme.text.primary,
        '--color-muted': portfolioTheme.text.muted,
        '--color-faint': portfolioTheme.text.faint,
        '--color-primary': portfolioTheme.accent.primary,
        '--color-secondary': portfolioTheme.accent.secondary,
        '--color-pink': portfolioTheme.accent.pink,
        '--color-yellow': portfolioTheme.accent.yellow,
        '--color-border': portfolioTheme.border.subtle,
        '--radius-md': portfolioTheme.radius.md,
        '--radius-lg': portfolioTheme.radius.lg,
        '--transition': portfolioTheme.transition.default,
    };
}
