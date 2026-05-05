import type { ImageMode } from './store'

// Process the source image into a new HTMLImageElement matching the requested mode.
// For 'color' returns the source unchanged. For 'grayscale' / 'pencil' renders into
// an offscreen canvas and produces a fresh image element.
export async function processImage(src: HTMLImageElement, mode: ImageMode): Promise<HTMLImageElement> {
  if (mode === 'color') return src

  const w = src.naturalWidth
  const h = src.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  if (mode === 'grayscale') {
    ctx.filter = 'grayscale(100%)'
    ctx.drawImage(src, 0, 0, w, h)
    ctx.filter = 'none'
  } else {
    // Classic dodge-blend pencil sketch:
    //   1. Grayscale base
    //   2. Inverted + blurred copy
    //   3. Color-dodge blend: out = base / (255 - blurInv)
    ctx.filter = 'grayscale(100%)'
    ctx.drawImage(src, 0, 0, w, h)
    ctx.filter = 'none'
    const base = ctx.getImageData(0, 0, w, h)

    const tmp = document.createElement('canvas')
    tmp.width = w
    tmp.height = h
    const tctx = tmp.getContext('2d')
    if (!tctx) throw new Error('Canvas 2D context unavailable')
    const blurPx = Math.max(8, Math.min(40, Math.round(Math.min(w, h) / 60)))
    tctx.filter = `grayscale(100%) invert(100%) blur(${blurPx}px)`
    tctx.drawImage(src, 0, 0, w, h)
    tctx.filter = 'none'
    const blurInv = tctx.getImageData(0, 0, w, h)

    const out = ctx.createImageData(w, h)
    for (let i = 0; i < out.data.length; i += 4) {
      const b = base.data[i]
      const v = blurInv.data[i]
      const dodged = v >= 255 ? 255 : Math.min(255, (b * 255) / (255 - v))
      out.data[i] = dodged
      out.data[i + 1] = dodged
      out.data[i + 2] = dodged
      out.data[i + 3] = 255
    }
    ctx.putImageData(out, 0, 0)
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png'),
  )
  if (!blob) throw new Error('Failed to encode processed image')
  const url = URL.createObjectURL(blob)
  const out = new Image()
  out.src = url
  await out.decode()
  return out
}
