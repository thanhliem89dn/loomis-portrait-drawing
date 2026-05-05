import { useStore } from './store'
import {
  rot,
  project,
  SPHERE_WIREFRAME,
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
  type ScreenPt,
} from './loomisModel'

// Loomis layer colors — kept saturated and distinct so each construction
// line is easy to identify on top of the photo. The surrounding chrome is
// monochrome (Nothing aesthetic); only the functional overlay carries color.
const COLORS = {
  ball: '#34d399',
  sidePlane: '#fbbf24',
  centerline: '#f472b6',
  brow: '#60a5fa',
  hairline: '#a3e635',
  feature: '#60a5fa', // shared color for nose-base and chin lines
  jaw: '#f87171',
  ear: '#a78bfa',
  wireframe: '#10b981',
}

type ImageRect = { x: number; y: number; w: number; h: number }
type Props = { width: number; height: number; imageRect: ImageRect | null }

function projectLine(
  pts: Vec3[],
  yaw: number,
  pitch: number,
  roll: number,
  cx: number,
  cy: number,
  ppu: number,
): ScreenPt[] {
  return pts.map((p) => project(rot(p, yaw, pitch, roll), cx, cy, ppu))
}

// Split a polyline into front-facing (z>=0) and back-facing (z<0) segments.
function splitByDepth(pts: ScreenPt[]): { front: ScreenPt[][]; back: ScreenPt[][] } {
  const front: ScreenPt[][] = []
  const back: ScreenPt[][] = []
  let curFront: ScreenPt[] = []
  let curBack: ScreenPt[] = []
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

function pathOf(pts: ScreenPt[]): string {
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
  pts: ScreenPt[]
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

export function Overlay({ width, height, imageRect }: Props) {
  const transform = useStore((s) => s.transform)
  const toggles = useStore((s) => s.toggles)
  const overlayAlpha = useStore((s) => s.overlayAlpha)
  const grid = useStore((s) => s.grid)
  if (width === 0 || height === 0) return null

  const gridStroke = Math.max(1, height * 0.0022)

  const cx = transform.x * width
  const cy = transform.y * height
  const ppu = transform.scale * height // pixels per model unit (sphere radius)
  const sw = Math.max(1.4, height * 0.0035)

  const proj = (pts: Vec3[]) => projectLine(pts, transform.yaw, transform.pitch, transform.roll, cx, cy, ppu)

  return (
    <svg
      id="loomis-overlay"
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: overlayAlpha }}
    >
      {/* Grid (drawing aid) — square cells, count along the short side */}
      {grid.enabled && imageRect && (() => {
        const shortSide = Math.min(imageRect.w, imageRect.h)
        const cellSize = shortSide / grid.cells
        const colCount = Math.floor(imageRect.w / cellSize)
        const rowCount = Math.floor(imageRect.h / cellSize)
        // Anchor grid at the top-left of the paper; any leftover sits at right/bottom.
        const x0 = imageRect.x
        const y0 = imageRect.y
        const w = colCount * cellSize
        const h = rowCount * cellSize
        return (
          <g>
            <rect
              x={x0}
              y={y0}
              width={w}
              height={h}
              fill="none"
              stroke="#ffffff"
              strokeWidth={gridStroke}
              opacity={0.9}
            />
            {Array.from({ length: colCount - 1 }, (_, i) => {
              const x = x0 + (i + 1) * cellSize
              return (
                <line key={`gv${i}`} x1={x} y1={y0} x2={x} y2={y0 + h}
                  stroke="#ffffff" strokeWidth={gridStroke} opacity={0.55} />
              )
            })}
            {Array.from({ length: rowCount - 1 }, (_, i) => {
              const y = y0 + (i + 1) * cellSize
              return (
                <line key={`gh${i}`} x1={x0} y1={y} x2={x0 + w} y2={y}
                  stroke="#ffffff" strokeWidth={gridStroke} opacity={0.55} />
              )
            })}
            {grid.diagonals && (
              <>
                <line x1={x0} y1={y0} x2={x0 + w} y2={y0 + h}
                  stroke="#ffffff" strokeWidth={gridStroke} opacity={0.45}
                  strokeDasharray={`${gridStroke * 4} ${gridStroke * 3}`} />
                <line x1={x0 + w} y1={y0} x2={x0} y2={y0 + h}
                  stroke="#ffffff" strokeWidth={gridStroke} opacity={0.45}
                  strokeDasharray={`${gridStroke * 4} ${gridStroke * 3}`} />
              </>
            )}
          </g>
        )
      })()}

      {/* Wireframe sphere */}
      {toggles.wireframe &&
        SPHERE_WIREFRAME.map((line, i) => (
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
          color={COLORS.feature}
          width={sw}
          showBack={false}
        />
      )}

      {/* Chin line */}
      {toggles.chinLine && (
        <DepthLine
          pts={proj(buildChinLine(transform.jawLength, transform.jawWidth, transform.jawTaper))}
          color={COLORS.feature}
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
