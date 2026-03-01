export default function Achievements() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-900/20 p-6 rounded-xl border border-amber-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-amber-500">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-amber-400 mb-2">First Prize, Project Expo</h3>
                    <p className="text-slate-300">
                        Christ College of Engineering, Oct 2025. Awarded for developing the Digital Repair Café platform, promoting sustainability and electronics repair.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-900/20 p-6 rounded-xl border border-blue-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-500">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-blue-400 mb-2">Hackathon Finalist</h3>
                    <p className="text-slate-300">
                        Recognized for building innovative full-stack solutions under 24 hours focusing on modern technologies and user impact.
                    </p>
                </div>
            </div>
        </div>
    );
}
