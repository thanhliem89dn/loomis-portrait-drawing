import { useCallback, useRef, useState } from 'react'
import { useStore } from './store'

const TEST_IMAGE_URL = `${import.meta.env.BASE_URL}test-portrait.webp`

type Props = { compact?: boolean }

export function Uploader({ compact = false }: Props) {
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
      className={`flex flex-col items-center justify-center w-full cursor-pointer transition-colors ${
        compact ? 'p-4 min-h-[120px]' : 'h-full min-h-[280px] p-8'
      } ${dragOver ? 'bg-[var(--color-accent)]/5' : ''}`}
      style={{
        border: `1px dashed ${dragOver ? 'var(--color-accent)' : 'var(--color-line)'}`,
        margin: compact ? '16px' : 0,
      }}
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
      <div className={`font-mono ${compact ? 'text-[10px]' : 'text-xs'} tracking-[0.12em] uppercase text-[var(--color-fg)]`}>
        Drop portrait
      </div>
      <div className={`font-sans ${compact ? 'text-[10px] mt-1' : 'text-xs mt-2'} text-[var(--color-mute)]`}>
        or click to choose a file
      </div>
      <button
        type="button"
        onClick={loadTestImage}
        className="btn mt-6"
      >
        Load test image
      </button>
    </div>
  )
}
