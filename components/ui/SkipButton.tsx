"use client";

import { useRouter } from "next/navigation";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { ZONES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function SkipButton() {
    const { activeZone, setIsGameMode } = usePortfolioStore();
    const currentZoneData = activeZone ? ZONES[activeZone as keyof typeof ZONES] : null;

    const router = useRouter();

    return (
        <>

            {/* Top Left Zone Indicator */}
            <AnimatePresence>
                {currentZoneData && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="fixed top-6 left-6 z-40 pointer-events-none bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 shadow-lg"
                    >
                        <span className="font-mono text-sm" style={{ color: currentZoneData.color }}>
                            Exploring: {currentZoneData.label}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
