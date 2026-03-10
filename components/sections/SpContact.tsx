"use client";

import { motion } from "framer-motion";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { GlowButton, FadeIn } from "@/components/ui";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { SocialButtons } from "@/components/ui/social-buttons";

const fadeUp = (delay = 0) => ({
    initial: { y: 22 },
    whileInView: { y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export function SpContact() {
    const setIsGameMode = usePortfolioStore(state => state.setIsGameMode);

    return (
        <div className="w-full flex flex-col items-center">

            {/* ENTREPRENEURSHIP SUB-SECTION */}
            <div id="entrepreneurship" className="w-full max-w-[1100px] flex flex-col items-start gap-8 pt-28 pb-16">

                {/* Section Label */}
                <div className="flex justify-start w-full mb-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-primary)]">
                        ENTREPRENEURSHIP
                    </span>
                </div>

                {/* Entrepreneurship Full Width Card */}
                <FadeIn className="w-full">
                    <div className="w-full flex flex-col lg:flex-row p-8 lg:p-12 gap-12 items-center"
                        style={{
                            background: 'rgba(5, 14, 9, 0.28)',
                            backdropFilter: 'blur(24px) saturate(160%)',
                            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                            border: '1px solid rgba(0,230,118,0.2)',
                            borderTop: '1px solid rgba(0,230,118,0.35)',
                            borderRadius: '24px',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                        }}>

                        {/* Left Side */}
                        <div className="flex-1 flex flex-col items-start justify-center gap-5">
                            <span className="font-mono text-[11px] px-3 py-1 font-bold rounded-full bg-[rgba(0,230,118,0.08)] text-[var(--color-primary)]">
                                Instructor
                            </span>

                            <h2 className="font-display text-[32px] font-bold tracking-tight leading-tight text-[var(--color-text)]">
                                My Dojo
                            </h2>

                            <div className="font-body italic text-[14px] text-[var(--color-muted)] -mt-2">
                                Building Strength, Focus, and Discipline on the Mats                            </div>

                            <p className="font-body text-[14px] leading-[1.9] max-w-[460px]" style={{ color: '#8fac9c' }}>
                                I lead daily training sessions for martial artists of all ages, moving students from white belt basics to advanced black belt techniques. My focus is on high-intensity drills, sparring strategy, and helping every student push past their physical limits. I don't just teach the moves; I manage the progress, grading, and mindset of the entire dojo to ensure everyone is performing at their peak.                            </p>

                            <span className="font-mono text-[12px] text-[var(--color-muted)] px-3 py-1 border border-[var(--color-border)] rounded-full">
                                Kodungallur, Kerala, India
                            </span>

                            <ShimmerButton
                                shimmerColor="#ffee00ff"
                                background="rgba(202, 0, 0, 1)"
                                onClick={() => window.location.href = "mailto:Thejas2124@gmail.com?subject=Nettipattam Order Inquiry"}
                                className="mt-4 font-semibold font-display"
                            >
                                Join a Session →
                            </ShimmerButton>
                        </div>

                        {/* Right Side Visual */}
                        <div className="w-full lg:w-auto flex flex-col items-center justify-center gap-4">
                            <div className="w-[200px] h-[200px] flex items-center justify-center rounded-[20px]"
                                style={{
                                    background: 'rgba(0,230,118,0.04)',
                                    border: '1px solid rgba(0,230,118,0.08)'
                                }}>
                                <span className="text-[72px] transform transition-transform duration-500 hover:scale-110 cursor-default">👑</span>
                            </div>
                            <span className="font-mono text-[12px] text-[var(--color-faint)] tracking-widest uppercase">
                                The Sweat and Pain
                            </span>
                        </div>
                    </div>
                </FadeIn>

                {/* Info Card Below */}
                <FadeIn delay={0.1} className="w-full">
                    <div className="w-full p-6 lg:p-8 flex flex-col gap-3"
                        style={{
                            background: 'rgba(5, 12, 20, 0.3)',
                            backdropFilter: 'blur(20px) saturate(150%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                            border: '1px solid rgba(30,144,255,0.18)',
                            borderTop: '1px solid rgba(30,144,255,0.30)',
                            borderRadius: '16px',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                        }}>
                        <h4 className="font-display font-medium text-[16px] text-[var(--color-text)]">
                            What We Train?
                        </h4>
                        <p className="font-body text-[14px] leading-[1.7]" style={{ color: '#8fac9c' }}>
                            Training in Goju-Ryu is about blending linear "hard" (go) strikes with circular "soft" (ju) techniques and mental toughness. Every session is designed to sharpen reflexes through Kata (forms) and Kumite (sparring). We don't just practice for the trophies; we train to build a level of discipline that carries over into every other part of life.                        </p>
                    </div>
                </FadeIn>

            </div>

            {/* CONTACT SUB-SECTION */}
            <div id="contact" className="w-full pt-28 pb-16 flex flex-col items-center max-w-[600px] mx-auto text-center gap-8">

                {/* Header */}
                <motion.div {...fadeUp(0)} className="flex flex-col gap-4 items-center">
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-primary)]">
                        CONTACT
                    </span>
                    <h2 className="font-display text-[48px] tracking-tight leading-tight text-[var(--color-text)]">
                        Let&apos;s work together.
                    </h2>
                    <p className="font-body text-[16px] mb-6" style={{ color: '#8fac9c' }}>
                        Open to internships, freelance, and collaborations.
                    </p>
                </motion.div>

                {/* Contact Cards Row */}
                <motion.div {...fadeUp(0.12)} className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="mailto:thejas2124@gmail.com" className="pink-card-hover rounded-[16px] p-5 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group"
                        style={{
                            background: 'rgba(5,14,9,0.28)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                        <span className="text-[20px] mb-1 group-hover:scale-110 transition-transform">Mail @</span>
                        <span className="font-mono text-[11px] text-white/70 truncate max-w-full">thejas2124@gmail.com</span>
                    </a>
                    <div className="pink-card-hover rounded-[16px] p-5 flex flex-col items-center justify-center gap-2 cursor-default group"
                        style={{
                            background: 'rgba(5,14,9,0.28)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                        <span className="text-[20px] mb-1 group-hover:scale-110 transition-transform">Phone</span>
                        <span className="font-mono text-[12px] text-white/80">+91 7907242282</span>
                    </div>
                    <div className="pink-card-hover rounded-[16px] p-5 flex flex-col items-center justify-center gap-2 cursor-default group"
                        style={{
                            background: 'rgba(5,14,9,0.28)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                        <span className="text-[20px] mb-1 group-hover:scale-110 transition-transform">Loc</span>
                        <span className="font-mono text-[11px] text-white/70 leading-tight">Vadanappally,Thrissur<br />Kerala</span>
                    </div>

                </motion.div>

                {/* Large CTA Component */}
                <FadeIn delay={0.2}>
                    <ShimmerButton
                        shimmerColor="#ff4d7d"
                        background="rgba(10, 5, 8, 1)"
                        onClick={() => window.location.href = "mailto:Thejas2124@gmail.com"}
                        className="font-semibold font-display"
                    >
                        Send me an email →
                    </ShimmerButton>
                </FadeIn>

            </div>

            {/* FOOTER */}
            <footer className="w-full border-t border-[rgba(0,230,118,0.06)] py-10 mt-12 bg-transparent text-[var(--color-muted)]">
                <div className="max-w-[1100px] mx-auto px-6 w-full flex flex-col gap-10">

                    {/* Top Row: 3 Columns */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

                        {/* Left */}
                        <div className="flex flex-col gap-2">
                            <div className="font-display font-bold text-[20px] text-[var(--color-primary)] mb-1">
                                THEJAS
                            </div>
                            <h3 className="font-body font-semibold text-[15px] text-[var(--color-text)]">
                                Thejas Krishna P R
                            </h3>
                            <span className="font-body text-[13px] text-[var(--color-muted)]">
                                Christ College of Engineering
                            </span>
                        </div>

                        {/* Center */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 max-w-[300px] justify-center md:justify-start">
                            <a href="#about" className="pink-nav-link font-mono text-[13px]">About</a>
                            <a href="#projects" className="pink-nav-link font-mono text-[13px]">Projects</a>
                            <a href="#achievements" className="pink-nav-link font-mono text-[13px]">Achievements</a>
                            <a href="#certifications" className="pink-nav-link font-mono text-[13px]">Certifications</a>
                            <a href="#contact" className="pink-nav-link font-mono text-[13px]">Contact</a>
                        </div>

                        {/* Right */}
                        <div className="flex mt-4 md:mt-0">
                            <button
                                className="hud-portfolio-btn"
                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    setTimeout(() => setIsGameMode(true), 100);
                                }}
                                style={{ transform: 'scale(0.85)', transformOrigin: 'right center' }}
                            >
                                <div className="btn-outer">
                                    <div className="btn-inner">
                                        <span>Back to 3D World</span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="w-full flex flex-col md:flex-row justify-between items-center pt-6 border-t border-[rgba(0,230,118,0.06)] gap-4">
                        <span className="font-mono text-[11px] text-[var(--color-faint)]">
                            © 2026 Thejas Krishna P R
                        </span>
                        <SocialButtons />
                    </div>

                </div>
            </footer>

        </div>
    );
}
