"use client";

import { usePortfolioStore } from "@/store/usePortfolioStore";
import { Counter, FadeIn, TiltedCard, GlowButton } from "@/components/ui";

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
                        ].map(({ value, label, color }) => (
                            <div
                                key={label}
                                className="rounded-2xl p-5 flex flex-col gap-1 items-center justify-center text-center"
                                style={{
                                    background: 'rgba(10,26,20,0.6)',
                                    border: `1px solid ${color}25`,
                                    boxShadow: `inset 0 1px 0 ${color}15`,
                                }}
                            >
                                <span className="font-display font-bold text-4xl" style={{ color }}>
                                    {value}
                                </span>
                                <span className="font-mono text-xs tracking-widest uppercase mt-1" style={{ color: '#4a7a5a' }}>
                                    {label}
                                </span>
                            </div>
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
                                date="Feb 2024"
                                title="First Prize — Make-a-Thon (Computer Vision)"
                                desc="Built a deep learning model for real-time object detection in 24hrs."
                                tag="AI / ML"
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
                    <div className="w-full flex items-center p-8 rounded-[24px] gap-6"
                        style={{
                            background: 'linear-gradient(135deg, rgba(245,200,66,0.05), rgba(10,26,20,0.8))',
                            border: '1px solid rgba(245,200,66,0.2)'
                        }}>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shrink-0"
                            style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)' }}>
                            🥇
                        </div>
                        <div className="flex flex-col h-full justify-center">
                            <div className="flex justify-between items-start">
                                <h3 className="font-display font-bold text-[22px] text-[var(--color-text)] mb-1">Make-a-Thon Workshop Winner</h3>
                                <span className="font-mono text-[11px] px-3 py-1 bg-[rgba(245,200,66,0.1)] text-[var(--color-yellow)] rounded-full">Competition Win</span>
                            </div>
                            <p className="font-body text-[14px] text-[var(--color-muted)] mb-3">
                                Won 1st Prize in the Computer Vision & AI Workshop.
                            </p>
                            <span className="font-mono text-[12px] text-[var(--color-yellow)]">
                                Christ College · Feb 2026
                            </span>
                        </div>
                    </div>
                </FadeIn>

                {/* Certifications Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certifications.map((cert, idx) => (
                        <FadeIn key={cert.id} delay={idx * 0.1}>
                            <div className="h-full w-full">
                                <TiltedCard
                                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[20px] p-6 h-full flex flex-col items-start justify-between min-h-[180px] cursor-pointer"
                                    glowColor={cert.issuer.includes("Meta") ? '#1e90ff' : cert.issuer.includes("Google") ? '#ff4d7d' : '#f5c842'}
                                >
                                    <div className="w-full flex-1 flex flex-col justify-between z-20 pointer-events-none">
                                        <div className="flex justify-between items-start">
                                            <span
                                                className="px-3 py-1 rounded-full font-mono text-[11px] font-bold"
                                                style={{
                                                    background: cert.issuer.includes("Meta") ? 'rgba(30,144,255,0.1)' : cert.issuer.includes("Google") ? 'rgba(255,77,125,0.1)' : 'rgba(245,200,66,0.1)',
                                                    color: cert.issuer.includes("Meta") ? 'var(--color-secondary)' : cert.issuer.includes("Google") ? 'var(--color-pink)' : 'var(--color-yellow)'
                                                }}
                                            >
                                                {cert.issuer}
                                            </span>
                                            <span className="font-mono text-[11px] text-[var(--color-faint)]">
                                                {cert.date}
                                            </span>
                                        </div>
                                        <div className="mt-8">
                                            <h3 className="font-display font-bold text-[18px] text-[var(--color-text)] leading-tight mb-4">
                                                {cert.name}
                                            </h3>
                                            {cert.url && (
                                                <a href={cert.url} target="_blank" className="font-body font-medium text-[13px] text-[var(--color-primary)] hover:underline pointer-events-auto relative z-30">
                                                    View Certificate →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </TiltedCard>
                            </div>
                        </FadeIn>
                    ))}
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

    return (
        <div
            className={`rounded-2xl ${padding} flex flex-col gap-3 relative overflow-hidden`}
            style={{
                background: 'rgba(8, 20, 14, 0.8)',
                border: `1px solid ${accent}20`,
                borderTop: `2px solid ${accent}60`,
            }}
        >
            {/* Faint corner glow */}
            <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)`,
                    transform: 'translate(30%, -30%)',
                }}
            />

            {/* Date */}
            <span
                className="font-mono text-[10px] tracking-widest uppercase"
                style={{ color: accent, opacity: 0.8 }}
            >
                {date}
            </span>

            {/* Title */}
            <h4
                className="font-display font-bold leading-snug"
                style={{
                    fontSize: size === 'large' ? '18px' : '15px',
                    color: '#d4ead8',
                }}
            >
                {title}
            </h4>

            {/* Description — only for medium and large */}
            {size !== 'small' && (
                <p className="text-sm leading-relaxed" style={{ color: '#5a8a6a' }}>
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
        </div>
    )
}

