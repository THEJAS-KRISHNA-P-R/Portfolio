"use client";

import { SplitText, BlurText, Counter } from "@/components/ui";
import { ShinyButton } from "@/components/ui/shiny-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { SocialButtons } from "@/components/ui/social-buttons";

export function HeroSection() {
    const marqueeItems = [
        'PYTHON', 'NEXT.JS', 'REACT', 'FLUTTER', 'REACT NATIVE',
        'MONGODB', 'FIREBASE', 'SUPABASE', 'TYPESCRIPT', 'TAILWIND',
        'PYTHON', 'NEXT.JS', 'REACT', 'FLUTTER', 'REACT NATIVE',
        'MONGODB', 'FIREBASE', 'SUPABASE', 'TYPESCRIPT', 'TAILWIND',
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

                        {/* 2. NAME — the hero focal point */}
                        <div>
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
                        </div>

                        {/* 3. Role */}
                        <p className="font-mono text-base" style={{ color: '#7aaa8a' }}>
                            Full-Stack Developer & CS Student
                        </p>

                        {/* 4. Bio */}
                        <p
                            className="text-base leading-relaxed max-w-md"
                            style={{ color: '#6a9a7a' }}
                        >
                            Building things for the web. CS Engineering @ Christ College, KTU.
                            Karate athlete. Currently exploring AI and Cybersecurity.
                        </p>

                        {/* 5. Stats row */}
                        <div className="flex gap-10 mt-2 mb-2">
                            {[
                                { value: '98.7%', label: 'CLASS X' },
                                { value: '95.3%', label: 'CLASS XII' },
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
                                        style={{ color: '#3d6b50' }}
                                    >
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* 6. CTA buttons */}
                        <div className="flex items-center gap-4 flex-wrap mt-2">
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
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="flex items-center justify-center lg:justify-end pb-12 lg:pb-0">
                        <div
                            className="relative rounded-3xl flex flex-col items-center justify-center"
                            style={{
                                width: '300px',
                                height: '300px',
                                background: 'linear-gradient(135deg, #0d2018 0%, #0a1a14 60%, #050a0a 100%)',
                                border: '1px solid rgba(0,230,118,0.2)',
                                boxShadow: '0 0 80px -20px rgba(0,230,118,0.3), inset 0 0 40px -20px rgba(0,230,118,0.1)',
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
                                    color: '#5a8a6a',
                                }}
                            >
                                Christ College of Engineering
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tech Stack Marquee - Full Width */}
            <div
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
                            style={{ color: '#2d5a3a' }}
                        >
                            {tech}
                            <span style={{ color: '#1a3a2a' }}>•</span>
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
