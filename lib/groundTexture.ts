import * as THREE from "three"

let _tex: THREE.Texture | null = null

export function getGroundTexture(): THREE.Texture | null {
    if (typeof window === 'undefined') return null
    if (_tex) return _tex

    const SIZE = 512
    const c = document.createElement('canvas')
    c.width = c.height = SIZE
    const ctx = c.getContext('2d')!

    // ── Base: medium grey concrete ────────────────────────────────────
    ctx.fillStyle = '#5a5a5a'
    ctx.fillRect(0, 0, SIZE, SIZE)

    // ── Per-pixel grain noise ─────────────────────────────────────────
    const img = ctx.getImageData(0, 0, SIZE, SIZE)
    const data = img.data
    for (let i = 0; i < data.length; i += 4) {
        const n = (Math.random() - 0.5) * 38
        data[i] = Math.max(0, Math.min(255, data[i] + n))
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n))
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n))
        data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)

    // ── Aggregate patches: darker splotches for wear ──────────────────
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * SIZE
        const y = Math.random() * SIZE
        const r = 8 + Math.random() * 35
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, 'rgba(40,40,40,0.18)')
        g.addColorStop(1, 'rgba(40,40,40,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
    }

    // ── Crack lines ───────────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(30,30,30,0.35)'
    ctx.lineWidth = 1
    for (let i = 0; i < 18; i++) {
        ctx.beginPath()
        ctx.moveTo(Math.random() * SIZE, Math.random() * SIZE)
        for (let j = 0; j < 3; j++) {
            ctx.lineTo(
                Math.random() * SIZE,
                Math.random() * SIZE
            )
        }
        ctx.stroke()
    }

    // ── Fine aggregate texture: small dots ───────────────────────────
    for (let i = 0; i < 600; i++) {
        ctx.beginPath()
        ctx.arc(
            Math.random() * SIZE,
            Math.random() * SIZE,
            0.5 + Math.random() * 1.2,
            0, Math.PI * 2
        )
        ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 80 : 100},${Math.random() > 0.5 ? 80 : 100},${Math.random() > 0.5 ? 80 : 100},0.4)`
        ctx.fill()
    }

    // ── Subtle tile seam grid ─────────────────────────────────────────
    ctx.strokeStyle = 'rgba(35,35,35,0.2)'
    ctx.lineWidth = 1
    for (let x = 0; x <= SIZE; x += 128) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SIZE); ctx.stroke()
    }
    for (let y = 0; y <= SIZE; y += 128) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SIZE, y); ctx.stroke()
    }

    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(60, 60)
    tex.anisotropy = 8
    _tex = tex
    return tex
}
