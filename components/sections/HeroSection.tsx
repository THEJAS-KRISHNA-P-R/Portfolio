"use client";

import { motion } from "framer-motion";
import { SplitText, BlurText, Counter } from "@/components/ui";
import { ShinyButton } from "@/components/ui/shiny-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { SocialButtons } from "@/components/ui/social-buttons";

const fadeUp = (delay = 0) => ({
    initial: { y: 28 },
    animate: { y: 0 },
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export function HeroSection() {
    const marqueeItems = [
        'PYTHON', 'NEXT.JS', 'REACT', 'FLUTTER', 'REACT NATIVE',
        'MongoDB Atlas', 'FIREBASE', 'SUPABASE', 'TAILWIND',
        'PYTHON', 'NEXT.JS', 'REACT', 'FLUTTER', 'REACT NATIVE',
        'MongoDB Atlas', 'FIREBASE', 'SUPABASE', 'TAILWIND',
    ];

    return (
        <section
            id="hero"
            className="relative min-h-[90vh] w-full flex flex-col items-center justify-center"
        >
            <div className="relative z-10 w-full max-w-6xl mx-auto px-8 lg:px-16 flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center flex-1">

                    {/* LEFT COLUMN */}
                    <div className="flex flex-col gap-6 w-full items-start justify-center h-full">

                        {/* NAME */}
                        <motion.div {...fadeUp(0.1)}>
                            <h1
                                className="font-display font-bold leading-[1.0] tracking-tight"
                                style={{ fontSize: 'clamp(42px, 6vw, 72px)', color: '#e8f5e9' }}
                            >
                                Thejas
                            </h1>
                            <h1
                                className="font-display font-bold leading-[1.0] tracking-tight"
                                style={{ fontSize: 'clamp(42px, 6vw, 72px)', color: '#00e676' }}
                            >
                                Krishna P R
                            </h1>
                        </motion.div>

                        {/* Role */}
                        <motion.p {...fadeUp(0.2)} className="font-mono text-base" style={{ color: '#9abfac' }}>
                            Full-Stack Developer & CS Student
                        </motion.p>

                        {/* Bio */}
                        <motion.p
                            {...fadeUp(0.3)}
                            className="text-base leading-relaxed max-w-md"
                            style={{ color: '#8fac9c' }}
                        >
                            Building things for the web. CS Engineering <br />@ Christ College of Engineering (Autonomous), KTU.
                            Karate athlete. Currently exploring AI and Cybersecurity.
                        </motion.p>

                        {/* Stats row */}
                        <motion.div {...fadeUp(0.38)} className="flex gap-10 mt-2 mb-2">
                            {[
                                { value: '5+', label: 'PROJECTS' },
                            ].map(({ value, label }) => (
                                <div key={label} className="flex flex-col gap-1">
                                    <span
                                        className="font-display font-bold"
                                        style={{ fontSize: '28px', color: '#e8f5e9' }}
                                    >
                                        {value}
                                    </span>
                                    <span
                                        className="font-mono text-[10px] tracking-[0.15em]"
                                        style={{ color: '#4a7a5a' }}
                                    >
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </motion.div>

                        {/* CTA buttons */}
                        <motion.div {...fadeUp(0.46)} className="flex items-center gap-4 flex-wrap mt-2">
                            <ShinyButton
                                highlight="#00e676"
                                highlightSubtle="#69f0ae"
                                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                View Projects →
                            </ShinyButton>
                            <ShimmerButton
                                shimmerColor="#00e676"
                                background="rgba(10, 26, 20, 1)"
                                onClick={() => window.open('/THEJAS_KRISHNA_P_R.pdf', '_blank')}
                                className="font-semibold font-display"
                            >
                                Download CV
                            </ShimmerButton>

                            <SocialButtons />
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN — TK monogram */}
                    <motion.div
                        initial={{ scale: 0.92 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                        className="flex items-center justify-center lg:justify-end pb-12 lg:pb-0"
                    >
                        <div
                            className="relative rounded-3xl flex flex-col items-center justify-center hero-monogram"
                            style={{
                                width: '300px',
                                height: '300px',
                                background: 'rgba(6, 18, 12, 0.35)',
                                backdropFilter: 'blur(24px) saturate(160%)',
                                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                                border: '1px solid rgba(0,230,118,0.2)',
                                borderTop: '1px solid rgba(0,230,118,0.35)',
                                boxShadow: '0 0 80px -20px rgba(0,230,118,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                            }}
                        >
                            <span
                                className="font-display font-bold"
                                style={{
                                    fontSize: '88px',
                                    color: '#00e676',
                                    textShadow: '0 0 40px rgba(0,230,118,0.5)',
                                    lineHeight: 1,
                                }}
                            >
                                TK
                            </span>
                            <div
                                className="absolute bottom-5 px-4 py-1.5 rounded-full font-mono text-xs text-center"
                                style={{
                                    background: 'rgba(0,230,118,0.08)',
                                    border: '1px solid rgba(0,230,118,0.2)',
                                    color: '#7aaa8a',
                                }}
                            >
                                Christ College of Engineering
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Tech Stack Marquee - Full Width */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="w-full overflow-hidden mt-12"
                style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
            >
                <div
                    className="flex gap-8 w-max"
                    style={{
                        animation: 'marquee-scroll 25s linear infinite',
                    }}
                >
                    {marqueeItems.map((tech, i) => (
                        <span
                            key={i}
                            className="text-xs font-mono tracking-[0.2em] uppercase flex items-center gap-3 shrink-0"
                            style={{ color: '#3a6a4a' }}
                        >
                            {tech}
                            <span style={{ color: '#1a3a2a' }}>•</span>
                        </span>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
