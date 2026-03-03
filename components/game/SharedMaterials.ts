/**
 * Shared THREE.js materials — created ONCE at module load, reused everywhere.
 * Never recreate materials inside component bodies or useMemo — that wastes
 * GPU memory and triggers shader recompilation.
 *
 * Usage:  <mesh material={MAT.ground} />
 */
import * as THREE from "three"

export const MAT = {
  ground:    new THREE.MeshStandardMaterial({ color: '#0a1a12', roughness: 0.95, metalness: 0.0 }),
  treeTrunk: new THREE.MeshStandardMaterial({ color: '#1a3d20', roughness: 1 }),
  treeLeaf:  new THREE.MeshStandardMaterial({ color: '#0d4a1f', roughness: 1 }),
  rock:      new THREE.MeshStandardMaterial({ color: '#1a2a20', roughness: 0.9, metalness: 0.1 }),
  road:      new THREE.MeshStandardMaterial({ color: '#0d2218', roughness: 1.0 }),
  hedge:     new THREE.MeshStandardMaterial({ color: '#0a2a12', roughness: 1.0 }),
  ramp:      new THREE.MeshStandardMaterial({ color: '#0d2a18', roughness: 0.9 }),
  wallBlue:  new THREE.MeshStandardMaterial({ color: '#001133', emissive: new THREE.Color('#00bfff'), emissiveIntensity: 0.35, roughness: 0.2, metalness: 0.8 }),
  lane:      new THREE.MeshStandardMaterial({ color: '#c8a96e', roughness: 0.2 }),
  pinWhite:  new THREE.MeshStandardMaterial({ color: '#f5f5f5', roughness: 0.25 }),
  pinRed:    new THREE.MeshStandardMaterial({ color: '#cc2200', roughness: 0.3 }),
  lamp:      new THREE.MeshStandardMaterial({ color: '#223322', roughness: 0.8, metalness: 0.4 }),
}
