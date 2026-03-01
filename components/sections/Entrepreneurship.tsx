export default function Entrepreneurship() {
    return (
        <div className="space-y-6">
            <div className="max-w-2xl">
                <p className="text-lg text-slate-300 leading-relaxed">
                    Beyond coding, I have a strong passion for entrepreneurship and building products from the ground up that solve real-world problems.
                </p>
            </div>

            <div className="mt-8 bg-slate-800/50 p-6 rounded-xl border border-emerald-500/30">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-lg shrink-0">
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-emerald-400">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Startup Ventures</h3>
                        <p className="text-slate-400">
                            Experienced in validating product ideas, designing system architectures, and executing technical roadmaps from MVP to production-grade applications.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
