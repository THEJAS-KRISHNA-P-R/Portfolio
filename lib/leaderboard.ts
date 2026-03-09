// lib/leaderboard.ts

export const LB_CONFIG = {
    // Google Sheets — public read via CSV export (no API key needed)
    SHEET_ID: '1y2-8xkIh5Jatbsxzza9N92Ftm9rMZjJWxWGAcsNb9yI',
    SHEET_GID: '1703808950',   // gid from the URL of Form Responses 1 tab

    // Google Form — POST endpoint
    FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSfb6caBts9NHWMQXAgHCBrBQ3bbORLmz0Bkh8Dsy4DgGQp0vg/formResponse',

    // Form field entry IDs
    FIELDS: {
        deviceId: 'entry.871121613',
        playerName: 'entry.451832204',
        score: 'entry.1885044264',
        time: 'entry.112453149',
        date: 'entry.758054458',
        game: 'entry.2128147985',
    },

    // Leaderboard display
    TOP_N: 5,
    POLL_INTERVAL: 60_000,   // refresh every 60 seconds

    // Score rules
    // football: higher is better (sort descending)
    // maze:     lower is better (sort ascending by time)
} as const

export type GameType = 'football' | 'maze'

export interface LeaderboardEntry {
    deviceId: string
    playerName: string
    score: number   // goals for football, seconds for maze
    time: number   // same as score for maze, 0 for football
    date: string
    game: GameType
}

// Format maze time as  1:23.4
export function formatMazeTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = (seconds % 60).toFixed(1).padStart(4, '0')
    return m > 0 ? `${m}:${s}` : `${Number(s).toFixed(1)}s`
}
