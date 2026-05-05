import { useStore } from './store'
import { Uploader } from './Uploader'
import { PhotoCanvas } from './PhotoCanvas'
import { Controls } from './Controls'

export default function App() {
  const imageUrl = useStore((s) => s.imageUrl)

  return (
    <div className="h-full w-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="flex items-center justify-between px-6 h-14 border-b border-[var(--color-line)]">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-[var(--color-accent)]" />
          <h1 className="font-mono text-sm font-medium tracking-[0.12em] uppercase text-[var(--color-fg)]">
            LearnDraw
          </h1>
        </div>
        <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-mute)]">
          v0.1 / Loomis · Grid · Pencil
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_360px] min-h-0">
        <section className="min-h-[400px] h-full border-r border-[var(--color-line)]">
          {imageUrl ? <PhotoCanvas /> : <Uploader />}
        </section>
        <aside className="flex flex-col min-h-0 overflow-y-auto">
          <Controls />
          {imageUrl && (
            <div className="border-t border-[var(--color-line)]">
              <Uploader compact />
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
