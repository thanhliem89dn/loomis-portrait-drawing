import { useStore } from './store'
import {
  rot,
  project,
  sphereWireframe,
  browLine,
  centerlineCircle,
  hairlineRing,
  sidePlaneL,
  sidePlaneR,
  buildNoseBaseLine,
  buildChinLine,
  buildJawOutline,
  earL,
  earR,
  type Vec3,
  type Vec2,
} from './loomisModel'

const COLORS = {
  ball: '#34d399',
  sidePlane: '#fbbf24',
  centerline: '#f472b6',
  brow: '#60a5fa',
  hairline: '#a3e635',
  nose: '#60a5fa',
  mouth: '#60a5fa',
  jaw: '#f87171',
  ear: '#a78bfa',
  wireframe: '#10b981',
}

type Props = { width: number; height: number }

function projectLine(
  pts: Vec3[],
  yaw: number,
  pitch: number,
  roll: number,
  cx: number,
  cy: number,
  ppu: number,
): Vec2[] {
  return pts.map((p) => project(rot(p, yaw, pitch, roll), cx, cy, ppu))
}

// Split a polyline into front-facing (z>=0) and back-facing (z<0) segments.
function splitByDepth(pts: Vec2[]): { front: Vec2[][]; back: Vec2[][] } {
  const front: Vec2[][] = []
  const back: Vec2[][] = []
  let curFront: Vec2[] = []
  let curBack: Vec2[] = []
  for (const p of pts) {
    if (p.z >= 0) {
      if (curBack.length) { back.push(curBack); curBack = [] }
      curFront.push(p)
    } else {
      if (curFront.length) { front.push(curFront); curFront = [] }
      curBack.push(p)
    }
  }
  if (curFront.length) front.push(curFront)
  if (curBack.length) back.push(curBack)
  return { front, back }
}

function pathOf(pts: Vec2[]): string {
  if (pts.length === 0) return ''
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)}`
  return d
}

function DepthLine({
  pts,
  color,
  width,
  showBack = true,
  noSplit = false,
}: {
  pts: Vec2[]
  color: string
  width: number
  showBack?: boolean
  noSplit?: boolean
}) {
  if (noSplit) {
    return (
      <path d={pathOf(pts)} fill="none" stroke={color} strokeWidth={width} opacity={0.95} strokeLinejoin="round" strokeLinecap="round" />
    )
  }
  const { front, back } = splitByDepth(pts)
  return (
    <>
      {showBack && back.map((seg, i) => (
        <path
          key={`b${i}`}
          d={pathOf(seg)}
          fill="none"
          stroke={color}
          strokeWidth={width}
          opacity={0.3}
          strokeDasharray={`${width * 2.5} ${width * 2}`}
        />
      ))}
      {front.map((seg, i) => (
        <path key={`f${i}`} d={pathOf(seg)} fill="none" stroke={color} strokeWidth={width} opacity={0.95} strokeLinejoin="round" strokeLinecap="round" />
      ))}
    </>
  )
}

export function Overlay({ width, height }: Props) {
  const transform = useStore((s) => s.transform)
  const toggles = useStore((s) => s.toggles)
  if (width === 0 || height === 0) return null

  const cx = transform.x * width
  const cy = transform.y * height
  const ppu = transform.scale * height // pixels per model unit (sphere radius)
  const sw = Math.max(1.4, height * 0.0035)

  const proj = (pts: Vec3[]) => projectLine(pts, transform.yaw, transform.pitch, transform.roll, cx, cy, ppu)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 w-full h-full pointer-events-none">
      {/* Wireframe sphere */}
      {toggles.wireframe &&
        sphereWireframe(6, 8).map((line, i) => (
          <DepthLine key={`wf${i}`} pts={proj(line)} color={COLORS.wireframe} width={sw * 0.5} />
        ))}

      {/* Cranium ball silhouette: a 2D circle (sphere always projects to circle in ortho) */}
      {toggles.ball && (
        <circle
          cx={cx}
          cy={cy}
          r={ppu}
          fill="none"
          stroke={COLORS.ball}
          strokeWidth={sw * 1.4}
          opacity={0.95}
        />
      )}

      {/* Side planes */}
      {toggles.sidePlane && (
        <>
          <DepthLine pts={proj(sidePlaneL)} color={COLORS.sidePlane} width={sw} />
          <DepthLine pts={proj(sidePlaneR)} color={COLORS.sidePlane} width={sw} />
        </>
      )}

      {/* Centerline */}
      {toggles.centerline && (
        <DepthLine pts={proj(centerlineCircle)} color={COLORS.centerline} width={sw} />
      )}

      {/* Hairline ring */}
      {toggles.hairline && (
        <DepthLine pts={proj(hairlineRing)} color={COLORS.hairline} width={sw} />
      )}

      {/* Brow line on top of ball outline (same path with extra emphasis) */}
      {toggles.browLine && (
        <DepthLine pts={proj(browLine)} color={COLORS.brow} width={sw} />
      )}

      {/* Nose-base (locked to midpoint of brow → chin) */}
      {toggles.noseLine && (
        <DepthLine
          pts={proj(buildNoseBaseLine(transform.jawLength, transform.jawWidth))}
          color={COLORS.nose}
          width={sw}
          showBack={false}
        />
      )}

      {/* Chin line */}
      {toggles.chinLine && (
        <DepthLine
          pts={proj(buildChinLine(transform.jawLength, transform.jawWidth, transform.jawTaper))}
          color={COLORS.mouth}
          width={sw}
          showBack={false}
        />
      )}

      {/* Jaw — always rendered as one continuous front-facing curve */}
      {toggles.jaw && (
        <DepthLine
          pts={proj(buildJawOutline(transform.jawWidth, transform.jawLength, transform.jawTaper))}
          color={COLORS.jaw}
          width={sw * 1.1}
          noSplit
        />
      )}

      {/* Ears */}
      {toggles.ear && (
        <>
          <DepthLine pts={proj(earL)} color={COLORS.ear} width={sw * 1.4} />
          <DepthLine pts={proj(earR)} color={COLORS.ear} width={sw * 1.4} />
        </>
      )}
    </svg>
  )
}
