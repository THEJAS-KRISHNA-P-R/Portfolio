"use client";

// SOURCE: https://reactbits.dev/backgrounds/aurora
export default function Aurora({ className = "" }: { className?: string }) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            <div className="absolute inset-0 bg-[#0a0a0f]"></div>
            {/* Simulate Aurora waves */}
            <div className="absolute -inset-[100%] opacity-30 mix-blend-screen"
                style={{
                    background: "radial-gradient(circle at 50% 50%, rgba(79, 195, 247, 0.4) 0%, transparent 40%)",
                    animation: "aurora-drift 20s linear infinite alternate"
                }}
            />
            <div className="absolute -inset-[100%] opacity-20 mix-blend-screen"
                style={{
                    background: "radial-gradient(circle at 30% 70%, rgba(155, 89, 182, 0.3) 0%, transparent 50%)",
                    animation: "aurora-drift 15s linear infinite alternate-reverse"
                }}
            />
        </div>
    );
}
