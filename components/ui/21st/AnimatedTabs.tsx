"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function AnimatedTabs({
    tabs,
    activeTab,
    setActiveTab
}: {
    tabs: string[],
    activeTab: string,
    setActiveTab: (t: string) => void
}) {
    return (
        <div className="flex space-x-2 border-b border-slate-700/50 mb-6">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? "text-white" : "text-slate-400 hover:text-slate-200"
                        }`}
                >
                    {activeTab === tab && (
                        <motion.div
                            layoutId="tab-indicator"
                            className="absolute inset-y-0 left-0 w-full border-b-2 border-cyan-400"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    {tab}
                </button>
            ))}
        </div>
    );
}
