import type { Transform } from './store'
import type { FaceResult, FaceLandmark } from './landmarker'

// MediaPipe Face Mesh canonical indices used here.
const BROW_R = 105
const BROW_L = 334
const NOSE_BASE = 94
const CHIN = 152
const TEMPLE_R = 127
const TEMPLE_L = 356

type Rect = { x: number; y: number; w: number; h: number }
const mid = (a: FaceLandmark, b: FaceLandmark): FaceLandmark => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
  z: (a.z + b.z) / 2,
})

// Cranium width is wider than the temple-to-temple landmarks (which sit on
// the cheekbone). Scale up modestly so the Loomis ball spans the full skull.
const CRANIUM_FUDGE = 1.15

export function computeAutoFitTransform(
  face: FaceResult,
  imageRect: Rect,
  containerW: number,
  containerH: number,
): Partial<Transform> {
  const lms = face.landmarks
  const browMid = mid(lms[BROW_R], lms[BROW_L])
  const noseBase = lms[NOSE_BASE]
  const chin = lms[CHIN]
  const templeR = lms[TEMPLE_R]
  const templeL = lms[TEMPLE_L]

  // --- Position: brow midpoint in container-normalized coords ---
  const cxContainer = imageRect.x + browMid.x * imageRect.w
  const cyContainer = imageRect.y + browMid.y * imageRect.h
  const x = cxContainer / containerW
  const y = cyContainer / containerH

  // --- Scale: cranium half-width as a fraction of container height ---
  const headWidthPx = Math.hypot(
    (templeL.x - templeR.x) * imageRect.w,
    (templeL.y - templeR.y) * imageRect.h,
  )
  const ballRadiusPx = (headWidthPx / 2) * CRANIUM_FUDGE
  const scale = Math.max(0.05, Math.min(0.5, ballRadiusPx / containerH))

  // --- Rotation: extract Euler angles from MediaPipe's facial transformation matrix ---
  // Matrix is column-major 4x4; rotation lives in the upper-left 3x3.
  // Our rot() composes Ry(yaw) * Rx(pitch) * Rz(roll), so:
  //   pitch = asin(-r[1][2]); yaw = atan2(r[0][2], r[2][2]); roll = atan2(r[1][0], r[1][1])
  let yaw = 0, pitch = 0, roll = 0
  if (face.matrix) {
    const m = face.matrix
    const r10 = m[1]
    const r02 = m[8], r12 = m[9], r22 = m[10]
    const r11 = m[5]
    const sinPitch = Math.max(-1, Math.min(1, -r12))
    pitch = Math.asin(sinPitch)
    if (Math.abs(Math.cos(pitch)) > 1e-6) {
      yaw = Math.atan2(r02, r22)
      roll = Math.atan2(r10, r11)
    }
    // Clamp to slider ranges.
    yaw = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, yaw))
    pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch))
    roll = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, roll))
  }

  // --- Jaw length: ratio of brow→chin to brow→nose-base ---
  // In the model: nose-base sits at y=-1, chin at y=-(1+jawLength).
  // So chinDist / noseDist ≈ 1 + jawLength.
  const browToNosePx = Math.hypot(
    (browMid.x - noseBase.x) * imageRect.w,
    (browMid.y - noseBase.y) * imageRect.h,
  )
  const browToChinPx = Math.hypot(
    (browMid.x - chin.x) * imageRect.w,
    (browMid.y - chin.y) * imageRect.h,
  )
  const jawLength = browToNosePx > 0
    ? Math.max(0.4, Math.min(1.6, browToChinPx / browToNosePx - 1))
    : 1

  return { x, y, scale, yaw, pitch, roll, jawLength }
}
