"use client";

// SOURCE: https://reactbits.dev/components/marquee
export default function Marquee({
    children,
    className = "",
    speed = 30, // seconds for one full pass
    direction = "left",
}: {
    children: React.ReactNode;
    className?: string;
    speed?: number;
    direction?: "left" | "right";
}) {
    return (
        <div className={`relative flex overflow-hidden ${className}`}>
            <div
                className={`flex whitespace-nowrap min-w-full shrink-0 ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
                    }`}
                style={{ animationDuration: `${speed}s` }}
            >
                {children}
            </div>
            <div
                className={`flex whitespace-nowrap min-w-full shrink-0 ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
                    }`}
                style={{ animationDuration: `${speed}s`, position: "absolute", left: direction === "left" ? "100%" : "-100%" }}
                aria-hidden="true"
            >
                {children}
            </div>
        </div>
    );
}
