"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GlowButton, FadeIn } from "@/components/ui";
import dynamic from "next/dynamic";
import { CommitsGrid } from "@/components/ui/commits-grid";

const LightPillar = dynamic(() => import("@/components/ui/reactbits/LightPillar"), { ssr: false });
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSkills } from "@/components/sections/AboutSkills";
import { SpProjects } from "@/components/sections/SpProjects";
import { SpAchievements } from "@/components/sections/SpAchievements";
import { SpContact } from "@/components/sections/SpContact";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Menu, X, ArrowUp } from "lucide-react";
import { usePortfolioStore } from "@/store/usePortfolioStore";

export function StandardPortfolio() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const scrollTarget = usePortfolioStore((s) => s.scrollTarget);
    const setScrollTarget = usePortfolioStore((s) => s.setScrollTarget);

    useEffect(() => {
        // Enable smooth scrolling on the html element
        document.documentElement.style.scrollBehavior = 'smooth';

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScroll);

        // Auto-scroll to zone section if coming from the 3D world
        if (scrollTarget) {
            setTimeout(() => {
                const el = document.getElementById(scrollTarget);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                setScrollTarget(null);
            }, 400); // wait for page to mount
        }

        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
            window.removeEventListener("scroll", handleScroll);
        };
    }, [scrollTarget, setScrollTarget]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navLinks = [
        { label: "About", href: "#about" },
        { label: "Projects", href: "#projects" },
        { label: "Achievements", href: "#achievements" },
        { label: "Certifications", href: "#certifications" },
        { label: "Contact", href: "#contact" },
    ];

    return (
        <div className="relative min-h-screen w-full bg-[var(--color-bg)] text-[var(--color-text)] font-body z-0 overflow-x-hidden">

            {/* LightPillar Background — fixed, stays locked in place */}
            <div className="fixed inset-0 z-[-1] pointer-events-none" style={{ width: '100vw', height: '100vh' }}>
                <LightPillar
                    topColor="#114b22"
                    bottomColor="#249b22"
                    intensity={1}
                    rotationSpeed={0.1}
                    glowAmount={0.002}
                    pillarWidth={4.7}
                    pillarHeight={0.4}
                    noiseIntensity={0}
                    pillarRotation={302}
                    interactive={false}
                    mixBlendMode="screen"
                    quality="high"
                />
            </div>

            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300"
                style={{
                    background: 'rgba(5,10,10,0.8)',
                    borderColor: 'rgba(0,230,118,0.1)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">

                    {/* Logo (Left) */}
                    <div className="flex items-center">
                        <CommitsGrid text="THEJAS" className="w-[140px] gap-[1px]" />
                    </div>

                    {/* Desktop Links (Center) */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <button
                                key={link.label}
                                onClick={() => document.getElementById(link.href.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' })}
                                className="font-mono text-sm transition-all duration-200 relative group"
                                style={{ color: '#5a8a6a' }}
                            >
                                {link.label}
                                {/* Pink underline slide-in on hover */}
                                <span
                                    className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#ff4d7d] transition-all duration-300 group-hover:w-full"
                                />
                            </button>
                        ))}
                    </div>

                    {/* CTA & Mobile Toggle (Right) */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => usePortfolioStore.getState().setIsGameMode(true)}
                            className="hud-portfolio-btn"
                            style={{ pointerEvents: 'all' }}
                        >
                            <div className="btn-outer">
                                <div className="btn-inner">
                                    <span>3D World →</span>
                                </div>
                            </div>
                        </button>

                        <button
                            className="md:hidden text-[var(--color-text)] p-2 transition-colors hover:text-[var(--color-primary)]"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Slide-down Drawer */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 bg-[var(--color-surface)] border-b border-[var(--color-border)] ${mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="flex flex-col px-6 py-4 gap-2">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="pink-nav-link font-mono text-[15px] text-[var(--color-muted)] py-3 border-b border-[var(--color-border)]"
                            >
                                {link.label}
                            </a>
                        ))}

                    </div>
                </div>
            </nav>

            {/* Main Formatted Layout Wrapper for Sections  */}
            <main className="pt-16 pb-20 w-full flex flex-col gap-0">

                <FadeIn>
                    <HeroSection />
                </FadeIn>

                <FadeIn>
                    <section id="about" className="relative py-28 overflow-hidden">
                        <div className="max-w-6xl mx-auto px-8 lg:px-16">
                            <AboutSkills />
                        </div>
                    </section>
                </FadeIn>

                <FadeIn>
                    <section id="projects" className="relative py-28 overflow-hidden">
                        <div className="max-w-6xl mx-auto px-8 lg:px-16">
                            <SpProjects />
                        </div>
                    </section>
                </FadeIn>

                <FadeIn>
                    <section id="achievements" className="relative py-28 overflow-hidden">
                        <div className="max-w-6xl mx-auto px-8 lg:px-16">
                            <SpAchievements />
                        </div>
                    </section>
                </FadeIn>

                <FadeIn>
                    <section id="contact" className="relative py-28 overflow-hidden">
                        <div className="max-w-6xl mx-auto px-8 lg:px-16">
                            <SpContact />
                        </div>
                    </section>
                </FadeIn>

            </main>

            {/* Back to Top Floating Action Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-10 right-8 w-12 h-12 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-primary)] flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:border-[var(--color-primary)] z-50 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
                    }`}
                aria-label="Back to top"
            >
                <ArrowUp size={20} />
            </button>

        </div>
    );
}
