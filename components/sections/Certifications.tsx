export default function Certifications() {
    return (
        <div className="space-y-6">
            <p className="text-slate-300 mb-6">
                Here are my professional certifications and continuous learning milestones.
            </p>

            <div className="space-y-4">
                {[
                    {
                        title: "Advanced React Patterns",
                        issuer: "Frontend Masters",
                        year: "2024"
                    },
                    {
                        title: "Modern Next.js Development",
                        issuer: "Vercel Academy",
                        year: "2024"
                    },
                    {
                        title: "Three.js Journey",
                        issuer: "Bruno Simon",
                        year: "2025"
                    }
                ].map((cert, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                        <div>
                            <h4 className="font-bold text-white">{cert.title}</h4>
                            <p className="text-sm text-slate-400">{cert.issuer}</p>
                        </div>
                        <div className="text-cyan-400 font-mono text-sm bg-cyan-400/10 px-3 py-1 rounded-full">
                            {cert.year}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
