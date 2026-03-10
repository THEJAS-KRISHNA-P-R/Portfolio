"use client";

import { useRef, useEffect, useState } from "react";

// SOURCE: https://reactbits.dev/animations/fade-in
export default function FadeIn({
    children,
    delay = 0,
    direction = "up",
    className = ""
}: {
    children: React.ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    const getInitialStyle = () => {
        switch (direction) {
            case "up": return "translate-y-8";
            case "down": return "-translate-y-8";
            case "left": return "translate-x-8";
            case "right": return "-translate-x-8";
            default: return "";
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${isVisible ? "translate-x-0 translate-y-0" : getInitialStyle()} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}
