"use client";

import { usePortfolioStore } from "@/store/usePortfolioStore";
import { FadeIn } from "@/components/ui";
import {
    GlowingStarsBackgroundCard,
    GlowingStarsTitle,
    GlowingStarsDescription,
} from "@/components/ui/glowing-stars-card";
import { GitHubButton } from "@/components/ui/github-button"

export function SpProjects() {
    const { projects } = usePortfolioStore();

    return (
        <div className="w-full flex flex-col items-center">

            {/* Header Row */}
            <div className="w-full max-w-[1100px] flex items-end justify-between mb-12 flex-wrap gap-4">
                <div className="flex flex-col gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em]" style={{ color: '#00e676' }}>
                        PROJECTS
                    </span>
                    <h2 className="font-display text-[36px] tracking-tight leading-tight" style={{ color: '#e8f5e9' }}>
                        Things I&apos;ve built.
                    </h2>
                </div>
            </div>

            <div className="w-full max-w-[1100px] flex flex-col gap-8">

                {/* Empty state */}
                {projects.length === 0 && (
                    <div className="py-20 text-center font-mono text-[14px]" style={{ color: '#5a8a6a' }}>
                        No projects found.
                    </div>
                )}

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    {projects.map((project, idx) => (
                        <FadeIn key={project.id} delay={idx * 0.1}>
                            <GlowingStarsBackgroundCard
                                glowColor="#00e676"
                                className="h-full flex flex-col"
                            >
                                {/* Top Row */}
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-xs font-mono" style={{ color: '#5a8a6a' }}>
                                        {(idx + 1).toString().padStart(2, '0')}
                                    </span>
                                    {/* Special Badge */}
                                    {(project.title.toLowerCase().includes("repair mix") || project.title.toLowerCase().includes("digital repair caf")) && (
                                        <div
                                            className="px-3 py-1 rounded-full font-mono text-[11px] font-bold"
                                            style={{
                                                background: 'rgba(245,200,66,0.1)',
                                                border: '1px solid rgba(245,200,66,0.3)',
                                                color: '#f5c842',
                                            }}
                                        >
                                            First Prize
                                        </div>
                                    )}
                                </div>

                                {/* Title & Description */}
                                <GlowingStarsTitle>{project.title}</GlowingStarsTitle>
                                <GlowingStarsDescription>{project.description}</GlowingStarsDescription>

                                {/* Tech badges */}
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {project.tech.map((t: string, i: number) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 rounded-full text-xs font-mono border transition-colors duration-200 hover:border-[#ff4d7d] hover:text-[#ff4d7d]"
                                            style={{
                                                background: 'rgba(0,230,118,0.06)',
                                                border: '1px solid rgba(0,230,118,0.2)',
                                                color: '#5a8a6a',
                                            }}
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>

                                {/* Links */}
                                {/* Card footer */}
                                <div className="mt-6 pt-4 border-t border-[#1a3a2a] mt-auto">

                                    {/* Top row: Live link + GitHub 3D button */}
                                    <div className="flex items-center gap-4 flex-wrap">
                                        {project.liveUrl && (
                                            <a
                                                href={project.liveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-xs font-mono transition-colors duration-200 hover:text-[#ff4d7d]"
                                                style={{ color: '#00e676' }}
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                    <polyline points="15 3 21 3 21 9" />
                                                    <line x1="10" y1="14" x2="21" y2="3" />
                                                </svg>
                                                Live
                                            </a>
                                        )}

                                        {project.githubUrl && (
                                            <GitHubButton
                                                href={project.githubUrl}
                                                frontText="Repo"
                                                topText="GitHub →"
                                            />
                                        )}
                                    </div>

                                    {/* Bottom row: View details */}
                                    <div className="mt-4 text-right">
                                        <span
                                            className="text-xs font-mono cursor-pointer transition-colors duration-200 hover:text-[#b0d0b8]"
                                            style={{ color: '#3d6b50' }}
                                        >
                                            View details →
                                        </span>
                                    </div>

                                </div>
                            </GlowingStarsBackgroundCard>
                        </FadeIn>
                    ))}
                </div>

            </div>
        </div>
    );
}
