import { useEffect, useRef, useState } from 'react'
import { useStore } from './store'
import { Overlay } from './Overlay'

type DragMode = null | 'translate' | 'rotate' | 'roll'

const RAD_PER_PX = Math.PI / 200 // ~180° drag across 400px

export function PhotoCanvas() {
  const imageUrl = useStore((s) => s.imageUrl)
  const transform = useStore((s) => s.transform)
  const setTransform = useStore((s) => s.setTransform)

  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const drag = useRef<{
    mode: DragMode
    startX: number
    startY: number
    startTx: { yaw: number; pitch: number; roll: number }
  }>({ mode: null, startX: 0, startY: 0, startTx: { yaw: 0, pitch: 0, roll: 0 } })

  useEffect(() => {
    const c = containerRef.current
    if (!c) return
    const update = () => setSize({ w: c.clientWidth, h: c.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(c)
    return () => ro.disconnect()
  }, [])

  const pickMode = (e: React.PointerEvent): DragMode => {
    // Right-click or middle-click → rotate yaw/pitch
    if (e.button === 2 || e.button === 1) return 'rotate'
    // Shift + left = roll
    if (e.shiftKey) return 'roll'
    // Alt + left = rotate (alternative for trackpads without right-click)
    if (e.altKey) return 'rotate'
    return 'translate'
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const mode = pickMode(e)
    drag.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startTx: { yaw: transform.yaw, pitch: transform.pitch, roll: transform.roll },
    }
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    e.preventDefault()
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d.mode || !containerRef.current) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY

    if (d.mode === 'translate') {
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setTransform({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) })
    } else if (d.mode === 'rotate') {
      const yaw = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d.startTx.yaw + dx * RAD_PER_PX))
      const pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, d.startTx.pitch + dy * RAD_PER_PX))
      setTransform({ yaw, pitch })
    } else if (d.mode === 'roll') {
      const roll = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, d.startTx.roll + dx * RAD_PER_PX * 0.7))
      setTransform({ roll })
    }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    drag.current.mode = null
    try { (e.currentTarget as Element).releasePointerCapture(e.pointerId) } catch { /* */ }
  }

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.01 : 0.01
    setTransform({ scale: Math.max(0.05, Math.min(0.5, transform.scale + delta)) })
  }

  const onContextMenu = (e: React.MouseEvent) => e.preventDefault()

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
      onContextMenu={onContextMenu}
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
