import { useStore, type OverlayToggles, type Transform } from './store'

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
  const resetTransform = useStore((s) => s.resetTransform)
  const reset = useStore((s) => s.reset)

  const set = (k: keyof Transform) => (v: number) => setTransform({ [k]: v })
  const setDeg = (k: 'yaw' | 'pitch' | 'roll') => (deg: number) => setTransform({ [k]: deg * RAD })

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

      <div className="text-xs text-zinc-500 border-t border-zinc-800 pt-3">
        Drag the head with your mouse to position. Scroll to resize.
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
