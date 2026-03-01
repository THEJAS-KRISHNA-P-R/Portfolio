"use client";

import { usePortfolioStore } from "@/store/usePortfolioStore";
import { GlowButton, FadeIn } from "@/components/ui";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { SocialButtons } from "@/components/ui/social-buttons";

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
                            background: 'linear-gradient(135deg, #0a1a14 0%, #0d1f2d 100%)',
                            border: '1px solid rgba(0,230,118,0.12)',
                            borderRadius: '24px'
                        }}>

                        {/* Left Side */}
                        <div className="flex-1 flex flex-col items-start justify-center gap-5">
                            <span className="font-mono text-[11px] px-3 py-1 font-bold rounded-full bg-[rgba(0,230,118,0.08)] text-[var(--color-primary)]">
                                Side Business
                            </span>

                            <h2 className="font-display text-[32px] font-bold tracking-tight leading-tight text-[var(--color-text)]">
                                Golden Crown Arts & Crafts
                            </h2>

                            <div className="font-body italic text-[14px] text-[var(--color-muted)] -mt-2">
                                Preserving Kerala's Cultural Heritage, One Nettipattam at a Time
                            </div>

                            <p className="font-body text-[14px] text-[var(--color-muted)] leading-[1.9] max-w-[460px]">
                                Founder of a handcraft business specializing in traditional Keralan Nettipattams — intricately designed ceremonial elephant headgear pieces that are central to Kerala's vibrant festival culture. Each piece is handcrafted with authentic materials, honoring centuries of artisan tradition.
                            </p>

                            <span className="font-mono text-[12px] text-[var(--color-muted)] px-3 py-1 border border-[var(--color-border)] rounded-full">
                                Kerala, India
                            </span>

                            <ShimmerButton
                                shimmerColor="#f5c842"
                                background="rgba(10, 8, 5, 1)"
                                onClick={() => window.location.href = "mailto:Thejas2124@gmail.com?subject=Nettipattam Order Inquiry"}
                                className="mt-4 font-semibold font-display"
                            >
                                Contact for Orders →
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
                                Nettipattam
                            </span>
                        </div>
                    </div>
                </FadeIn>

                {/* Info Card Below */}
                <FadeIn delay={0.1} className="w-full">
                    <div className="w-full p-6 lg:p-8 flex flex-col gap-3"
                        style={{
                            background: 'rgba(13,31,45,0.6)',
                            border: '1px solid rgba(30,144,255,0.1)',
                            borderRadius: '16px'
                        }}>
                        <h4 className="font-display font-medium text-[16px] text-[var(--color-text)]">
                            What is a Nettipattam?
                        </h4>
                        <p className="font-body text-[14px] text-[var(--color-muted)] leading-[1.7]">
                            A Nettipattam (നെറ്റിപ്പട്ടം) is an ornate golden headpiece worn by elephants during Kerala's grand temple festivals and processions. Crafted from brass, mirrors, and precious stones, it is one of Kerala's most iconic symbols of ceremonial artistry.
                        </p>
                    </div>
                </FadeIn>

            </div>

            {/* CONTACT SUB-SECTION */}
            <div id="contact" className="w-full pt-28 pb-16 flex flex-col items-center max-w-[600px] mx-auto text-center gap-8">

                {/* Header */}
                <div className="flex flex-col gap-4 items-center">
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-primary)]">
                        CONTACT
                    </span>
                    <h2 className="font-display text-[48px] tracking-tight leading-tight text-[var(--color-text)]">
                        Let's work together.
                    </h2>
                    <p className="font-body text-[16px] text-[var(--color-muted)] mb-6">
                        Open to internships, freelance, and collaborations.
                    </p>
                </div>

                {/* Contact Cards Row */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="mailto:thejas2124@gmail.com" className="pink-card-hover bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[16px] p-5 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group">
                        <span className="text-[20px] mb-1 group-hover:scale-110 transition-transform">@</span>
                        <span className="font-mono text-[11px] text-[var(--color-text)] truncate max-w-full">Thejas2124@gmail.com</span>
                    </a>
                    <div className="pink-card-hover bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[16px] p-5 flex flex-col items-center justify-center gap-2 cursor-default group">
                        <span className="text-[20px] mb-1 group-hover:scale-110 transition-transform">Tel</span>
                        <span className="font-mono text-[12px] text-[var(--color-text)]">+91 7907242282</span>
                    </div>
                    <div className="pink-card-hover bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[16px] p-5 flex flex-col items-center justify-center gap-2 cursor-default group">
                        <span className="text-[20px] mb-1 group-hover:scale-110 transition-transform">Loc</span>
                        <span className="font-mono text-[11px] text-[var(--color-text)] leading-tight">Thiruvananthapuram,<br />Kerala</span>
                    </div>
                </div>

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
                            © 2025 Thejas Krishna P R
                        </span>
                        <SocialButtons />
                    </div>

                </div>
            </footer>

        </div>
    );
}
