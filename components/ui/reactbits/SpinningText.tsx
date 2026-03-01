"use client";

// SOURCE: https://reactbits.dev/text-animations/spinning-text
export default function SpinningText({ text, className = "", radius = 4 }: { text: string, className?: string, radius?: number }) {
    const characters = text.split("");
    const duration = 10; // seconds

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <div
                className="absolute inset-0 animate-spin-slow"
                style={{ animationDuration: `${duration}s` }}
            >
                {characters.map((char, i) => {
                    const rotate = (360 / characters.length) * i;
                    return (
                        <span
                            key={i}
                            className="absolute top-1/2 left-1/2 -mt-[0.5em] -ml-[0.5em] origin-center shadow-text"
                            style={{
                                transform: `rotate(${rotate}deg) translateY(-${radius}em) rotate(-${rotate}deg)` // Counter-rotate so letters stay upright
                            }}
                        >
                            {char}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
