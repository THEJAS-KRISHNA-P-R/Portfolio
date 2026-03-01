import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

export function GlowButton({
    children,
    onClick,
    variant = 'primary',
    className = ''
}: {
    children: React.ReactNode,
    onClick?: () => void,
    variant?: 'primary' | 'ghost' | 'danger',
    className?: string
}) {
    const getColors = () => {
        switch (variant) {
            case 'ghost': return 'text-slate-300 hover:text-white hover:bg-white/10'
            case 'danger': return 'text-red-400 border border-red-500/30 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            default: return 'text-white border border-cyan-400/50 hover:bg-cyan-500/20 shadow-[0_0_20px_rgba(79,195,247,0.4)]'
        }
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`relative px-6 py-2 rounded-full font-medium transition-colors ${getColors()} ${className}`}
        >
            <span className="relative z-10">{children}</span>
        </motion.button>
    )
}
