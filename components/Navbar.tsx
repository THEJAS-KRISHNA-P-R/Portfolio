"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import GlassSurface from "@/components/GlassSurface"

export function Navbar() {
  const setIsGameMode = usePortfolioStore(s => s.setIsGameMode)
  const isGameMode    = usePortfolioStore(s => s.isGameMode)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Don't render navbar inside game world
  if (isGameMode) return null

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href) ?? false

  const navLinks = [
    { label: "Portfolio", href: "/" },
    { label: "About",     href: "/#about" },
    { label: "Projects",  href: "/#projects" },
    { label: "Contact",   href: "/#contact" },
  ]

  return (
    <>
      {/* ── DESKTOP FLOATING PILL ──────────────────────────────── */}
      <div
        className="hidden md:flex fixed top-4 z-[200] w-[720px] max-w-[calc(100vw-2rem)]"
        style={{ left: '50%', transform: 'translate(-50%, 0) translateZ(0)', willChange: 'transform' }}
      >
        <GlassSurface
          width="100%"
          height={52}
          borderRadius={100}
          borderWidth={0.06}
          brightness={12}
          opacity={0.9}
          blur={14}
          distortionScale={-160}
          redOffset={0}
          greenOffset={8}
          blueOffset={18}
          backgroundOpacity={0.06}
          saturation={1.3}
          className="w-full glass-surface-fixed"
        >
          <div className="flex items-center justify-between w-full px-5 gap-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold tracking-widest text-[#00e676]">
                TKPR
              </span>
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-0.5">
              {navLinks.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "text-[#00e676] bg-[#00e676]/10"
                      : "text-white/50 hover:text-white hover:bg-white/[0.07]"
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
                style={{ transform: 'scale(0.78)', transformOrigin: 'right center' }}
              >
                <div className="btn-outer">
                  <div className="btn-inner">
                    <span>3D World</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </GlassSurface>
      </div>

      {/* ── MOBILE TOP BAR ───────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-[200] px-2 pt-3"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        <GlassSurface
          width="100%"
          height={48}
          borderRadius={100}
          borderWidth={0.05}
          brightness={12}
          opacity={0.9}
          blur={20}
          distortionScale={-150}
          backgroundOpacity={0.06}
          saturation={1.3}
          className="w-full glass-surface-fixed"
        >
          <div className="flex items-center w-full px-4 gap-2">
            <Link href="/" className="text-sm font-bold tracking-widest text-[#00e676] shrink-0">
              TKPR
            </Link>
            <div className="flex-1" />
            <button
              className="hud-portfolio-btn"
              onClick={() => setIsGameMode(true)}
              style={{ transform: 'scale(0.68)', transformOrigin: 'right center' }}
            >
              <div className="btn-outer">
                <div className="btn-inner">
                  <span>3D World</span>
                </div>
              </div>
            </button>
            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen(v => !v)}
              className="p-2 rounded-full text-white/40 hover:text-white/80 transition-colors"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </GlassSurface>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-2 mx-1 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(4,12,8,0.95)',
                border: '1px solid rgba(0,230,118,0.12)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {navLinks.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-5 py-3.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] border-b border-white/[0.04] last:border-0 font-mono tracking-wide transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
