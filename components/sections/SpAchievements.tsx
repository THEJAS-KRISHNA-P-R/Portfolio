"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { FadeIn } from "@/components/ui";

// ── Liquid-glass cert card ────────────────────────────────────────
function CertGlassCard({
    children,
    glowColor = "#00e676",
}: {
    children: React.ReactNode;
    glowColor?: string;
}) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileHover={{ y: -4, scale: 1.015 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="h-full rounded-[20px] p-6 flex flex-col items-start justify-between min-h-[200px] cursor-default relative overflow-hidden"
            style={{
                background: "rgba(5, 14, 9, 0.28)",
                backdropFilter: "blur(20px) saturate(160%)",
                WebkitBackdropFilter: "blur(20px) saturate(160%)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderTop: "1px solid rgba(255,255,255,0.16)",
                boxShadow: hovered
                    ? `0 20px 48px rgba(0,0,0,0.45), 0 0 0 1px ${glowColor}22, inset 0 1px 0 rgba(255,255,255,0.1)`
                    : "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
                transition: "box-shadow 0.3s ease",
                willChange: 'transform',
            }}
        >
            {/* Radial glow on hover */}
            <motion.div
                className="absolute inset-0 pointer-events-none rounded-[20px]"
                style={{ background: `radial-gradient(circle at 50% 0%, ${glowColor}18 0%, transparent 60%)` }}
                animate={{ opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />
            {children}
        </motion.div>
    );
}


export function SpAchievements() {
    const { certifications, addCertification } = usePortfolioStore();



    return (
        <div className="w-full flex flex-col items-center">

            {/* ACHIEVEMENTS SUB-SECTION */}
            <div className="w-full max-w-[1100px] flex flex-col items-start gap-12">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-primary)]">
                        ACHIEVEMENTS
                    </span>
                    <h2 className="font-display text-[36px] tracking-tight leading-tight text-[var(--color-text)]">
                        Recognition & wins.
                    </h2>
                </div>

                <div className="relative w-full">

                    {/* Stats row — full width, 4 cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                        {[
                            { value: '1×', label: 'Gold', color: '#f5c842' },
                            { value: '4×', label: 'Silver', color: '#94a3b8' },
                            { value: '2×', label: 'First Prize', color: '#00e676' },
                            { value: '2×', label: 'Certs', color: '#a78bfa' },
                        ].map(({ value, label, color }, i) => (
                            <motion.div
                                key={label}
                                initial={{ y: 20 }}
                                whileInView={{ y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                                whileHover={{ y: -3, scale: 1.03 }}
                                className="rounded-2xl p-5 flex flex-col gap-1 items-center justify-center text-center"
                                style={{
                                    background: 'rgba(5, 14, 9, 0.28)',
                                    backdropFilter: 'blur(16px) saturate(140%)',
                                    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                                    border: `1px solid ${color}20`,
                                    borderTop: `1px solid ${color}40`,
                                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)`,
                                }}
                            >
                                <span className="font-display font-bold text-4xl" style={{ color }}>
                                    {value}
                                </span>
                                <span className="font-mono text-xs tracking-widest uppercase mt-1" style={{ color: '#6a9a7a' }}>
                                    {label}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Masonry grid — 3 columns, cards at different heights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">

                        {/* Column 1 */}
                        <div className="flex flex-col gap-5">
                            <AchievementCard
                                date="Nov 2024"
                                title="First Prize — Digital Repair Café"
                                desc="Led development of a React Native cross-platform app for electronics repair."
                                tag="COMPUTER SCIENCE"
                                tagColor="#00e676"
                                accent="#00e676"
                                size="large"
                            />
                            <AchievementCard
                                date="2020"
                                title="SSLC — Full A+"
                                desc="Achieved 98.7% across all subjects in grade 10 board examinations."
                                tag="ACADEMIC"
                                tagColor="#94a3b8"
                                accent="#94a3b8"
                                size="small"
                            />
                        </div>

                        {/* Column 2 — offset down */}
                        <div className="flex flex-col gap-5 lg:mt-10">
                            <AchievementCard
                                date="Feb 2026"
                                title="First Prize — AI workshop (Deeplearning)"
                                desc="Solved problems of image classification using deep learning and created a model for it."
                                tag="AI / DL"
                                tagColor="#a78bfa"
                                accent="#a78bfa"
                                size="large"
                            />
                            <AchievementCard
                                date="2019"
                                title="State-Level Karate Gold Medal"
                                desc="First place in Kumite (Sparring) at the Kerala State Karate Championship."
                                tag="SPORTS"
                                tagColor="#f5c842"
                                accent="#f5c842"
                                size="medium"
                            />
                        </div>

                        {/* Column 3 */}
                        <div className="flex flex-col gap-5">
                            <AchievementCard
                                date="2021"
                                title="Plus Two — 95.3%"
                                desc="Distinction in Computer Science & Mathematics stream during Class XII."
                                tag="ACADEMIC"
                                tagColor="#94a3b8"
                                accent="#94a3b8"
                                size="small"
                            />
                            <AchievementCard
                                date="2017–2022"
                                title="State-Level Karate Silver Medals"
                                desc="Secured four silver medals across consecutive junior state-level tournaments."
                                tag="SPORTS"
                                tagColor="#f5c842"
                                accent="#f5c842"
                                size="medium"
                            />
                            <AchievementCard
                                date="2024"
                                title="TCS ION NGT Certification"
                                desc="Achieved high competencies in cognitive skills and basic programming."
                                tag="CERTIFICATION"
                                tagColor="#4fc3f7"
                                accent="#4fc3f7"
                                size="small"
                            />
                        </div>

                    </div>
                </div>

            </div>

            {/* DIVIDER */}
            <div className="w-full max-w-[1100px] h-[1px] bg-[rgba(0,230,118,0.08)] my-16"></div>

            {/* CERTIFICATIONS SUB-SECTION */}
            <div id="certifications" className="w-full max-w-[1100px] flex flex-col items-start gap-12">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-primary)]">
                        CERTIFICATIONS
                    </span>
                    <h2 className="font-display text-[36px] tracking-tight leading-tight text-[var(--color-text)]">
                        Credentials.
                    </h2>
                </div>

                {/* Static Highlight Card */}
                <FadeIn delay={0.1}>
                    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center p-7 rounded-[24px] gap-6"
                        style={{
                            background: 'rgba(5, 14, 9, 0.3)',
                            backdropFilter: 'blur(20px) saturate(160%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                            border: '1px solid rgba(245,200,66,0.25)',
                            borderTop: '1px solid rgba(245,200,66,0.40)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.25)',
                        }}>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shrink-0 select-none"
                            style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.25)' }}>
                            🥇
                        </div>
                        <div className="flex flex-col h-full justify-center flex-1 min-w-0">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                                <h3 className="font-display font-bold text-[22px] text-white mb-1">AI Workshop Winner</h3>
                                <span className="font-mono text-[10px] px-3 py-1 bg-[rgba(245,200,66,0.1)] text-[#f5c842] rounded-full border border-[rgba(245,200,66,0.2)] whitespace-nowrap">Competition Win</span>
                            </div>
                            <p className="font-body text-[14px] text-white/60 mb-3">
                                Won 1st Prize in the AI Workshop at CCE.
                            </p>
                            <span className="font-mono text-[12px] text-[#f5c842]">
                                Christ College · Feb 2026
                            </span>
                        </div>
                    </div>
                </FadeIn>

                {/* Certifications Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certifications.map((cert, idx) => {
                        const glowColor = cert.issuer.includes("Meta") ? '#1e90ff'
                            : cert.issuer.includes("Google") ? '#ff4d7d'
                            : '#f5c842';
                        return (
                            <FadeIn key={cert.id} delay={idx * 0.08}>
                                <div className="h-full w-full">
                                    <CertGlassCard glowColor={glowColor}>
                                        <div className="w-full flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start gap-2">
                                                <span
                                                    className="px-3 py-1 rounded-full font-mono text-[11px] font-bold shrink-0"
                                                    style={{
                                                        background: cert.issuer.includes("Meta") ? 'rgba(30,144,255,0.12)' : cert.issuer.includes("Google") ? 'rgba(255,77,125,0.12)' : 'rgba(245,200,66,0.12)',
                                                        color: cert.issuer.includes("Meta") ? '#5baeff' : cert.issuer.includes("Google") ? '#ff7aaa' : '#f5c842',
                                                        border: `1px solid ${glowColor}30`,
                                                    }}
                                                >
                                                    {cert.issuer}
                                                </span>
                                                <span className="font-mono text-[11px] text-white/55 whitespace-nowrap mt-0.5 shrink-0">
                                                    {cert.date}
                                                </span>
                                            </div>
                                            <div className="mt-8">
                                                <h3 className="font-display font-bold text-[18px] text-white leading-tight mb-4">
                                                    {cert.name}
                                                </h3>
                                                {cert.url && (
                                                    <a
                                                        href={cert.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-body font-medium text-[13px] text-[#00e676] hover:underline relative z-30"
                                                    >
                                                        View Certificate →
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </CertGlassCard>
                                </div>
                            </FadeIn>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}

function AchievementCard({
    date, title, desc, tag, tagColor, accent, size
}: {
    date: string; title: string; desc: string
    tag: string; tagColor: string; accent: string
    size: 'small' | 'medium' | 'large'
}) {
    const padding = size === 'large' ? 'p-7' : size === 'medium' ? 'p-6' : 'p-5'
    const [hovered, setHovered] = useState(false)

    return (
        <motion.div
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            initial={{ y: 16 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className={`rounded-2xl ${padding} flex flex-col gap-3 relative overflow-hidden`}
            style={{
                background: 'rgba(5, 14, 9, 0.3)',
                backdropFilter: 'blur(16px) saturate(150%)',
                WebkitBackdropFilter: 'blur(16px) saturate(150%)',
                border: `1px solid ${accent}18`,
                borderTop: `1px solid ${accent}50`,
                boxShadow: hovered
                    ? `0 12px 36px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`
                    : `inset 0 1px 0 rgba(255,255,255,0.04)`,
                transition: 'box-shadow 0.3s ease',
                willChange: 'transform',
            }}
        >
            {/* Corner glow */}
            <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${accent}14 0%, transparent 70%)`,
                    transform: 'translate(30%, -30%)',
                }}
            />

            {/* Date */}
            <span
                className="font-mono text-[10px] tracking-widest uppercase"
                style={{ color: accent, opacity: 0.9 }}
            >
                {date}
            </span>

            {/* Title */}
            <h4
                className="font-display font-bold leading-snug"
                style={{
                    fontSize: size === 'large' ? '18px' : '15px',
                    color: '#e8f5e9',
                }}
            >
                {title}
            </h4>

            {/* Description — only for medium and large */}
            {size !== 'small' && (
                <p className="text-sm leading-relaxed" style={{ color: '#8fac9c' }}>
                    {desc}
                </p>
            )}

            {/* Tag pill */}
            <span
                className="inline-flex w-fit px-3 py-1 rounded-full font-mono text-[10px] tracking-wider uppercase mt-1"
                style={{
                    background: `${tagColor}12`,
                    border: `1px solid ${tagColor}30`,
                    color: tagColor,
                }}
            >
                {tag}
            </span>
        </motion.div>
    )
}

