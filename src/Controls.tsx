import { useStore, PAPER_DIMS, type ImageMode, type OverlayToggles, type PaperSize, type Transform } from './store'

const ITEMS: { key: keyof OverlayToggles; label: string }[] = [
  { key: 'ball', label: 'Cranium ball' },
  { key: 'sidePlane', label: 'Side planes' },
  { key: 'centerline', label: 'Centerline' },
  { key: 'browLine', label: 'Brow line' },
  { key: 'hairline', label: 'Hairline' },
  { key: 'noseLine', label: 'Nose-base line' },
  { key: 'chinLine', label: 'Chin line' },
  { key: 'jaw', label: 'Jawline' },
  { key: 'ear', label: 'Ear' },
  { key: 'wireframe', label: 'Sphere wireframe' },
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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-[var(--color-text)]">{label}</span>
        <span className="num text-[12px] font-medium text-[var(--color-fg)]">
          {display ? display(value) : value.toFixed(2)}
          {unit && <span className="text-[var(--color-mute)] ml-0.5">{unit}</span>}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  )
}

function Section({
  index,
  title,
  inline,
  children,
}: {
  index: string
  title: string
  inline?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-[var(--color-line)]">
      <div className="flex items-center justify-between h-9 px-4">
        <div className="flex items-baseline gap-3">
          <span className="num text-[10px] text-[var(--color-mute)]">{index}</span>
          <h2 className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-fg)]">
            {title}
          </h2>
        </div>
        {inline && <div>{inline}</div>}
      </div>
      <div className="px-4 pb-4 flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-2 text-[10px] tracking-[0.08em] uppercase text-[var(--color-mute)] hover:text-[var(--color-text)] cursor-pointer transition-colors">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
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
  const autoFitting = useStore((s) => s.autoFitting)
  const resetTransform = useStore((s) => s.resetTransform)
  const reset = useStore((s) => s.reset)

  const set = (k: keyof Transform) => (v: number) => setTransform({ [k]: v })
  const setDeg = (k: 'yaw' | 'pitch' | 'roll') => (deg: number) => setTransform({ [k]: deg * RAD })

  const onExport = () => window.dispatchEvent(new CustomEvent('learndraw:export'))
  const onAutoFit = () => window.dispatchEvent(new CustomEvent('learndraw:auto-fit'))

  const cellMm = paper === 'none' ? null : PAPER_DIMS[paper].short / grid.cells

  const selectClasses =
    'font-mono text-[11px] tracking-[0.06em] uppercase bg-transparent border border-[var(--color-line)] px-2 py-1 text-[var(--color-text)] hover:border-[var(--color-mute)] focus:border-[var(--color-fg)] focus:outline-none cursor-pointer'

  return (
    <div className="flex flex-col bg-[var(--color-surface)]">
      {/* Section 01 — Loomis head */}
      <Section
        index="01"
        title="Loomis Head"
        inline={
          <div className="flex gap-2">
            <button onClick={resetTransform} className="btn h-7 px-2">Center</button>
            <button onClick={reset} className="btn h-7 px-2">Clear</button>
          </div>
        }
      >
        <button
          onClick={onAutoFit}
          disabled={!imageUrl || autoFitting}
          className="btn btn-block btn-accent"
        >
          {autoFitting ? 'Detecting…' : 'Auto-fit to face'}
        </button>
        <Slider label="Size" value={transform.scale} min={0.05} max={0.5} step={0.005} display={(v) => v.toFixed(3)} onChange={set('scale')} />
        <Slider label="Yaw (turn L/R)" value={transform.yaw * DEG} min={-90} max={90} step={1} unit="°" display={(v) => v.toFixed(0)} onChange={setDeg('yaw')} />
        <Slider label="Pitch (tilt up/down)" value={transform.pitch * DEG} min={-60} max={60} step={1} unit="°" display={(v) => v.toFixed(0)} onChange={setDeg('pitch')} />
        <Slider label="Roll (lean L/R)" value={transform.roll * DEG} min={-45} max={45} step={1} unit="°" display={(v) => v.toFixed(0)} onChange={setDeg('roll')} />
      </Section>

      {/* Section 02 — Jaw */}
      <Section index="02" title="Jaw shape">
        <Slider label="Jaw width" value={transform.jawWidth} min={0.4} max={1.4} step={0.02} display={(v) => v.toFixed(2)} onChange={set('jawWidth')} />
        <Slider label="Jaw length" value={transform.jawLength} min={0.4} max={1.6} step={0.02} display={(v) => v.toFixed(2)} onChange={set('jawLength')} />
        <Slider label="Chin taper" value={transform.jawTaper} min={0} max={1} step={0.02} display={(v) => v.toFixed(2)} onChange={set('jawTaper')} />
      </Section>

      {/* Section 03 — Image filter */}
      <Section
        index="03"
        title="Image filter"
        inline={
          <select value={imageMode} onChange={(e) => setImageMode(e.target.value as ImageMode)} className={selectClasses}>
            <option value="color">Color</option>
            <option value="grayscale">Grayscale</option>
            <option value="pencil">Pencil</option>
          </select>
        }
      >
        {imageMode === 'pencil' && (
          <div className="text-[11px] text-[var(--color-mute)] leading-relaxed">
            Dodge-blend pencil sketch — emphasizes tonal values for shading practice.
          </div>
        )}
      </Section>

      {/* Section 04 — Paper */}
      <Section
        index="04"
        title="Paper"
        inline={
          <select value={paper} onChange={(e) => setPaper(e.target.value as PaperSize)} className={selectClasses}>
            <option value="none">No paper</option>
            <option value="A5">A5</option>
            <option value="A4">A4</option>
            <option value="A3">A3</option>
          </select>
        }
      >
        {paper !== 'none' && (
          <div className="text-[11px] text-[var(--color-mute)] leading-relaxed">
            Image fitted to {paper} ({PAPER_DIMS[paper].short} × {PAPER_DIMS[paper].long} mm). Orientation matches the photo.
          </div>
        )}
      </Section>

      {/* Section 05 — Grid */}
      <Section index="05" title="Grid" inline={<Toggle checked={grid.enabled} onChange={(v) => setGrid({ enabled: v })} label="Enabled" />}>
        <Slider label="Cells (short side)" value={grid.cells} min={8} max={30} step={1} display={(v) => v.toFixed(0)} onChange={(v) => setGrid({ cells: Math.round(v) })} />
        {cellMm !== null && (
          <div className="text-[11px] text-[var(--color-mute)]">
            Cell ≈ <span className="num text-[var(--color-text)]">{cellMm.toFixed(1)} mm</span> printed.
          </div>
        )}
        <Toggle checked={grid.diagonals} onChange={(v) => setGrid({ diagonals: v })} label="Show diagonals" />
      </Section>

      {/* Section 06 — Style */}
      <Section index="06" title="Style">
        <Slider label="Overlay opacity" value={overlayAlpha} min={0.1} max={1} step={0.02} display={(v) => v.toFixed(2)} onChange={setOverlayAlpha} />
      </Section>

      {/* Section 07 — Export */}
      <Section index="07" title="Export">
        <button onClick={onExport} disabled={!imageUrl} className="btn btn-block">Export PNG</button>
        {errorMessage && (
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 border border-[var(--color-accent)]/40">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 bg-[var(--color-accent)] flex-shrink-0" />
              <span className="text-[11px] text-[var(--color-text)] truncate">{errorMessage}</span>
            </div>
            <button onClick={() => setError(null)} aria-label="Dismiss error"
              className="text-[var(--color-mute)] hover:text-[var(--color-fg)] font-mono text-sm leading-none flex-shrink-0">
              ×
            </button>
          </div>
        )}
      </Section>

      {/* Section 08 — Layers */}
      <Section index="08" title="Layers">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {ITEMS.map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 py-1 cursor-pointer text-[12px] text-[var(--color-text)] hover:text-[var(--color-fg)] transition-colors"
            >
              <input type="checkbox" checked={toggles[item.key]} onChange={() => toggle(item.key)} />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Section 09 — Shortcuts */}
      <Section index="09" title="Shortcuts">
        <ul className="font-mono text-[10px] tracking-[0.06em] uppercase text-[var(--color-mute)] leading-relaxed space-y-1">
          <li><span className="text-[var(--color-text)]">Drag</span> — move head</li>
          <li><span className="text-[var(--color-text)]">Right / Alt-drag</span> — yaw / pitch</li>
          <li><span className="text-[var(--color-text)]">Shift-drag</span> — roll</li>
          <li><span className="text-[var(--color-text)]">Scroll</span> — resize</li>
        </ul>
      </Section>
    </div>
  )
}
