"use client";

import { useState, useEffect } from "react";
import { FadeIn } from "@/components/ui";
import dynamic from "next/dynamic";

const LightPillar = dynamic(() => import("@/components/ui/reactbits/LightPillar"), { ssr: false });
const HeroSection = dynamic(() => import("@/components/sections/HeroSection").then(m => ({ default: m.HeroSection })), { ssr: false });
const AboutSkills = dynamic(() => import("@/components/sections/AboutSkills").then(m => ({ default: m.AboutSkills })), { ssr: false });
const SpProjects = dynamic(() => import("@/components/sections/SpProjects").then(m => ({ default: m.SpProjects })), { ssr: false });
const SpAchievements = dynamic(() => import("@/components/sections/SpAchievements").then(m => ({ default: m.SpAchievements })), { ssr: false });
const SpContact = dynamic(() => import("@/components/sections/SpContact").then(m => ({ default: m.SpContact })), { ssr: false });
import { ArrowUp } from "lucide-react";
import { usePortfolioStore } from "@/store/usePortfolioStore";

export function StandardPortfolio() {
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollTarget = usePortfolioStore((s) => s.scrollTarget);
    const setScrollTarget = usePortfolioStore((s) => s.setScrollTarget);

    useEffect(() => {
        // Enable smooth scrolling on the html element
        document.documentElement.style.scrollBehavior = 'smooth';

        let rafPending = false;
        const handleScroll = () => {
            if (rafPending) return;
            rafPending = true;
            requestAnimationFrame(() => {
                setIsScrolled(window.scrollY > 400);
                rafPending = false;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        // Auto-scroll to zone section if coming from the 3D world
        if (scrollTarget) {
            setTimeout(() => {
                const el = document.getElementById(scrollTarget);
                if (el) {
                    const lenis = (window as any).__lenis;
                    if (lenis) {
                        lenis.scrollTo(el, { offset: -80, duration: 1.2 });
                    } else {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
                setScrollTarget(null);
            }, 400);
        }

        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
            window.removeEventListener("scroll", handleScroll);
        };
    }, [scrollTarget, setScrollTarget]);

    const scrollToTop = () => {
        const lenis = (window as any).__lenis;
        if (lenis) {
            lenis.scrollTo(0, { duration: 1.2 });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[var(--color-bg)] text-[var(--color-text)] font-body z-0 overflow-x-hidden">

            {/* LightPillar Background — two variants: phone/tablet vs laptop/desktop */}

            {/* Phone & Tablet (< md / < 768px): portrait-optimised, lighter */}
            <div className="fixed inset-0 z-[-1] pointer-events-none block md:hidden" style={{ width: '100vw', height: '100vh' }}>
                <LightPillar
                    topColor="#000000"
                    bottomColor="#249b22"
                    intensity={1}
                    rotationSpeed={0.2}
                    glowAmount={0.0018}
                    pillarWidth={4.5}
                    pillarHeight={0.6}
                    noiseIntensity={0}
                    pillarRotation={40}
                    interactive={false}
                    mixBlendMode="screen"
                    quality="high"
                />
            </div>

            {/* Laptop & Desktop (≥ md / ≥ 768px): wide landscape variant */}
            <div className="fixed inset-0 z-[-1] pointer-events-none hidden md:block" style={{ width: '100vw', height: '100vh' }}>
                <LightPillar
                    topColor="#28b31e"
                    bottomColor="#030503"
                    intensity={1}
                    rotationSpeed={0.1}
                    glowAmount={0.002}
                    pillarWidth={7}
                    pillarHeight={0.4}
                    noiseIntensity={0}
                    pillarRotation={235}
                    interactive={false}
                    mixBlendMode="screen"
                    quality="high"
                />
            </div>

            {/* Navigation rendered by global <Navbar /> in ClientLayout.tsx */}

            {/* Main Formatted Layout Wrapper for Sections  */}
            <main className="pt-20 pb-20 w-full flex flex-col gap-0">

                <FadeIn>
                    <HeroSection />
                </FadeIn>

                <FadeIn>
                    <section id="about" className="relative py-20 overflow-hidden">
                        <div className="max-w-6xl mx-auto px-5 lg:px-16">
                            <AboutSkills />
                        </div>
                    </section>
                </FadeIn>

                <FadeIn>
                    <section id="projects" className="relative py-20 overflow-hidden">
                        <div className="max-w-6xl mx-auto px-5 lg:px-16">
                            <SpProjects />
                        </div>
                    </section>
                </FadeIn>

                <FadeIn>
                    <section id="achievements" className="relative py-20 overflow-hidden">
                        <div className="max-w-6xl mx-auto px-5 lg:px-16">
                            <SpAchievements />
                        </div>
                    </section>
                </FadeIn>

                <FadeIn>
                    <section id="contact" className="relative py-20 overflow-hidden">
                        <div className="max-w-6xl mx-auto px-5 lg:px-16">
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
