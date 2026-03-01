import React from "react";
import { GlowingCard } from "./GlowingCard";

export interface TimelineData {
    title: string;
    description: string;
    content?: React.ReactNode;
    icon?: React.ReactNode;
    date?: string;
}

export function VerticalTimeline({
    data,
}: {
    data: TimelineData[];
}) {
    return (
        <div className="mx-auto max-w-4xl py-6 relative">
            <div className="absolute top-0 bottom-0 left-6 w-px bg-[#1a2e26] md:left-1/2 md:-ml-px"></div>

            <div className="space-y-12">
                {data.map((item, index) => (
                    <div key={index} className="relative flex items-center md:justify-between flex-col md:flex-row w-full group">
                        {/* Right side for even, left for odd (Desktop) */}
                        <div className={`w-full md:w-[45%] pl-16 md:pl-0 ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:order-last md:text-left md:pl-12"}`}>
                            <div
                                className="w-full text-left p-6 rounded-xl bg-[rgba(10,26,20,0.8)] transition-all duration-300 hover:-translate-y-1"
                                style={{
                                    boxShadow: '0 0 0 1px rgba(148,163,184,0.2), 0 8px 24px -8px rgba(148,163,184,0.3)'
                                }}
                            >
                                <div className="flex flex-col gap-2">
                                    <span
                                        className="text-sm font-mono"
                                        style={{ color: '#94a3b8' }}
                                    >
                                        {item.date}
                                    </span>
                                    <h3 className="text-xl font-bold" style={{ color: '#e8f5e9' }}>{item.title}</h3>
                                    <div className="text-sm" style={{ color: '#7aaa8a' }}>{item.description}</div>
                                    {item.content && <div className="mt-4">{item.content}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Center Icon */}
                        <div
                            className="absolute left-6 md:left-1/2 -ml-[18px] w-9 h-9 rounded-full flex items-center justify-center text-xl z-10"
                            style={{
                                background: '#0a1a14',
                                boxShadow: '0 0 0 3px rgba(148,163,184,0.25), 0 0 12px 0px rgba(148,163,184,0.3)',
                                border: '1px solid rgba(148,163,184,0.4)',
                                color: '#94a3b8'
                            }}
                        >
                            {item.icon || "•"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
