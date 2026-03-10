"use client";

import { CommandMenu, PixelTrail } from "@/components/ui";
import { Navbar } from "@/components/Navbar";
import { AchievementToastContainer } from "@/components/game/AchievementToast";
import { SmoothScroll } from "@/components/SmoothScroll";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <SmoothScroll>
            <Navbar />
            <CommandMenu />
            <PixelTrail />
            {children}
            <AchievementToastContainer />
        </SmoothScroll>
    );
}
