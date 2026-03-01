"use client";

import { CommandMenu, PixelTrail } from "@/components/ui";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <CommandMenu />
            <PixelTrail />
            {children}
        </>
    );
}
