import { useStore } from './store'
import { Uploader } from './Uploader'
import { PhotoCanvas } from './PhotoCanvas'
import { Controls } from './Controls'

export default function App() {
  const imageUrl = useStore((s) => s.imageUrl)

  return (
    <div className="h-full w-full flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h1 className="text-zinc-100 text-lg font-semibold">LearnDraw</h1>
          <p className="text-zinc-500 text-xs">Loomis-method portrait construction overlay</p>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_340px] gap-4 p-4 min-h-0">
        <section className="min-h-[400px] h-full">
          {imageUrl ? <PhotoCanvas /> : <Uploader />}
        </section>
        <aside className="flex flex-col gap-4 min-h-0 overflow-y-auto">
          <Controls />
          {imageUrl && (
            <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
              <Uploader />
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
