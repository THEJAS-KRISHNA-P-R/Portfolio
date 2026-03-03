"use client";

import { useState, useEffect } from "react";
import { FadeIn } from "@/components/ui";
import dynamic from "next/dynamic";

const LightPillar = dynamic(() => import("@/components/ui/reactbits/LightPillar"), { ssr: false });
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSkills } from "@/components/sections/AboutSkills";
import { SpProjects } from "@/components/sections/SpProjects";
import { SpAchievements } from "@/components/sections/SpAchievements";
import { SpContact } from "@/components/sections/SpContact";
import { ArrowUp } from "lucide-react";
import { usePortfolioStore } from "@/store/usePortfolioStore";

export function StandardPortfolio() {
    const [isScrolled, setIsScrolled] = useState(false);
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

            {/* Navigation rendered by global <Navbar /> in ClientLayout.tsx */}

            {/* Main Formatted Layout Wrapper for Sections  */}
            <main className="pt-24 pb-20 w-full flex flex-col gap-0">

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
