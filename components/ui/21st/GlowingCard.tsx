"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export const GlowingCard = ({
    children,
    glowColor = "#4fc3f7",
    className = "",
    glass = false,
    innerClassName = "",
}: {
    children: React.ReactNode;
    glowColor?: string;
    className?: string;
    glass?: boolean;
    innerClassName?: string;
}) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className={`relative group ${className}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Background Glow */}
            <div
                className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-60 transition duration-500"
                style={{ background: glowColor, filter: "blur(16px)" }}
            />

            {/* Card Content */}
            <motion.div
                className={`relative h-full rounded-xl p-6 flex flex-col items-start overflow-hidden ${innerClassName}`}
                style={glass ? {
                    background: 'rgba(5, 14, 9, 0.28)',
                    backdropFilter: 'blur(20px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: hovered
                        ? `0 20px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.09)`
                        : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                } : {
                    background: '#0f1923',
                    border: '1px solid #1a2332',
                }}
                animate={{ boxShadow: hovered && glass ? `0 20px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.09)` : undefined }}
            >
                {children}
            </motion.div>
        </div>
    );
};
