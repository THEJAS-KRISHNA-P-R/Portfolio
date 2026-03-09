// lib/deviceFingerprint.ts

const LS_KEY = 'tkpf_id'   // localStorage key

// Simple djb2 hash — no external dependency
function djb2(str: string): string {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
        hash = hash >>> 0   // keep unsigned 32-bit
    }
    return hash.toString(16).padStart(8, '0')
}

// WebGL renderer string — unique per GPU model
function getWebGLSignal(): string {
    try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
        if (!gl) return 'no-webgl'
        const dbg = gl.getExtension('WEBGL_debug_renderer_info')
        if (!dbg) return 'no-dbg'
        const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string
        const vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) as string
        return `${vendor}|${renderer}`
    } catch { return 'webgl-err' }
}

// Canvas draw fingerprint — how the GPU renders specific operations
function getCanvasSignal(): string {
    try {
        const canvas = document.createElement('canvas')
        canvas.width = 200
        canvas.height = 50
        const ctx = canvas.getContext('2d')!
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillStyle = '#f60'
        ctx.fillRect(125, 1, 62, 20)
        ctx.fillStyle = '#069'
        ctx.fillText('Cwm fjordbank', 2, 15)
        ctx.fillStyle = 'rgba(102,204,0,0.7)'
        ctx.fillText('glyphs vex', 4, 17)
        return canvas.toDataURL().slice(-40)   // last 40 chars are unique enough
    } catch { return 'canvas-err' }
}

// Stable environment signals
function getEnvSignal(): string {
    return [
        screen.width,
        screen.height,
        screen.colorDepth,
        navigator.language,
        navigator.hardwareConcurrency ?? 0,
        (navigator as any).deviceMemory ?? 0,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.platform ?? '',
    ].join('|')
}

// Build and cache the fingerprint
export function getDeviceId(): string {
    // Return cached value from localStorage if available
    if (typeof window === 'undefined') return 'ssr'
    const cached = localStorage.getItem(LS_KEY)
    if (cached) return cached

    const raw = [
        getWebGLSignal(),
        getCanvasSignal(),
        getEnvSignal(),
    ].join('::')

    // Two-round hash for better distribution
    const id = djb2(djb2(raw) + raw.length.toString())
    localStorage.setItem(LS_KEY, id)
    return id
}
