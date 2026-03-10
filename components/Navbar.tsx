"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import GlassSurface from "@/components/GlassSurface"

export function Navbar() {
  const setIsGameMode = usePortfolioStore(s => s.setIsGameMode)
  const isGameMode    = usePortfolioStore(s => s.isGameMode)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isMenuOpen])

  // Don't render navbar inside game world
  if (isGameMode) return null

  const isActive = (href: string) => {
    if (href.startsWith("/#")) {
      const hash = href.substring(1)
      return typeof window !== "undefined" && window.location.hash === hash
    }
    return href === "/" ? pathname === "/" : pathname?.startsWith(href) ?? false
  }

  const navLinks = [
    { label: "About",    href: "/#about",    num: "01" },
    { label: "Projects", href: "/#projects", num: "02" },
    { label: "Contact",  href: "/#contact",  num: "03" },
  ]

  const scrollToSection = (href: string) => {
    const id = href.replace("/#", "")
    const el = document.getElementById(id)
    if (el) {
      const offsetPosition = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: offsetPosition, behavior: "smooth" })
      window.history.pushState(null, "", href)
    }
  }

  return (
    <>
      {/* ── DESKTOP FLOATING PILL ──────────────────────────────── */}
      {/* Outer div handles translateX centering; inner motion.div handles y-entry animation — kept separate so Framer Motion doesn't clobber translateX */}
      <div
        className="hidden md:flex fixed top-4 z-[200] w-[720px] max-w-[calc(100vw-2rem)]"
        style={{ left: "50%", transform: "translateX(-50%)" }}
      >
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
        <GlassSurface
          width="100%"
          height={54}
          borderRadius={100}
          borderWidth={0.1}
          brightness={11}
          opacity={0.95}
          blur={14}
          distortionScale={-160}
          redOffset={3}
          greenOffset={9}
          blueOffset={16}
          backgroundOpacity={0.06}
          saturation={2.2}
          className="w-full glass-surface-fixed"
        >
          <div className="flex items-center justify-between w-full px-5 gap-3">
            {/* Logo */}
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === "/") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }) }
              }}
              className="shrink-0"
            >
              <span className="text-sm font-bold tracking-widest text-[#00e676]" style={{ textShadow: "0 0 20px rgba(0,230,118,0.6)" }}>
                TKPR
              </span>
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-0.5">
              {navLinks.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    if (pathname === "/" && item.href.startsWith("/#")) {
                      e.preventDefault()
                      scrollToSection(item.href)
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "text-[#00e676] bg-[#00e676]/10"
                      : "text-white/70 hover:text-white hover:bg-white/[0.07]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                className="hud-portfolio-btn"
                onClick={() => setIsGameMode(true)}
                style={{ transform: "scale(0.78)", transformOrigin: "right center" }}
              >
                <div className="btn-outer">
                  <div className="btn-inner">
                    <span>3D World</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
          {/* Reflection shimmer strip — gives the pill a liquid-glass highlight */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0, left: '8%', right: '8%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.30) 30%, rgba(0,230,118,0.45) 50%, rgba(255,255,255,0.30) 70%, transparent 100%)',
              zIndex: 10,
              pointerEvents: 'none',
              borderRadius: '100px',
            }}
          />
        </GlassSurface>
        </motion.div>
      </div>

      {/* ── MOBILE TOP BAR ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="md:hidden fixed top-0 left-0 right-0 z-[200] px-3 pt-3"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        <GlassSurface
          width="100%"
          height={64}
          borderRadius={100}
          borderWidth={0.1}
          brightness={11}
          opacity={0.95}
          blur={14}
          distortionScale={-160}
          redOffset={3}
          greenOffset={9}
          blueOffset={16}
          backgroundOpacity={0.06}
          saturation={2.2}
          className="w-full glass-surface-fixed"
        >
          <div className="flex items-center w-full px-4 gap-2">
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === "/") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }) }
              }}
              className="text-sm font-bold tracking-widest text-[#00e676] shrink-0"
              style={{ textShadow: "0 0 16px rgba(0,230,118,0.5)" }}
            >
              TKPR
            </Link>
            <div className="flex-1" />
            <button
              className="hud-portfolio-btn"
              onClick={() => setIsGameMode(true)}
              style={{ transform: "scale(0.68)", transformOrigin: "right center" }}
            >
              <div className="btn-outer">
                <div className="btn-inner">
                  <span>3D World</span>
                </div>
              </div>
            </button>
            {/* Staggered menu toggle */}
            <button
              onClick={() => setIsMenuOpen(v => !v)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="relative ml-1 w-9 h-9 flex items-center justify-center"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.span
                    key="x"
                    initial={{ opacity: 0, rotate: -45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.18 }}
                    className="absolute"
                  >
                    <X className="w-4 h-4 text-white/80" />
                  </motion.span>
                ) : (
                  <motion.div
                    key="lines"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-[5px] items-end"
                  >
                    <span className="block h-[1.5px] w-[18px] bg-white/70 rounded-full" />
                    <span className="block h-[1.5px] w-[11px] bg-[#00e676] rounded-full" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </GlassSurface>
      </motion.div>

      {/* ── STAGGERED FULL-SCREEN MOBILE MENU ─────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden fixed inset-0 z-[190] flex flex-col"
            style={{
              background: "rgba(2, 7, 4, 0.94)",
              backdropFilter: "blur(40px) saturate(160%)",
              WebkitBackdropFilter: "blur(40px) saturate(160%)",
            }}
          >
            {/* Ambient glows */}
            <div
              className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
              style={{ background: "radial-gradient(circle at 90% 5%, rgba(0,230,118,0.13) 0%, transparent 65%)" }}
            />
            <div
              className="absolute bottom-0 left-0 w-56 h-56 pointer-events-none"
              style={{ background: "radial-gradient(circle at 10% 95%, rgba(255,77,125,0.09) 0%, transparent 65%)" }}
            />

            {/* Spacer for top bar */}
            <div className="h-[88px] shrink-0" />

            {/* Nav links — staggered entry */}
            <nav className="flex-1 flex flex-col justify-center px-8 gap-1">
              {navLinks.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -36 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.38, delay: 0.04 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      setIsMenuOpen(false)
                      if (pathname === "/" && item.href.startsWith("/#")) {
                        e.preventDefault()
                        setTimeout(() => scrollToSection(item.href), 220)
                      }
                    }}
                    className="group flex items-baseline gap-5 py-3 w-full"
                  >
                    <span className="font-mono text-[11px] text-[#00e676]/35 group-hover:text-[#00e676]/65 transition-colors tabular-nums w-6 shrink-0">
                      {item.num}
                    </span>
                    <span className="font-display font-bold text-[44px] leading-[1.1] tracking-tight text-white/75 group-hover:text-white transition-colors duration-200">
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              ))}

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.26, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-px mt-6 mb-5 origin-left"
                style={{ background: "rgba(0,230,118,0.12)" }}
              />

              {/* 3D World CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.30, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  className="hud-portfolio-btn"
                  onClick={() => { setIsMenuOpen(false); setIsGameMode(true) }}
                  style={{ transform: "scale(0.88)", transformOrigin: "left center" }}
                >
                  <div className="btn-outer">
                    <div className="btn-inner">
                      <span>3D World</span>
                    </div>
                  </div>
                </button>
              </motion.div>
            </nav>

            {/* Footer */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
              className="px-8 pb-10"
            >
              <span className="font-mono text-[10px] text-white/15 tracking-widest">
                TKPR · {new Date().getFullYear()}
              </span>
            </motion.footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
