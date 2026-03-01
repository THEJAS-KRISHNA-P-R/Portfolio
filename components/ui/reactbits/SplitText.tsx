"use client";

// SOURCE: https://reactbits.dev/text-animations/split-text
export default function SplitText({ text, className = "", delay = 50 }: { text: string, className?: string, delay?: number }) {
    // Simple implementation for split text animation
    return (
        <span className={`inline-block ${className}`}>
            {text.split("").map((char, index) => (
                <span
                    key={index}
                    className="inline-block animate-fade-in-up opacity-0"
                    style={{ animationDelay: `${index * delay}ms`, animationFillMode: "forwards" }}
                >
                    {char === " " ? "\u00A0" : char}
                </span>
            ))}
        </span>
    );
}
