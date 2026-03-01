"use client";

import { useRef, useEffect } from "react";

// SOURCE: https://reactbits.dev/text-animations/blur-text
export default function BlurText({ text, className = "" }: { text: string, className?: string }) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.filter = "blur(10px)";
            ref.current.style.opacity = "0";

            const timer = setTimeout(() => {
                if (ref.current) {
                    ref.current.style.transition = "filter 0.5s ease-out, opacity 0.5s ease-out";
                    ref.current.style.filter = "blur(0px)";
                    ref.current.style.opacity = "1";
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [text]);

    return (
        <span ref={ref} className={`inline-block ${className}`}>
            {text}
        </span>
    );
}
