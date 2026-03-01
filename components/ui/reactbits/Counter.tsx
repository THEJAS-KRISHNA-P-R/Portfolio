"use client";

import { useEffect, useState, useRef } from "react";

// SOURCE: https://reactbits.dev/components/counter
export default function Counter({
    endValue,
    duration = 2000,
    prefix = "",
    suffix = "",
    className = ""
}: {
    endValue: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        // Basic Intersection Observer to trigger on scroll/mount
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
                setHasAnimated(true);
                let start = 0;
                const totalFrames = Math.round(duration / 16.6); // roughly 60fps
                const increment = endValue / totalFrames;

                const updateCounter = () => {
                    start += increment;
                    if (start < endValue) {
                        setCount(Math.ceil(start * 10) / 10); // keep 1 decimal if needed
                        requestAnimationFrame(updateCounter);
                    } else {
                        setCount(endValue);
                    }
                };
                requestAnimationFrame(updateCounter);
            }
        });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [endValue, duration, hasAnimated]);

    return (
        <span ref={ref} className={`font-mono font-bold ${className}`}>
            {prefix}{count}{suffix}
        </span>
    );
}
