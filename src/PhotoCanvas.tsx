import { useEffect, useRef, useState } from 'react'
import { useStore } from './store'
import { Overlay } from './Overlay'

export function PhotoCanvas() {
  const imageUrl = useStore((s) => s.imageUrl)
  const transform = useStore((s) => s.transform)
  const setTransform = useStore((s) => s.setTransform)

  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const dragging = useRef(false)

  useEffect(() => {
    const c = containerRef.current
    if (!c) return
    const update = () => setSize({ w: c.clientWidth, h: c.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(c)
    return () => ro.disconnect()
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setTransform({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false
    try { (e.currentTarget as Element).releasePointerCapture(e.pointerId) } catch { /* */ }
  }

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.01 : 0.01
    setTransform({ scale: Math.max(0.05, Math.min(0.5, transform.scale + delta)) })
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-contain select-none"
            draggable={false}
          />
          <Overlay width={size.w} height={size.h} />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
          No image loaded
        </div>
      )}
    </div>
  )
}
