"use client";

import { usePortfolioStore } from "@/store/usePortfolioStore";

export default function Projects() {
    const { projects } = usePortfolioStore();

    return (
        <div className="space-y-6">
            <p className="text-slate-300">
                Here are some of the key projects I have worked on, demonstrating full-stack expertise and a focus on user experience.
            </p>

            <div className="grid grid-cols-1 gap-6 mt-6">
                {projects.map((project) => (
                    <div key={project.id} className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors group">
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {project.title}
                        </h3>
                        <p className="text-slate-400 mt-2">
                            {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {project.tech.map((t, idx) => (
                                <span key={idx} className="px-3 py-1 bg-slate-900 text-cyan-300 text-xs rounded-full border border-slate-700">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
