"use client";

import { motion } from "framer-motion";

export const GlowingCard = ({
    children,
    glowColor = "#4fc3f7",
    className = "",
}: {
    children: React.ReactNode;
    glowColor?: string;
    className?: string;
}) => {
    return (
        <div className={`relative group ${className}`}>
            {/* Background Glow */}
            <div
                className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur-lg"
                style={{ background: glowColor, filter: "blur(12px)" }}
            ></div>

            {/* Card Content */}
            <div className="relative h-full bg-[#0f1923] border border-[#1a2332] rounded-xl p-6 flex flex-col items-start overflow-hidden">
                {children}
            </div>
        </div>
    );
};
