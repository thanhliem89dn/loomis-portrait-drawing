import { useCallback, useRef, useState } from 'react'
import { useStore } from './store'

const TEST_IMAGE_URL = '/test-portrait.webp'

export function Uploader() {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const setImage = useStore((s) => s.setImage)
  const setError = useStore((s) => s.setError)

  const loadFromUrl = useCallback(
    async (url: string) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = url
      try {
        await img.decode()
      } catch {
        setError('Could not decode image')
        return
      }
      setImage(url, img)
    },
    [setImage, setError],
  )

  const handleFile = useCallback(
    (file: File) => loadFromUrl(URL.createObjectURL(file)),
    [loadFromUrl],
  )

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const loadTestImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      loadFromUrl(TEST_IMAGE_URL)
    },
    [loadFromUrl],
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center w-full h-full min-h-[280px] border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
        dragOver ? 'border-emerald-400 bg-emerald-400/5' : 'border-zinc-700 hover:border-zinc-500'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <div className="text-zinc-300 text-lg font-medium">Drop a portrait photo</div>
      <div className="text-zinc-500 text-sm mt-2">or click to choose a file</div>
      <button
        onClick={loadTestImage}
        className="mt-6 px-3 py-1.5 text-xs rounded-md border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/60 hover:text-zinc-100"
      >
        Load test image
      </button>
    </div>
  )
}
