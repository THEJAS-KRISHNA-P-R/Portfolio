"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

export const CommitsGrid = ({ text, className }: { text: string, className?: string }) => {
    const cleanString = (str: string): string => {
        const upperStr = str.toUpperCase();

        const withoutAccents = upperStr
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const allowedChars = Object.keys(letterPatterns);
        return withoutAccents
            .split("")
            .filter((char) => allowedChars.includes(char))
            .join("");
    };

    const generateHighlightedCells = (text: string) => {
        const cleanedText = cleanString(text);

        const width = Math.max(cleanedText.length * 6, 6) + 1;

        let currentPosition = 1; // we start at 1 to leave space for the top border
        const highlightedCells: number[] = [];

        cleanedText
            .toUpperCase()
            .split("")
            .forEach((char) => {
                if (letterPatterns[char]) {
                    const pattern = letterPatterns[char].map((pos) => {
                        const row = Math.floor(pos / 50);
                        const col = pos % 50;
                        return (row + 1) * width + col + currentPosition;
                    });
                    highlightedCells.push(...pattern);
                }
                currentPosition += 6;
            });

        return {
            cells: highlightedCells,
            width,
            height: 9, // 7+2 for the top and bottom borders
        };
    };

    const {
        cells: highlightedCells,
        width: gridWidth,
        height: gridHeight,
    } = generateHighlightedCells(text);

    const getRandomColor = () => {
        const commitColors = [
            "#00e676",
            "#21c86e",
            "#41ab66"
        ];
        // Text is very bright
        const randomIndex = Math.floor(Math.random() * commitColors.length);
        return commitColors[randomIndex];
    };

    const getGlowColor = () => {
        const glowColors = [
            "rgba(0, 230, 118, 0.12)",
            "rgba(0, 230, 118, 0.08)",
            "rgba(0, 230, 118, 0.04)"
        ];
        const randomIndex = Math.floor(Math.random() * glowColors.length);
        return glowColors[randomIndex];
    }

    const [isJittering, setIsJittering] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setIsJittering(false), 3000);
        return () => clearTimeout(t);
    }, []);

    // Stable random maps for the jitter phase
    const flashMap = React.useMemo(() => {
        const flashes = new Set<number>();
        for (let i = 0; i < gridWidth * gridHeight; i++) {
            if (Math.random() < 0.4) flashes.add(i);
        }
        return flashes;
    }, [gridWidth, gridHeight]);

    const delayMap = React.useMemo(() => {
        return Array.from({ length: gridWidth * gridHeight }).map(() => `${(Math.random() * 2).toFixed(2)}s`);
    }, [gridWidth, gridHeight]);

    // Generate outer glow dots
    // We'll define a simple rule: any dot adjacent to a highlighted dot (but not highlighted itself) is a glow dot
    const glowCells: number[] = [];
    highlightedCells.forEach(cell => {
        // N, S, E, W + diagonals (1 block radius only)
        const neighbors = [
            cell - gridWidth - 1, cell - gridWidth, cell - gridWidth + 1,
            cell - 1, /* self */ cell + 1,
            cell + gridWidth - 1, cell + gridWidth, cell + gridWidth + 1,
        ];
        neighbors.forEach(n => {
            if (n >= 0 && n < gridWidth * gridHeight && !highlightedCells.includes(n)) {
                if (!glowCells.includes(n)) glowCells.push(n);
            }
        });
    });

    const getRandomDelay = (index: number) => delayMap[index];
    const getRandomFlash = (index: number) => flashMap.has(index);

    return (
        <section
            className={cn("w-full max-w-xl bg-transparent grid p-1.5 sm:p-3 gap-[1px] rounded-[10px] sm:rounded-[15px]", className)}
            style={{
                gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridHeight}, minmax(0, 1fr))`,
            }}
        >
            {Array.from({ length: gridWidth * gridHeight }).map((_, index) => {
                const isHighlighted = highlightedCells.includes(index);
                const isGlow = glowCells.includes(index);

                // During jitter, standard dots flash randomly. We ignore "isHighlighted" for the text so it ALSO just joins the random flashing matrix
                const shouldFlash = isJittering && getRandomFlash(index);

                // If jitter is finished, only text and glow survive
                const finalState = !isJittering;
                const isVisibleText = finalState && isHighlighted;
                const isVisibleGlow = finalState && isGlow;

                return (
                    <div
                        key={index}
                        className={cn(
                            `h-full w-full aspect-square rounded-[1px] sm:rounded-[2px] transition-all duration-1000 ease-in-out`,
                            // Maintain border during jitter, strip it when settling except on text
                            isJittering ? "border border-green-500/15" : "border border-transparent",
                            isVisibleText ? "bg-[var(--highlight)] scale-100 shadow-[0_0_8px_rgba(0,230,118,0.4)]" : "",
                            shouldFlash ? "animate-flash border-green-500/30" : "",
                            !isVisibleText && !shouldFlash && !isVisibleGlow ? "bg-transparent" : ""
                        )}
                        style={
                            {
                                animationDelay: getRandomDelay(index),
                                "--highlight": isVisibleText || shouldFlash ? getRandomColor() : "transparent",
                                backgroundColor: isVisibleGlow ? getGlowColor() : undefined,
                            } as CSSProperties
                        }
                    />
                );
            })}
        </section>
    );
};

const letterPatterns: { [key: string]: number[] } = {
    A: [
        1, 2, 3, 50, 100, 150, 200, 250, 300, 54, 104, 154, 204, 254, 304, 151, 152,
        153,
    ],
    B: [
        0, 1, 2, 3, 4, 50, 100, 150, 151, 200, 250, 300, 301, 302, 303, 304, 54,
        104, 152, 153, 204, 254, 303,
    ],
    C: [0, 1, 2, 3, 4, 50, 100, 150, 200, 250, 300, 301, 302, 303, 304],
    D: [
        0, 1, 2, 3, 50, 100, 150, 200, 250, 300, 301, 302, 54, 104, 154, 204, 254,
        303,
    ],
    E: [0, 1, 2, 3, 4, 50, 100, 150, 200, 250, 300, 301, 302, 303, 304, 151, 152],
    F: [0, 1, 2, 3, 4, 50, 100, 150, 200, 250, 300, 151, 152, 153],
    G: [
        0, 1, 2, 3, 4, 50, 100, 150, 200, 250, 300, 301, 302, 303, 153, 204, 154,
        304, 254,
    ],
    H: [
        0, 50, 100, 150, 200, 250, 300, 151, 152, 153, 4, 54, 104, 154, 204, 254,
        304,
    ],
    I: [0, 1, 2, 3, 4, 52, 102, 152, 202, 252, 300, 301, 302, 303, 304],
    J: [0, 1, 2, 3, 4, 52, 102, 152, 202, 250, 252, 302, 300, 301],
    K: [0, 4, 50, 100, 150, 200, 250, 300, 151, 152, 103, 54, 203, 254, 304],
    L: [0, 50, 100, 150, 200, 250, 300, 301, 302, 303, 304],
    M: [
        0, 50, 100, 150, 200, 250, 300, 51, 102, 53, 4, 54, 104, 154, 204, 254, 304,
    ],
    N: [
        0, 50, 100, 150, 200, 250, 300, 51, 102, 153, 204, 4, 54, 104, 154, 204,
        254, 304,
    ],
    Ñ: [
        0, 50, 100, 150, 200, 250, 300, 51, 102, 153, 204, 4, 54, 104, 154, 204,
        254, 304,
    ],
    O: [1, 2, 3, 50, 100, 150, 200, 250, 301, 302, 303, 54, 104, 154, 204, 254],
    P: [0, 50, 100, 150, 200, 250, 300, 1, 2, 3, 54, 104, 151, 152, 153],
    Q: [
        1, 2, 3, 50, 100, 150, 200, 250, 301, 302, 54, 104, 154, 204, 202, 253, 304,
    ],
    R: [
        0, 50, 100, 150, 200, 250, 300, 1, 2, 3, 54, 104, 151, 152, 153, 204, 254,
        304,
    ],
    S: [1, 2, 3, 4, 50, 100, 151, 152, 153, 204, 254, 300, 301, 302, 303],
    T: [0, 1, 2, 3, 4, 52, 102, 152, 202, 252, 302],
    U: [0, 50, 100, 150, 200, 250, 301, 302, 303, 4, 54, 104, 154, 204, 254],
    V: [0, 50, 100, 150, 200, 251, 302, 4, 54, 104, 154, 204, 253],
    W: [
        0, 50, 100, 150, 200, 250, 301, 152, 202, 252, 4, 54, 104, 154, 204, 254,
        303,
    ],
    X: [0, 50, 203, 254, 304, 4, 54, 152, 101, 103, 201, 250, 300],
    Y: [0, 50, 101, 152, 202, 252, 302, 4, 54, 103],
    Z: [0, 1, 2, 3, 4, 54, 103, 152, 201, 250, 300, 301, 302, 303, 304],
    "0": [1, 2, 3, 50, 100, 150, 200, 250, 301, 302, 303, 54, 104, 154, 204, 254],
    "1": [1, 52, 102, 152, 202, 252, 302, 0, 2, 300, 301, 302, 303, 304],
    "2": [0, 1, 2, 3, 54, 104, 152, 153, 201, 250, 300, 301, 302, 303, 304],
    "3": [0, 1, 2, 3, 54, 104, 152, 153, 204, 254, 300, 301, 302, 303],
    "4": [0, 50, 100, 150, 4, 54, 104, 151, 152, 153, 154, 204, 254, 304],
    "5": [0, 1, 2, 3, 4, 50, 100, 151, 152, 153, 204, 254, 300, 301, 302, 303],
    "6": [
        1, 2, 3, 50, 100, 150, 151, 152, 153, 200, 250, 301, 302, 204, 254, 303,
    ],
    "7": [0, 1, 2, 3, 4, 54, 103, 152, 201, 250, 300],
    "8": [
        1, 2, 3, 50, 100, 151, 152, 153, 200, 250, 301, 302, 303, 54, 104, 204, 254,
    ],
    "9": [1, 2, 3, 50, 100, 151, 152, 153, 154, 204, 254, 304, 54, 104],
    " ": [],
};
