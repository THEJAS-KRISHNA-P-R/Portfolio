// lib/leaderboardService.ts
import { LB_CONFIG, GameType } from './leaderboard'
import { getDeviceId } from './deviceFingerprint'

const NAME_KEY = 'tkpn_name'   // localStorage key for stored player name

// ── NAME STORAGE ──────────────────────────────────────────────────────

export interface LeaderboardEntry {
    deviceId: string
    playerName: string
    score: number
    time: number
    date: string
    game: GameType
}

export function getStoredName(): string | null {
    try { return localStorage.getItem(NAME_KEY) } catch { return null }
}

export function setStoredName(name: string): void {
    try { localStorage.setItem(NAME_KEY, name.slice(0, 20)) } catch { }
}

export function hasStoredName(): boolean {
    const n = getStoredName()
    return n !== null && n.trim().length > 0
}

// ── FETCH ─────────────────────────────────────────────────────────────
// Read Sheet as CSV (public, no API key, no CORS issue)
const CSV_URL = `https://docs.google.com/spreadsheets/d/${LB_CONFIG.SHEET_ID}/export?format=csv&gid=${LB_CONFIG.SHEET_GID}`

export async function fetchLeaderboard(game: GameType): Promise<LeaderboardEntry[]> {
    try {
        const res = await fetch(CSV_URL, { cache: 'no-store' })
        if (!res.ok) return []
        const text = await res.text()
        const rows = text.trim().split('\n').slice(1)   // skip header row

        const entries: LeaderboardEntry[] = rows
            .map(row => {
                const cols = row.split(',').map(c => c.replace(/^"|"$/g, '').trim())
                return {
                    deviceId: cols[1] ?? '',
                    playerName: cols[2] ?? 'Anonymous',
                    score: parseFloat(cols[3]) || 0,
                    time: parseFloat(cols[4]) || 0,
                    date: cols[5] ?? '',
                    game: (cols[6] ?? 'football') as GameType,
                }
            })
            .filter(e => e.game === game && e.playerName)

        // Deduplicate — keep only best score per device per game
        const bestPerDevice = new Map<string, LeaderboardEntry>()
        entries.forEach(entry => {
            const existing = bestPerDevice.get(entry.deviceId)
            if (!existing) {
                bestPerDevice.set(entry.deviceId, entry)
            } else {
                const isBetter = game === 'football'
                    ? entry.score > existing.score   // higher pts wins
                    : entry.time < existing.time    // lower time wins
                if (isBetter) bestPerDevice.set(entry.deviceId, entry)
            }
        })

        const deduped = Array.from(bestPerDevice.values())

        // Sort and take top 5
        deduped.sort((a, b) =>
            game === 'football'
                ? b.score - a.score
                : a.time - b.time
        )
        return deduped.slice(0, LB_CONFIG.TOP_N)
    } catch {
        return []   // offline or error — return empty, never throw
    }
}

// ── RANK CHECK ────────────────────────────────────────────────────────
// Returns: 'record' | 'top5' | null, and the displaced player's name

export type RankResult =
    | { rank: 'record'; displacing: string | null }
    | { rank: 'top5'; displacing: string }
    | { rank: null }

export function checkRank(
    score: number,
    game: GameType,
    entries: LeaderboardEntry[]
): RankResult {
    const checkValue = game === 'football' ? score : score // Maze uses time as score too
    const beats = (a: number, b: number) =>
        game === 'football' ? a > b : a < b   // football: higher, maze: lower

    if (entries.length === 0) return { rank: 'record', displacing: null }

    const top1Value = game === 'football' ? entries[0].score : entries[0].time
    if (beats(checkValue, top1Value)) {
        return { rank: 'record', displacing: entries[0].playerName }
    }

    // Check if score makes top 5
    if (entries.length < LB_CONFIG.TOP_N) {
        return { rank: 'top5', displacing: '' }
    }

    const worstTop5Value = game === 'football'
        ? entries[entries.length - 1].score
        : entries[entries.length - 1].time

    if (beats(checkValue, worstTop5Value)) {
        return { rank: 'top5', displacing: entries[entries.length - 1].playerName }
    }

    return { rank: null }
}

// ── SUBMIT ────────────────────────────────────────────────────────────
// Fire-and-forget POST to Google Form
export function submitScore(
    playerName: string,
    score: number,
    time: number,
    game: GameType
): void {
    const deviceId = getDeviceId()
    const data = new FormData()
    const f = LB_CONFIG.FIELDS

    data.append(f.deviceId, deviceId)
    data.append(f.playerName, playerName.slice(0, 20))
    data.append(f.score, score.toString())
    data.append(f.time, time.toFixed(2))
    data.append(f.date, new Date().toISOString())
    data.append(f.game, game)

    fetch(LB_CONFIG.FORM_URL, { method: 'POST', body: data, mode: 'no-cors' })
        .catch(() => { })
}

// ── HANDLE GAME COMPLETE ──────────────────────────────────────────────
// Call this after every game:clear. Fetches leaderboard, checks rank,
// fires the appropriate event. Everything async — never blocks game loop.

export async function handleGameComplete(
    score: number,
    time: number,
    game: GameType
): Promise<void> {
    const entries = await fetchLeaderboard(game)
    const checkValue = game === 'football' ? score : time
    const result = checkRank(checkValue, game, entries)

    if (result.rank === null) return   // didn't make top 5 — do nothing

    if (hasStoredName()) {
        // Name already known — submit silently and fire notification
        submitScore(getStoredName()!, score, time, game)
        window.dispatchEvent(new CustomEvent('leaderboard:ranked', {
            detail: { rank: result.rank, displacing: (result as any).displacing, game, score, time }
        }))
    } else {
        // Need to ask for name first — fire prompt event with context
        window.dispatchEvent(new CustomEvent('leaderboard:needs-name', {
            detail: { rank: result.rank, displacing: (result as any).displacing, game, score, time }
        }))
    }
}
