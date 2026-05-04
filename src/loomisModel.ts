// 3D Loomis head model.
// Convention: sphere of radius 1, centered at origin. y = up, z = toward viewer, x = right.
// Brow line at y=0; crown at y=+1; nose-base at y=-1; chin at y=-2.

export type Vec3 = [number, number, number]
export type Vec2 = { x: number; y: number; z: number }

export function rot(p: Vec3, yaw: number, pitch: number, roll: number): Vec3 {
  let [x, y, z] = p
  // Roll around z-axis
  let c = Math.cos(roll), s = Math.sin(roll)
  const xr = x * c - y * s, yr = x * s + y * c
  x = xr; y = yr
  // Pitch around x-axis
  c = Math.cos(pitch); s = Math.sin(pitch)
  const yp = y * c - z * s, zp = y * s + z * c
  y = yp; z = zp
  // Yaw around y-axis
  c = Math.cos(yaw); s = Math.sin(yaw)
  const xy = x * c + z * s, zy = -x * s + z * c
  x = xy; z = zy
  return [x, y, z]
}

export function project(
  p: Vec3,
  cx: number,
  cy: number,
  pixelsPerUnit: number,
): Vec2 {
  return {
    x: cx + p[0] * pixelsPerUnit,
    y: cy - p[1] * pixelsPerUnit, // flip y for screen coords
    z: p[2],
  }
}

// --- Primitive builders ---
function ringPoints(steps: number, fn: (t: number) => Vec3): Vec3[] {
  const out: Vec3[] = []
  for (let i = 0; i <= steps; i++) out.push(fn((i * 2 * Math.PI) / steps))
  return out
}

// Cranium sphere wireframe (latitude rings + meridians)
export function sphereWireframe(latRings = 5, lonRings = 8): Vec3[][] {
  const lines: Vec3[][] = []
  for (let i = 1; i < latRings; i++) {
    const y = -1 + (2 * i) / latRings
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    lines.push(ringPoints(48, (t) => [r * Math.cos(t), y, r * Math.sin(t)]))
  }
  for (let j = 0; j < lonRings; j++) {
    const theta = (j * Math.PI) / lonRings
    const meridian: Vec3[] = []
    for (let i = 0; i <= 48; i++) {
      const phi = -Math.PI / 2 + (i * Math.PI) / 48
      meridian.push([
        Math.cos(phi) * Math.cos(theta),
        Math.sin(phi),
        Math.cos(phi) * Math.sin(theta),
      ])
    }
    lines.push(meridian)
  }
  return lines
}

// Brow line: great circle at y=0 (in xz plane)
export const browLine: Vec3[] = ringPoints(64, (t) => [Math.cos(t), 0, Math.sin(t)])

// Centerline: great circle in yz plane (x=0)
export const centerlineCircle: Vec3[] = ringPoints(64, (t) => [0, Math.cos(t), Math.sin(t)])

// Hairline: small circle on sphere at y=+0.5
export const hairlineRing: Vec3[] = (() => {
  const y = 0.5
  const r = Math.sqrt(1 - y * y)
  return ringPoints(64, (t) => [r * Math.cos(t), y, r * Math.sin(t)])
})()

// Side planes: flat circles parallel to yz plane at x=±0.65, radius = sqrt(1-0.65²) ≈ 0.76
const SIDE_X = 0.65
const SIDE_R = Math.sqrt(1 - SIDE_X * SIDE_X)
export const sidePlaneR: Vec3[] = ringPoints(48, (t) => [-SIDE_X, SIDE_R * Math.cos(t), SIDE_R * Math.sin(t)])
export const sidePlaneL: Vec3[] = ringPoints(48, (t) => [SIDE_X, SIDE_R * Math.cos(t), SIDE_R * Math.sin(t)])

// Nose-base: line across the face at sphere bottom
export const noseBaseLine: Vec3[] = [[-0.55, -1, 0.45], [0.55, -1, 0.45]]

// Mouth: line halfway between nose-base and chin
export const mouthLine: Vec3[] = [[-0.4, -1.45, 0.55], [0.4, -1.45, 0.55]]

// Jaw outline: U-shape from where side planes meet sphere bottom, curving to chin.
// Parameterized so users can dial in jaw width, length, and taper to fit any face.
export function buildJawOutline(width = 1, length = 1, taper = 0.5): Vec3[] {
  const w = width
  const L = length
  const t = taper // 0 = wide chin (rectangular), 1 = pointed chin
  // Top corners attach to sphere bottom at the side-plane x positions.
  // Walk down: jaw angle (where it bends), then curve to chin point.
  const topX = SIDE_X * w
  const angleX = (SIDE_X - 0.05) * w * (1 - 0.1 * t)
  const midX = (SIDE_X - 0.2) * w * (1 - 0.45 * t)
  const chinSideX = (SIDE_X - 0.45) * w * (1 - 0.85 * t)
  const yTop = -1
  const yAngle = -1 - 0.4 * L
  const yMid = -1 - 0.75 * L
  const yChinSide = -1 - 0.95 * L
  const yChin = -1 - 1.0 * L
  return [
    [-topX, yTop, 0.4],
    [-angleX, yAngle, 0.5],
    [-midX, yMid, 0.55],
    [-chinSideX, yChinSide, 0.55],
    [0, yChin, 0.55],
    [chinSideX, yChinSide, 0.55],
    [midX, yMid, 0.55],
    [angleX, yAngle, 0.5],
    [topX, yTop, 0.4],
  ]
}

export const jawOutline = buildJawOutline()

// Ear: vertical bar on side plane between brow and nose-base
export const earR: Vec3[] = [[-SIDE_X, 0, -0.15], [-SIDE_X, -SIDE_R + 0.05, -0.15]]
export const earL: Vec3[] = [[SIDE_X, 0, -0.15], [SIDE_X, -SIDE_R + 0.05, -0.15]]
