"use client";

import { useState, useEffect } from "react";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { ZONES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const {
        isGameMode,
        setIsGameMode,
        setActiveZone,
        setTeleportTarget
    } = usePortfolioStore();

    // Handle global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // CMD+K or CTRL+K
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((open) => !open);
            }

            // Escape
            if (e.key === "Escape" && open) {
                setOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open]);

    const handleAction = (action: () => void) => {
        action();
        setOpen(false);
    };

    const teleports = Object.values(ZONES).map(zone => ({
        id: `teleport-${zone.id}`,
        label: `Go to ${zone.label.replace(/[^a-zA-Z\s]/g, "").trim()}`, // Remove emoji
        icon: "→",
        action: () => {
            if (!isGameMode) setIsGameMode(true);
            setActiveZone(null);
            setTeleportTarget(zone.position);
        }
    }));

    const modes = [
        {
            id: "mode-standard",
            label: "Switch to Standard View",
            icon: "📋",
            action: () => {
                setIsGameMode(false);
                setActiveZone(null);
            }
        },
        {
            id: "mode-game",
            label: "Switch to 3D Game Mode",
            icon: "🎮",
            action: () => setIsGameMode(true)
        }
    ];

    const filteredItems = [...teleports, ...modes].filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] sm:pt-[25vh]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-xl mx-4 relative bg-[#0f1923] border border-[#1a2332] rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center space-x-3 px-4 py-4 border-b border-slate-800">
                            <span className="text-slate-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Type a command or search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-slate-500 font-body text-lg"
                                autoFocus
                            />
                            <span className="text-xs font-mono text-slate-500 px-2 py-1 bg-slate-800 rounded">ESC</span>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {filteredItems.length === 0 ? (
                                <div className="p-6 text-center text-slate-500">No results found.</div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredItems.map((item, idx) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleAction(item.action)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-slate-300 hover:text-white hover:bg-slate-800/80 group ${idx === 0 && search === "" ? "bg-slate-800/40" : ""}`}
                                        >
                                            <span className="text-xl opacity-70 group-hover:opacity-100">{item.icon}</span>
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
