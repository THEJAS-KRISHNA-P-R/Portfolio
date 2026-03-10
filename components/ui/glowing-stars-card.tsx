"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const GlowingStarsBackgroundCard = ({
    className,
    children,
    glowColor = "#00e676",
}: {
    className?: string
    children?: React.ReactNode
    glowColor?: string
}) => {
    const [mouseEnter, setMouseEnter] = useState(false)

    return (
        <div
            onMouseEnter={() => setMouseEnter(true)}
            onMouseLeave={() => setMouseEnter(false)}
            className={cn(
                "relative p-6 rounded-2xl border transition-all duration-300",
                "hover:border-[#00e676]/30",
                "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px]",
                "after:bg-[#ff4d7d] after:transition-all after:duration-300 after:rounded-bl-2xl",
                "hover:after:w-[40%]",
                className
            )}
            style={{
                background: 'rgba(5, 14, 9, 0.28)',
                backdropFilter: 'blur(20px) saturate(155%)',
                WebkitBackdropFilter: 'blur(20px) saturate(155%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderTop: '1px solid rgba(255,255,255,0.13)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                ["--glow" as string]: glowColor,
                willChange: 'transform',
            }}
        >
            <div className="flex justify-center items-center mb-4">
                <Illustration mouseEnter={mouseEnter} glowColor={glowColor} />
            </div>
            <div>{children}</div>
        </div>
    )
}

export const GlowingStarsTitle = ({
    className,
    children,
}: {
    className?: string
    children?: React.ReactNode
}) => (
    <h3 className={cn("font-bold text-xl text-[#e8f5e9] font-display", className)}>
        {children}
    </h3>
)

export const GlowingStarsDescription = ({
    className,
    children,
}: {
    className?: string
    children?: React.ReactNode
}) => (
    <p className={cn("text-sm text-[#5a8a6a] mt-2 leading-relaxed", className)}>
        {children}
    </p>
)

const Illustration = ({
    mouseEnter,
    glowColor,
}: {
    mouseEnter: boolean
    glowColor: string
}) => {
    const stars = 108
    const columns = 18
    const [glowingStars, setGlowingStars] = useState<number[]>([])
    const highlightedStars = useRef<number[]>([])

    useEffect(() => {
        const interval = setInterval(() => {
            highlightedStars.current = Array.from({ length: 5 }, () =>
                Math.floor(Math.random() * stars)
            )
            setGlowingStars([...highlightedStars.current])
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div
            className="h-32 p-1 w-full"
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: "1px",
            }}
        >
            {[...Array(stars)].map((_, starIdx) => {
                const isGlowing = glowingStars.includes(starIdx)
                const delay = (starIdx % 10) * 0.1
                const staticDelay = starIdx * 0.01
                return (
                    <div key={starIdx} className="relative flex items-center justify-center">
                        <Star
                            isGlowing={mouseEnter ? true : isGlowing}
                            delay={mouseEnter ? staticDelay : delay}
                        />
                        {mouseEnter && <Glow delay={staticDelay} color={glowColor} />}
                        <AnimatePresence mode="wait">
                            {isGlowing && <Glow delay={delay} color={glowColor} />}
                        </AnimatePresence>
                    </div>
                )
            })}
        </div>
    )
}

const Star = ({ isGlowing, delay }: { isGlowing: boolean; delay: number }) => (
    <motion.div
        key={delay}
        initial={{ scale: 1 }}
        animate={{
            scale: isGlowing ? [1, 1.2, 2.5, 2.2, 1.5] : 1,
            background: isGlowing ? "#fff" : "#2a4a3a",
        }}
        transition={{ duration: 2, ease: "easeInOut", delay }}
        className="bg-[#2a4a3a] h-[1px] w-[1px] rounded-full relative z-20"
    />
)

const Glow = ({ delay, color }: { delay: number; color: string }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut", delay }}
        exit={{ opacity: 0 }}
        className="absolute left-1/2 -translate-x-1/2 z-10 h-[4px] w-[4px] rounded-full blur-[1px]"
        style={{
            backgroundColor: color,
            boxShadow: `0 0 6px 2px ${color}80`,
        }}
    />
)
