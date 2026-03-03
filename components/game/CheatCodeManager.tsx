"use client"

import { useEffect, useRef } from "react"
import { fireNotif } from "./GameNotifications"

// ── Cheat sequences (case-insensitive, typed anywhere in the 3D world) ────────
const CHEAT_MAP: Record<string, { label: string; event: string; notif: Parameters<typeof fireNotif>[0] }> = {
    "TKBOOST": {
        label: "TURBO GOD MODE",
        event: "cheat:infinite-boost",
        notif: { type: 'record', title: 'CHEAT ACTIVATED', value: 'TURBO', subtext: 'Infinite boost enabled', color: '#ff5500', duration: 4000 },
    },
    "TKFLY": {
        label: "MOON GRAVITY",
        event: "cheat:moon-gravity",
        notif: { type: 'record', title: 'CHEAT ACTIVATED', value: 'MOON', subtext: 'Gravity reduced to 20%', color: '#4da6ff', duration: 4000 },
    },
    "TKGHOST": {
        label: "GHOST MODE",
        event: "cheat:ghost-mode",
        notif: { type: 'record', title: 'CHEAT ACTIVATED', value: 'GHOST', subtext: 'Maze walls ignored', color: '#aaaaff', duration: 4000 },
    },
    "TKSTRIKE": {
        label: "AUTO STRIKE",
        event: "cheat:auto-strike",
        notif: { type: 'strike', title: 'CHEAT ACTIVATED', value: 'STRIKE', subtext: 'All pins knocked down!', color: '#ffcc00', duration: 4000 },
    },
    "TKSPEED": {
        label: "MAX SPEED MODE",
        event: "cheat:max-speed",
        notif: { type: 'record', title: 'CHEAT ACTIVATED', value: 'LUDICROUS', subtext: 'Top speed tripled (30s)', color: '#ff5500', duration: 4000 },
    },
}

const MAX_BUFFER = 12

export function CheatCodeManager() {
    const buffer = useRef("")

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // Ignore when typing in an input/textarea
            const tag = (e.target as HTMLElement)?.tagName
            if (tag === 'INPUT' || tag === 'TEXTAREA') return

            buffer.current = (buffer.current + e.key.toUpperCase()).slice(-MAX_BUFFER)

            for (const [code, cheat] of Object.entries(CHEAT_MAP)) {
                if (buffer.current.endsWith(code)) {
                    window.dispatchEvent(new CustomEvent(cheat.event))
                    fireNotif(cheat.notif)
                    buffer.current = ""
                    break
                }
            }
        }

        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    return null
}
