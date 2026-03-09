import * as THREE from 'three'

// One shared matcap texture — 128×128 PNG, ~8KB
// Download from: https://github.com/nidorx/matcaps
// Using a dark greenish/metallic one for the world theme.

let _matcap: THREE.Texture | null = null
export function getMatcap(): THREE.Texture {
    if (typeof window === 'undefined') return null as any
    if (_matcap) return _matcap
    _matcap = new THREE.TextureLoader().load('/matcap_dark.png')
    _matcap.colorSpace = THREE.SRGBColorSpace
    return _matcap
}
