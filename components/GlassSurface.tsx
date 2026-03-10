"use client"

import React, { useId, useState, useEffect } from "react"
import "./GlassSurface.css"

interface GlassSurfaceProps {
  width?: number | string
  height?: number | string
  borderRadius?: number
  borderWidth?: number
  brightness?: number
  opacity?: number
  blur?: number
  distortionScale?: number
  redOffset?: number
  greenOffset?: number
  blueOffset?: number
  backgroundOpacity?: number
  saturation?: number
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}

export default function GlassSurface({
  width = "100%",
  height = 52,
  borderRadius = 100,
  borderWidth = 0.06,
  brightness = 12,
  opacity = 0.9,
  blur = 14,
  distortionScale = -160,
  redOffset = 0,
  greenOffset = 8,
  blueOffset = 18,
  backgroundOpacity = 0.06,
  saturation = 1.3,
  className = "",
  children,
  style,
}: GlassSurfaceProps) {
  const uid = useId().replace(/:/g, "")
  const filterId = `glass-filter-${uid}`

  // Detect touch/mobile devices — skip expensive SVG+chromatic layers on mobile
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches)
  }, [])

  // Chromatic aberration — shift RGB channels slightly
  const rShift = redOffset * 0.5
  const gShift = greenOffset * 0.5
  const bShift = blueOffset * 0.5

  // Convert distortionScale to a positive turbulence base frequency
  const turbFreq = Math.abs(distortionScale) * 0.0003 + 0.008

  const wrapStyle: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    opacity,
    ...style,
  }

  return (
    <div className={`glass-surface-wrapper ${className}`} style={wrapStyle}>
      {/* SVG filter definitions */}
      <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
        <defs>
          {/* Original decoration filter */}
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={turbFreq}
              numOctaves={2}
              seed={42}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={Math.abs(distortionScale) * 0.04}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feColorMatrix type="saturate" values={`${saturation}`} in="displaced" result="saturated" />
            <feComponentTransfer in="saturated" result="brightened">
              <feFuncR type="linear" slope={brightness * 0.09} />
              <feFuncG type="linear" slope={brightness * 0.09} />
              <feFuncB type="linear" slope={brightness * 0.09} />
            </feComponentTransfer>
          </filter>

          {/* Refraction filter — applied via backdrop-filter url() to warp the pixels BEHIND the glass */}
          <filter id={`${filterId}-refract`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.018 0.012"
              numOctaves={2}
              seed={7}
              result="warpNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="warpNoise"
              scale={Math.abs(distortionScale) * 0.055}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* ── Layer 0: Frosted backdrop ── */}
      {/* Mobile: single simple blur layer. Desktop: refraction warp + blur */}
      <div
        className="glass-surface-backdrop"
        style={{
          backdropFilter: isTouch
            ? `blur(${blur}px) brightness(${1 + brightness * 0.05}) saturate(${saturation * 1.2})`
            : `url(#${filterId}-refract) blur(${blur}px) brightness(${1 + brightness * 0.05}) saturate(${saturation * 1.2}) contrast(1.05)`,
          WebkitBackdropFilter: isTouch
            ? `blur(${blur}px) brightness(${1 + brightness * 0.05}) saturate(${saturation * 1.2})`
            : `url(#${filterId}-refract) blur(${blur}px) brightness(${1 + brightness * 0.05}) saturate(${saturation * 1.2}) contrast(1.05)`,
          background: `rgba(8, 18, 12, ${backgroundOpacity})`,
        }}
      />

      {/* ── Chromatic fringe layers — desktop only, too expensive for mobile ── */}
      {!isTouch && (
        <>
          <div
            className="glass-surface-backdrop"
            style={{
              left: 2,
              right: -2,
              backdropFilter: `blur(${blur}px) hue-rotate(18deg) saturate(3)`,
              WebkitBackdropFilter: `blur(${blur}px) hue-rotate(18deg) saturate(3)`,
              opacity: 0.07,
              mixBlendMode: 'screen',
            }}
          />
          <div
            className="glass-surface-backdrop"
            style={{
              left: -2,
              right: 2,
              backdropFilter: `blur(${blur}px) hue-rotate(-22deg) saturate(3)`,
              WebkitBackdropFilter: `blur(${blur}px) hue-rotate(-22deg) saturate(3)`,
              opacity: 0.07,
              mixBlendMode: 'screen',
            }}
          />
        </>
      )}

      {/* ── Layer 2: Dark tinted base — gives glass depth ── */}
      <div
        className="glass-surface-backdrop"
        style={{
          background: `linear-gradient(160deg,
            rgba(255,255,255,0.04) 0%,
            rgba(10,22,16,0.18) 40%,
            rgba(0,0,0,0.22) 100%
          )`,
        }}
      />

      {/* ── Layer 3: Prismatic chromatic aberration fringe ── */}
      <div
        className="glass-surface-backdrop"
        style={{
          background: `linear-gradient(90deg,
            rgba(${Math.round(rShift * 3 + 20)}, 0, 0, 0.055) 0%,
            transparent 28%,
            rgba(0, ${Math.round(gShift * 2 + 14)}, 0, 0.04) 50%,
            transparent 72%,
            rgba(0, 0, ${Math.round(bShift * 3 + 22)}, 0.06) 100%
          )`,
          mixBlendMode: "screen",
        }}
      />

      {/* ── Layer 4: Top specular strip — full width, clips naturally to pill ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '42%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 55%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* ── Layer 5: Diagonal reflection sweep ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(
            118deg,
            transparent 20%,
            rgba(255,255,255,0.05) 34%,
            rgba(255,255,255,0.09) 38%,
            rgba(255,255,255,0.05) 42%,
            transparent 56%
          )`,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* ── Layer 6: Second diagonal streak ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(
            135deg,
            transparent 55%,
            rgba(255,255,255,0.025) 66%,
            rgba(255,255,255,0.05) 70%,
            rgba(255,255,255,0.015) 74%,
            transparent 84%
          )`,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* ── Layer 7: Bottom inner shadow — glass curvature depth ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.18) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* ── Layer 8: Border ring — sits outside overflow so borderRadius must match ── */}
      <div
        className="glass-surface-border"
        style={{
          borderRadius: `${borderRadius}px`,
          border: `${borderWidth + 0.6}px solid rgba(255,255,255,0.13)`,
          boxShadow: `
            inset 0 1.5px 0 rgba(255,255,255,0.18),
            inset 0 -1px 0 rgba(0,0,0,0.25),
            inset 1px 0 0 rgba(255,255,255,0.06),
            inset -1px 0 0 rgba(0,0,0,0.1),
            0 1px 0 rgba(255,255,255,0.06),
            0 4px 24px rgba(0,0,0,0.35),
            0 1px 6px rgba(0,0,0,0.3),
            0 0 0 ${borderWidth}px rgba(0,230,118,0.12),
            0 0 18px rgba(0,200,100,0.06)
          `,
          zIndex: 3,
        }}
      />

      {/* Content — sits above all decoration layers */}
      <div className="glass-surface-content" style={{ zIndex: 4 }}>
        {children}
      </div>
    </div>
  )
}
