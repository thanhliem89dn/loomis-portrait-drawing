import { useStore, PAPER_DIMS, type ImageMode, type OverlayToggles, type PaperSize, type Transform } from './store'

const ITEMS: { key: keyof OverlayToggles; label: string; color: string }[] = [
  { key: 'ball', label: 'Cranium ball', color: '#34d399' },
  { key: 'sidePlane', label: 'Side planes', color: '#fbbf24' },
  { key: 'centerline', label: 'Centerline', color: '#f472b6' },
  { key: 'browLine', label: 'Brow line', color: '#60a5fa' },
  { key: 'hairline', label: 'Hairline', color: '#a3e635' },
  { key: 'noseLine', label: 'Nose-base line', color: '#60a5fa' },
  { key: 'chinLine', label: 'Chin line', color: '#60a5fa' },
  { key: 'jaw', label: 'Jawline', color: '#f87171' },
  { key: 'ear', label: 'Ear', color: '#a78bfa' },
  { key: 'wireframe', label: 'Sphere wireframe', color: '#10b981' },
]

const DEG = 180 / Math.PI
const RAD = Math.PI / 180

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  display,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  display?: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span className="font-mono text-zinc-300">
          {display ? display(value) : value.toFixed(2)}
          {unit && <span className="text-zinc-500 ml-0.5">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-emerald-500"
      />
    </div>
  )
}

