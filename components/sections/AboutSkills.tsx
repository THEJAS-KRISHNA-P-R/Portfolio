"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui";

const fadeUp = (delay = 0) => ({
    initial: { y: 20 },
    whileInView: { y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

// Glass style for education timeline cards
const glassCard: React.CSSProperties = {
    background: 'rgba(5, 14, 9, 0.3)',
    backdropFilter: 'blur(16px) saturate(150%)',
    WebkitBackdropFilter: 'blur(16px) saturate(150%)',
    border: '1px solid rgba(255,255,255,0.07)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
    willChange: 'backdrop-filter',
};

export function AboutSkills() {
    return (
        <div className="w-full flex flex-col items-center">

            {/* Section Label */}
            <div className="w-full max-w-[1100px] flex justify-start mb-12">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-primary)]">
                    ABOUT
                </span>
            </div>

            <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                {/* LEFT COLUMN: About + Education */}
                <div className="flex flex-col gap-8 w-full">

                    {/* Header */}
                    <div>
                        <h2 className="font-display text-[36px] tracking-tight leading-tight">
                            <span style={{ color: '#5a8a6a', fontWeight: 300 }}>A bit </span>
                            <span className="text-[var(--color-text)]">about me.</span>
                        </h2>
                    </div>

                    {/* Bio Paragraph */}
                    <motion.p {...fadeUp(0.15)} className="font-body max-w-[460px]" style={{ color: '#aacfba', lineHeight: '1.85', fontSize: '16px' }}>
                        I'm a Full-Stack Developer and Computer Science Engineering student currently studying at Christ College of Engineering, KTU.
                        I specialize in building rich, interactive web applications, I am familiar with Next.js, React, Flutter, React Native Frameworks.
                        Beyond the screen, I am a passionate sports enthusiast and athlete, holding multiple State-Level Karate medals.
                        My journey bridges logical problem-solving in software engineering with discipline developed through martial arts.
                    </motion.p>

                    {/* Education Timeline */}
                    <motion.div {...fadeUp(0.25)} className="flex flex-col gap-4 mt-4 max-w-[460px]">

                        {/* Timelin Entry: B.Tech */}
                        <div className="relative overflow-hidden rounded-[16px] p-5"
                            style={glassCard}>
                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--color-primary)] rounded-r-[2px]" />

                            <div className="flex justify-between items-start mb-2 pl-2">
                                <h3 className="font-body text-[14px] text-[var(--color-text)] font-medium pt-1">
                                    B.Tech in Computer Science
                                </h3>
                                <div className="px-3 py-1 rounded-full font-mono text-[11px] whitespace-nowrap"
                                    style={{ background: 'rgba(0,230,118,0.1)', color: 'var(--color-primary)' }}>
                                    Pursuing
                                </div>
                            </div>
                            <div className="font-mono text-[11px] text-[var(--color-muted)] pl-2">
                                Christ College of Engineering
                            </div>
                        </div>

                        {/* Timeline Entry: Class XII */}
                        <div className="relative overflow-hidden rounded-[16px] p-5"
                            style={glassCard}>
                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--color-yellow)] rounded-r-[2px]" />

                            <div className="flex justify-between items-start mb-2 pl-2">
                                <h3 className="font-body text-[14px] text-[var(--color-text)] font-medium pt-1">
                                    Higher Secondary (Class XII)
                                </h3>
                                <div className="px-3 py-1 rounded-full font-mono text-[11px] whitespace-nowrap"
                                    style={{ background: 'rgba(245,200,66,0.1)', color: 'var(--color-yellow)' }}>
                                    95.3%
                                </div>
                            </div>
                            <div className="font-mono text-[11px] text-[var(--color-muted)] pl-2">
                                2021
                            </div>
                        </div>

                        {/* Timeline Entry: Class X */}
                        <div className="relative overflow-hidden rounded-[16px] p-5"
                            style={glassCard}>
                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--color-pink)] rounded-r-[2px]" />

                            <div className="flex justify-between items-start mb-2 pl-2">
                                <h3 className="font-body text-[14px] text-[var(--color-text)] font-medium pt-1">
                                    Secondary (Class X)
                                </h3>
                                <div className="px-3 py-1 rounded-full font-mono text-[11px] whitespace-nowrap"
                                    style={{ background: 'rgba(255,77,125,0.1)', color: 'var(--color-pink)' }}>
                                    98.7%
                                </div>
                            </div>
                            <div className="font-mono text-[11px] text-[var(--color-muted)] pl-2">
                                2019
                            </div>
                        </div>

                    </motion.div>
                </div>

                {/* RIGHT COLUMN: Skills */}
                <div className="flex flex-col gap-10 w-full">

                    <h2 className="font-display text-[28px] mb-2" style={{ color: '#e8f5e9', fontWeight: 700 }}>
                        What I work with.
                    </h2>

                    <div className="flex flex-col gap-8">
                        {/* Group: Languages */}
                        <FadeIn delay={0.1}>
                            <div className="flex flex-col gap-3">
                                <div className="font-mono uppercase" style={{ color: '#4a7a5a', fontSize: '11px', letterSpacing: '0.15em' }}>Languages</div>
                                <div className="flex flex-wrap gap-2">
                                    {["Python", "JavaScript", "C/C++", "Java", "SQL"].map((skill, i) => {
                                        const isPrimary = ['Python', 'Next.js', 'React', 'Flutter', 'MongoDB Atlas', 'Firebase'].includes(skill)
                                        return (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center font-mono cursor-default transition-all duration-200"
                                                style={{
                                                    padding: isPrimary ? '6px 14px' : '4px 10px',
                                                    fontSize: isPrimary ? '13px' : '11px',
                                                    borderRadius: '9999px',
                                                    border: `1px solid ${isPrimary ? 'rgba(0,230,118,0.35)' : 'rgba(0,230,118,0.15)'}`,
                                                    background: isPrimary ? 'rgba(0,230,118,0.08)' : 'rgba(0,230,118,0.03)',
                                                    color: isPrimary ? '#7aaa8a' : '#4a7a5a',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.borderColor = 'rgba(255,77,125,0.5)'
                                                    e.currentTarget.style.color = '#ff4d7d'
                                                    e.currentTarget.style.background = 'rgba(255,77,125,0.06)'
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.borderColor = isPrimary ? 'rgba(0,230,118,0.35)' : 'rgba(0,230,118,0.15)'
                                                    e.currentTarget.style.color = isPrimary ? '#7aaa8a' : '#4a7a5a'
                                                    e.currentTarget.style.background = isPrimary ? 'rgba(0,230,118,0.08)' : 'rgba(0,230,118,0.03)'
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        </FadeIn>

                        <div className="w-full h-px my-1" style={{ background: 'linear-gradient(to right, transparent, rgba(0,230,118,0.15), transparent)' }} />

                        {/* Group: Frameworks */}
                        <FadeIn delay={0.2}>
                            <div className="flex flex-col gap-3">
                                <div className="font-mono uppercase" style={{ color: '#4a7a5a', fontSize: '11px', letterSpacing: '0.15em' }}>Frameworks</div>
                                <div className="flex flex-wrap gap-2">
                                    {["Next.js", "React", "TailwindCSS"].map((skill, i) => {
                                        const isPrimary = ['Python', 'Next.js', 'React', 'TypeScript', 'Flutter', 'MongoDB Atlas', 'Firebase'].includes(skill)
                                        return (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center font-mono cursor-default transition-all duration-200"
                                                style={{
                                                    padding: isPrimary ? '6px 14px' : '4px 10px',
                                                    fontSize: isPrimary ? '13px' : '11px',
                                                    borderRadius: '9999px',
                                                    border: `1px solid ${isPrimary ? 'rgba(0,230,118,0.35)' : 'rgba(0,230,118,0.15)'}`,
                                                    background: isPrimary ? 'rgba(0,230,118,0.08)' : 'rgba(0,230,118,0.03)',
                                                    color: isPrimary ? '#7aaa8a' : '#4a7a5a',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.borderColor = 'rgba(255,77,125,0.5)'
                                                    e.currentTarget.style.color = '#ff4d7d'
                                                    e.currentTarget.style.background = 'rgba(255,77,125,0.06)'
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.borderColor = isPrimary ? 'rgba(0,230,118,0.35)' : 'rgba(0,230,118,0.15)'
                                                    e.currentTarget.style.color = isPrimary ? '#7aaa8a' : '#4a7a5a'
                                                    e.currentTarget.style.background = isPrimary ? 'rgba(0,230,118,0.08)' : 'rgba(0,230,118,0.03)'
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        </FadeIn>

                        <div className="w-full h-px my-1" style={{ background: 'linear-gradient(to right, transparent, rgba(0,230,118,0.15), transparent)' }} />

                        {/* Group: Mobile */}
                        <FadeIn delay={0.3}>
                            <div className="flex flex-col gap-3">
                                <div className="font-mono uppercase" style={{ color: '#4a7a5a', fontSize: '11px', letterSpacing: '0.15em' }}>Mobile</div>
                                <div className="flex flex-wrap gap-2">
                                    {["Flutter", "React Native"].map((skill, i) => {
                                        const isPrimary = ['Python', 'Next.js', 'React', 'TypeScript', 'Flutter', 'MongoDB Atlas', 'Firebase'].includes(skill)
                                        return (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center font-mono cursor-default transition-all duration-200"
                                                style={{
                                                    padding: isPrimary ? '6px 14px' : '4px 10px',
                                                    fontSize: isPrimary ? '13px' : '11px',
                                                    borderRadius: '9999px',
                                                    border: `1px solid ${isPrimary ? 'rgba(0,230,118,0.35)' : 'rgba(0,230,118,0.15)'}`,
                                                    background: isPrimary ? 'rgba(0,230,118,0.08)' : 'rgba(0,230,118,0.03)',
                                                    color: isPrimary ? '#7aaa8a' : '#4a7a5a',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.borderColor = 'rgba(255,77,125,0.5)'
                                                    e.currentTarget.style.color = '#ff4d7d'
                                                    e.currentTarget.style.background = 'rgba(255,77,125,0.06)'
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.borderColor = isPrimary ? 'rgba(0,230,118,0.35)' : 'rgba(0,230,118,0.15)'
                                                    e.currentTarget.style.color = isPrimary ? '#7aaa8a' : '#4a7a5a'
                                                    e.currentTarget.style.background = isPrimary ? 'rgba(0,230,118,0.08)' : 'rgba(0,230,118,0.03)'
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        </FadeIn>

                        <div className="w-full h-px my-1" style={{ background: 'linear-gradient(to right, transparent, rgba(0,230,118,0.15), transparent)' }} />

                        {/* Group: DB / Backend */}
                        <FadeIn delay={0.4}>
                            <div className="flex flex-col gap-3">
                                <div className="font-mono uppercase" style={{ color: '#4a7a5a', fontSize: '11px', letterSpacing: '0.15em' }}>Backend & DB</div>
                                <div className="flex flex-wrap gap-2">
                                    {["MongoDB Atlas", "Firebase", "Supabase", "PostgreSQL"].map((skill, i) => {
                                        const isPrimary = ['Python', 'Next.js', 'React', 'TypeScript', 'Flutter', 'MongoDB Atlas', 'Firebase'].includes(skill)
                                        return (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center font-mono cursor-default transition-all duration-200"
                                                style={{
                                                    padding: isPrimary ? '6px 14px' : '4px 10px',
                                                    fontSize: isPrimary ? '13px' : '11px',
                                                    borderRadius: '9999px',
                                                    border: `1px solid ${isPrimary ? 'rgba(0,230,118,0.35)' : 'rgba(0,230,118,0.15)'}`,
                                                    background: isPrimary ? 'rgba(0,230,118,0.08)' : 'rgba(0,230,118,0.03)',
                                                    color: isPrimary ? '#7aaa8a' : '#4a7a5a',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.borderColor = 'rgba(255,77,125,0.5)'
                                                    e.currentTarget.style.color = '#ff4d7d'
                                                    e.currentTarget.style.background = 'rgba(255,77,125,0.06)'
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.borderColor = isPrimary ? 'rgba(0,230,118,0.35)' : 'rgba(0,230,118,0.15)'
                                                    e.currentTarget.style.color = isPrimary ? '#7aaa8a' : '#4a7a5a'
                                                    e.currentTarget.style.background = isPrimary ? 'rgba(0,230,118,0.08)' : 'rgba(0,230,118,0.03)'
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        </FadeIn>

                        <div className="w-full h-px my-1" style={{ background: 'linear-gradient(to right, transparent, rgba(0,230,118,0.15), transparent)' }} />

                        {/* Group: AI / ML */}
                        <FadeIn delay={0.5}>
                            <div className="flex flex-col gap-3">
                                <div className="font-mono uppercase" style={{ color: '#4a7a5a', fontSize: '11px', letterSpacing: '0.15em' }}>AI / ML</div>
                                <div className="flex flex-wrap gap-2">
                                    {["Deep Learning", "TensorFlow", "Computer Vision"].map((skill, i) => {
                                        const isPrimary = ['Python', 'Next.js', 'React', 'TypeScript', 'Flutter', 'MongoDB Atlas', 'Firebase'].includes(skill)
                                        return (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center font-mono cursor-default transition-all duration-200"
                                                style={{
                                                    padding: isPrimary ? '6px 14px' : '4px 10px',
                                                    fontSize: isPrimary ? '13px' : '11px',
                                                    borderRadius: '9999px',
                                                    border: `1px solid ${isPrimary ? 'rgba(0,230,118,0.35)' : 'rgba(0,230,118,0.15)'}`,
                                                    background: isPrimary ? 'rgba(0,230,118,0.08)' : 'rgba(0,230,118,0.03)',
                                                    color: isPrimary ? '#7aaa8a' : '#4a7a5a',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.borderColor = 'rgba(255,77,125,0.5)'
                                                    e.currentTarget.style.color = '#ff4d7d'
                                                    e.currentTarget.style.background = 'rgba(255,77,125,0.06)'
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.borderColor = isPrimary ? 'rgba(0,230,118,0.35)' : 'rgba(0,230,118,0.15)'
                                                    e.currentTarget.style.color = isPrimary ? '#7aaa8a' : '#4a7a5a'
                                                    e.currentTarget.style.background = isPrimary ? 'rgba(0,230,118,0.08)' : 'rgba(0,230,118,0.03)'
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        </FadeIn>

                    </div>

                    {/* Karate Highlight Card */}
                    <div className="mt-8 flex items-center p-4 rounded-[16px] gap-4"
                        style={{
                            ...glassCard,
                            border: '1px solid rgba(255,77,125,0.18)',
                            borderTop: '1px solid rgba(255,77,125,0.30)',
                        }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                            style={{ background: 'rgba(255,77,125,0.1)' }}>
                            🥋
                        </div>
                        <div className="flex flex-col">
                            <span className="font-body text-[15px] font-bold text-[var(--color-text)]">
                                State-Level Karate
                            </span>
                            <span className="font-body text-[14px] text-[var(--color-muted)]">
                                1× Gold · 4× Silver
                            </span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
