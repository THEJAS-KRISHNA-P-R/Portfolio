"use client";

import { CommandMenu, PixelTrail } from "@/components/ui";
import { Navbar } from "@/components/Navbar";
import { AchievementToastContainer } from "@/components/game/AchievementToast";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <CommandMenu />
            <PixelTrail />
            {children}
            <AchievementToastContainer />
        </>
    );
}