export function Controls() {
  const toggles = useStore((s) => s.toggles)
  const toggle = useStore((s) => s.toggle)
  const transform = useStore((s) => s.transform)
  const setTransform = useStore((s) => s.setTransform)
  const overlayAlpha = useStore((s) => s.overlayAlpha)
  const setOverlayAlpha = useStore((s) => s.setOverlayAlpha)
  const imageUrl = useStore((s) => s.imageUrl)
  const errorMessage = useStore((s) => s.errorMessage)
  const setError = useStore((s) => s.setError)
  const grid = useStore((s) => s.grid)
  const setGrid = useStore((s) => s.setGrid)
  const paper = useStore((s) => s.paper)
  const setPaper = useStore((s) => s.setPaper)
  const imageMode = useStore((s) => s.imageMode)
  const setImageMode = useStore((s) => s.setImageMode)
  const resetTransform = useStore((s) => s.resetTransform)
  const reset = useStore((s) => s.reset)

  // When a paper is selected, the grid divides the SHORT side into `cells` square cells,
  // so each cell's physical size in mm is paper.short / cells.
  const cellMm = paper === 'none' ? null : PAPER_DIMS[paper].short / grid.cells

  const set = (k: keyof Transform) => (v: number) => setTransform({ [k]: v })
  const setDeg = (k: 'yaw' | 'pitch' | 'roll') => (deg: number) => setTransform({ [k]: deg * RAD })

  const onExport = () => window.dispatchEvent(new CustomEvent('learndraw:export'))

  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl w-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-zinc-200 font-medium text-sm uppercase tracking-wide">Loomis head</h2>
        <div className="flex gap-2">
          <button
            onClick={resetTransform}
            className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded border border-zinc-800 hover:border-zinc-600"
          >
            Center
          </button>
          <button
            onClick={reset}
            className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded border border-zinc-800 hover:border-zinc-600"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Slider label="Size" value={transform.scale} min={0.05} max={0.5} step={0.005} display={(v) => v.toFixed(3)} onChange={set('scale')} />
        <Slider label="Yaw (turn L/R)" value={transform.yaw * DEG} min={-90} max={90} step={1} unit="°" display={(v) => v.toFixed(0)} onChange={setDeg('yaw')} />
        <Slider label="Pitch (tilt up/down)" value={transform.pitch * DEG} min={-60} max={60} step={1} unit="°" display={(v) => v.toFixed(0)} onChange={setDeg('pitch')} />
        <Slider label="Roll (lean L/R)" value={transform.roll * DEG} min={-45} max={45} step={1} unit="°" display={(v) => v.toFixed(0)} onChange={setDeg('roll')} />
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-800 pt-3">
        <div className="text-zinc-200 font-medium text-xs uppercase tracking-wide">Jaw shape</div>
        <Slider label="Jaw width" value={transform.jawWidth} min={0.4} max={1.4} step={0.02} display={(v) => v.toFixed(2)} onChange={set('jawWidth')} />
        <Slider label="Jaw length" value={transform.jawLength} min={0.4} max={1.6} step={0.02} display={(v) => v.toFixed(2)} onChange={set('jawLength')} />
        <Slider label="Chin taper" value={transform.jawTaper} min={0} max={1} step={0.02} display={(v) => v.toFixed(2)} onChange={set('jawTaper')} />
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-800 pt-3">
        <div className="flex items-center justify-between">
          <div className="text-zinc-200 font-medium text-xs uppercase tracking-wide">Image filter</div>
          <select
            value={imageMode}
            onChange={(e) => setImageMode(e.target.value as ImageMode)}
            className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200"
          >
            <option value="color">Color (original)</option>
            <option value="grayscale">Grayscale</option>
            <option value="pencil">Pencil sketch</option>
          </select>
        </div>
        {imageMode === 'pencil' && (
          <div className="text-xs text-zinc-500 leading-relaxed">
            Dodge-blend pencil effect — emphasizes tonal values for shading practice.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-800 pt-3">
        <div className="flex items-center justify-between">
          <div className="text-zinc-200 font-medium text-xs uppercase tracking-wide">Paper</div>
          <select
            value={paper}
            onChange={(e) => setPaper(e.target.value as PaperSize)}
            className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200"
          >
            <option value="none">No paper</option>
            <option value="A5">A5 — 148×210 mm</option>
            <option value="A4">A4 — 210×297 mm</option>
            <option value="A3">A3 — 297×420 mm</option>
          </select>
        </div>
        {paper !== 'none' && (
          <div className="text-xs text-zinc-500">
            Image is fitted into a {paper} sheet ({PAPER_DIMS[paper].short}×{PAPER_DIMS[paper].long} mm).
            Orientation matches the photo.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-800 pt-3">
        <div className="flex items-center justify-between">
          <div className="text-zinc-200 font-medium text-xs uppercase tracking-wide">Grid</div>
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={grid.enabled}
              onChange={(e) => setGrid({ enabled: e.target.checked })}
              className="accent-emerald-500 w-4 h-4"
            />
            Enabled
          </label>
        </div>
        <Slider
          label="Cells (short side)"
          value={grid.cells}
          min={8}
          max={30}
          step={1}
          display={(v) => v.toFixed(0)}
          onChange={(v) => setGrid({ cells: Math.round(v) })}
        />
        {cellMm !== null && (
          <div className="text-xs text-zinc-500">
            Each cell ≈ <span className="text-zinc-300 font-mono">{cellMm.toFixed(1)} mm</span> on the printed sheet.
          </div>
        )}
        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={grid.diagonals}
            onChange={(e) => setGrid({ diagonals: e.target.checked })}
            className="accent-emerald-500 w-4 h-4"
          />
          Show diagonals
        </label>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-800 pt-3">
        <div className="text-zinc-200 font-medium text-xs uppercase tracking-wide">Style</div>
        <Slider label="Overlay opacity" value={overlayAlpha} min={0.1} max={1} step={0.02} display={(v) => v.toFixed(2)} onChange={setOverlayAlpha} />
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-800 pt-3">
        <button
          onClick={onExport}
          disabled={!imageUrl}
          className="w-full px-3 py-2 text-sm rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-medium transition-colors"
        >
          Export PNG
        </button>
        {errorMessage && (
          <div className="flex items-start justify-between gap-2 text-xs text-rose-300 bg-rose-950/50 border border-rose-900/60 rounded-md px-2 py-1.5">
            <span className="leading-snug">{errorMessage}</span>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 flex-shrink-0"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-zinc-500 border-t border-zinc-800 pt-3 leading-relaxed">
        <div><span className="text-zinc-400">Drag</span> — move head</div>
        <div><span className="text-zinc-400">Right-drag</span> or <span className="text-zinc-400">Alt-drag</span> — yaw / pitch</div>
        <div><span className="text-zinc-400">Shift-drag</span> — roll</div>
        <div><span className="text-zinc-400">Scroll</span> — resize</div>
      </div>

      <div className="flex flex-col gap-1 border-t border-zinc-800 pt-3">
        <div className="text-zinc-200 font-medium text-xs uppercase tracking-wide mb-1">Layers</div>
        {ITEMS.map((item) => (
          <label
            key={item.key}
            className="flex items-center gap-3 px-2 py-1 rounded hover:bg-zinc-800/60 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={toggles[item.key]}
              onChange={() => toggle(item.key)}
              className="accent-emerald-500 w-4 h-4"
            />
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-zinc-300">{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
