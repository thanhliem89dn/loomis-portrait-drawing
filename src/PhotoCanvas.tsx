import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore, PAPER_DIMS, type PaperSize } from './store'
import { Overlay } from './Overlay'
import { processImage } from './imageProcessor'

export type ImageRect = { x: number; y: number; w: number; h: number }

function fitRect(targetAR: number, w: number, h: number): ImageRect {
  const containerAR = w / h
  if (targetAR > containerAR) {
    const dw = w, dh = w / targetAR
    return { x: 0, y: (h - dh) / 2, w: dw, h: dh }
  }
  const dh = h, dw = h * targetAR
  return { x: (w - dw) / 2, y: 0, w: dw, h: dh }
}

function computeDisplayRect(
  img: HTMLImageElement | null,
  w: number,
  h: number,
  paper: PaperSize,
): ImageRect | null {
  if (!img || w === 0 || h === 0) return null
  if (paper === 'none') return fitRect(img.naturalWidth / img.naturalHeight, w, h)
  // Paper rect: A-series 1:sqrt(2) aspect, orientation matches the image.
  const dims = PAPER_DIMS[paper]
  const portrait = img.naturalHeight >= img.naturalWidth
  const paperAR = portrait ? dims.short / dims.long : dims.long / dims.short
  return fitRect(paperAR, w, h)
}

type DragMode = null | 'translate' | 'rotate' | 'roll'

const RAD_PER_PX = Math.PI / 200 // ~180° drag across 400px

export function PhotoCanvas() {
  const imageUrl = useStore((s) => s.imageUrl)
  const imageEl = useStore((s) => s.imageEl)
  const imageMode = useStore((s) => s.imageMode)
  const transform = useStore((s) => s.transform)
  const setTransform = useStore((s) => s.setTransform)
  const setError = useStore((s) => s.setError)

  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [displayImg, setDisplayImg] = useState<HTMLImageElement | null>(null)
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)
  const paper = useStore((s) => s.paper)
  const imageRect = useMemo(
    () => computeDisplayRect(imageEl, size.w, size.h, paper),
    [imageEl, size.w, size.h, paper],
  )

  // Re-process the image whenever the source or mode changes.
  useEffect(() => {
    if (!imageEl) {
      setDisplayImg(null)
      setDisplayUrl(null)
      return
    }
    if (imageMode === 'color') {
      setDisplayImg(imageEl)
      setDisplayUrl(imageEl.src)
      return
    }
    let cancelled = false
    let createdUrl: string | null = null
    processImage(imageEl, imageMode)
      .then((processed) => {
        if (cancelled) {
          if (processed.src.startsWith('blob:')) URL.revokeObjectURL(processed.src)
          return
        }
        createdUrl = processed.src
        setDisplayImg(processed)
        setDisplayUrl(processed.src)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Image filter failed')
        }
      })
    return () => {
      cancelled = true
      if (createdUrl && createdUrl.startsWith('blob:')) URL.revokeObjectURL(createdUrl)
    }
  }, [imageEl, imageMode, setError])
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

  useEffect(() => {
    const handleExport = async () => {
      const c = containerRef.current
      const svg = document.getElementById('loomis-overlay') as SVGSVGElement | null
      const sourceImg = displayImg ?? imageEl
      if (!c || !sourceImg || !svg) return

      try {
        const w = c.clientWidth
        const h = c.clientHeight
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D context unavailable')

        ctx.fillStyle = '#0a0a0b'
        ctx.fillRect(0, 0, w, h)

        // Match the on-screen layout: outer rect = display rect (paper or image),
        // image fits inside via object-contain.
        const outer = computeDisplayRect(sourceImg, w, h, paper) ?? { x: 0, y: 0, w, h }
        if (paper !== 'none' || imageMode !== 'color') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(outer.x, outer.y, outer.w, outer.h)
        }
        const ar = sourceImg.naturalWidth / sourceImg.naturalHeight
        const outerAR = outer.w / outer.h
        let dw: number, dh: number, dx: number, dy: number
        if (ar > outerAR) {
          dw = outer.w; dh = outer.w / ar
          dx = outer.x; dy = outer.y + (outer.h - dh) / 2
        } else {
          dh = outer.h; dw = outer.h * ar
          dx = outer.x + (outer.w - dw) / 2; dy = outer.y
        }
        ctx.drawImage(sourceImg, dx, dy, dw, dh)

        // Serialize and rasterize the live SVG (preserves current transform/toggles/alpha)
        const clone = svg.cloneNode(true) as SVGSVGElement
        if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        clone.setAttribute('width', String(w))
        clone.setAttribute('height', String(h))
        const svgStr = new XMLSerializer().serializeToString(clone)
        const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr)
        const svgImg = new Image()
        svgImg.src = svgUrl
        await svgImg.decode()
        ctx.drawImage(svgImg, 0, 0, w, h)

        await new Promise<void>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to encode PNG'))
              return
            }
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `learndraw-loomis-${Date.now()}.png`
            a.click()
            URL.revokeObjectURL(url)
            resolve()
          }, 'image/png')
        })
        setError(null)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Export failed'
        setError(`Export failed: ${msg}`)
      }
    }
    window.addEventListener('learndraw:export', handleExport)
    return () => window.removeEventListener('learndraw:export', handleExport)
  }, [imageEl, displayImg, imageMode, paper, setError])

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
          {imageRect && displayUrl && (
            <div
              style={{
                position: 'absolute',
                left: imageRect.x,
                top: imageRect.y,
                width: imageRect.w,
                height: imageRect.h,
                background: paper !== 'none' || imageMode !== 'color' ? '#ffffff' : 'transparent',
              }}
            >
              <img
                src={displayUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-contain select-none"
                draggable={false}
              />
            </div>
          )}
          <Overlay width={size.w} height={size.h} imageRect={imageRect} />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
          No image loaded
        </div>
      )}
    </div>
  )
}
