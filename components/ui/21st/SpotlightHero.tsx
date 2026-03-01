"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

export function SpotlightHero({
    title,
    subtitle,
    children
}: {
    title: React.ReactNode;
    subtitle: string;
    children?: React.ReactNode;
}) {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-bg/80"
        >
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(79,195,247,0.1), transparent 40%)`,
                }}
            />
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
                {title}
                <p className="mt-6 text-xl text-muted max-w-2xl">{subtitle}</p>
                {children && <div className="mt-8">{children}</div>}
            </div>
        </div>
    );
}
