"use client";

import { useState, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

// SOURCE: https://reactbits.dev/components/tilted-card
export default function TiltedCard({
    children,
    className = "",
    glowColor = "#ffffff"
}: {
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);

    // Mouse position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth springs for tilt
    const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
    const rotateX = useSpring(useMotionValue(0), springConfig);
    const rotateY = useSpring(useMotionValue(0), springConfig);

    // Background glow position
    const backgroundX = useSpring(useMotionValue(50), springConfig);
    const backgroundY = useSpring(useMotionValue(50), springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Relative mouse position from center (-1 to 1)
        const normalizedX = ((e.clientX - rect.left) / width) * 2 - 1;
        const normalizedY = ((e.clientY - rect.top) / height) * 2 - 1;

        // Apply rotation limits (max 15 degrees)
        rotateX.set(normalizedY * -15);
        rotateY.set(normalizedX * 15);

        // Update glow position (percentages)
        backgroundX.set(((e.clientX - rect.left) / width) * 100);
        backgroundY.set(((e.clientY - rect.top) / height) * 100);
    };

    const handleMouseEnter = () => setHovered(true);

    const handleMouseLeave = () => {
        setHovered(false);
        rotateX.set(0);
        rotateY.set(0);
        backgroundX.set(50);
        backgroundY.set(50);
    };

    const gradientHighlight = useMotionTemplate`radial-gradient(
    circle at ${backgroundX}% ${backgroundY}%,
    ${glowColor}33 0%,
    transparent 50%
  )`;

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative rounded-xl border border-slate-700/50 bg-slate-900/80 p-6 overflow-hidden transform-gpu preserve-3d transition-shadow duration-300 ${hovered ? 'shadow-2xl' : 'shadow-none'} ${className}`}
            style={{
                rotateX,
                rotateY,
                boxShadow: hovered ? `0 20px 40px -20px ${glowColor}66` : undefined
            }}
        >
            {/* Inner subtle glow reflection */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
                style={{
                    background: gradientHighlight,
                    opacity: hovered ? 1 : 0
                }}
            />
            <div className="relative z-20">
                {children}
            </div>
        </motion.div>
    );
}
