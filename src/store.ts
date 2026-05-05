import { create } from 'zustand'

export type Transform = {
  x: number         // 0-1, image-normalized
  y: number         // 0-1, image-normalized
  scale: number     // ball radius as fraction of viewport height
  yaw: number       // radians (head turning left/right)
  pitch: number     // radians (head tilting up/down)
  roll: number      // radians (head leaning side-to-side)
  jawWidth: number  // 0.4-1.4, horizontal scale of jaw
  jawLength: number // 0.4-1.6, how far the jaw extends below the sphere
  jawTaper: number  // 0-1, how much the jaw narrows toward the chin
}

export type OverlayToggles = {
  ball: boolean
  sidePlane: boolean
  centerline: boolean
  browLine: boolean
  hairline: boolean
  noseLine: boolean
  chinLine: boolean
  jaw: boolean
  ear: boolean
  wireframe: boolean
}

export type GridSettings = {
  enabled: boolean
  cells: number // count along the short side; cells are always SQUARE
  diagonals: boolean
}

export type PaperSize = 'none' | 'A5' | 'A4' | 'A3'

export type ImageMode = 'color' | 'grayscale' | 'pencil'

export const PAPER_DIMS: Record<Exclude<PaperSize, 'none'>, { short: number; long: number }> = {
  A5: { short: 148, long: 210 },
  A4: { short: 210, long: 297 },
  A3: { short: 297, long: 420 },
}

type AppState = {
  imageUrl: string | null
  imageEl: HTMLImageElement | null
  errorMessage: string | null
  transform: Transform
  toggles: OverlayToggles
  overlayAlpha: number // 0-1, master opacity for all overlay lines
  grid: GridSettings
  paper: PaperSize
  imageMode: ImageMode
  setImage: (url: string, el: HTMLImageElement) => void
  setError: (msg: string | null) => void
  setTransform: (t: Partial<Transform>) => void
  setOverlayAlpha: (a: number) => void
  setGrid: (g: Partial<GridSettings>) => void
  setPaper: (p: PaperSize) => void
  setImageMode: (m: ImageMode) => void
  toggle: (key: keyof OverlayToggles) => void
  resetTransform: () => void
  reset: () => void
}

const defaultTransform: Transform = {
  x: 0.5,
  y: 0.5,
  scale: 0.18,
  yaw: 0,
  pitch: 0,
  roll: 0,
  jawWidth: 1.0,
  jawLength: 1.0,
  jawTaper: 0.5,
}

const defaultToggles: OverlayToggles = {
  ball: true,
  sidePlane: true,
  centerline: true,
  browLine: true,
  hairline: false,
  noseLine: true,
  chinLine: true,
  jaw: true,
  ear: true,
  wireframe: false,
}

const defaultGrid: GridSettings = {
  enabled: false,
  cells: 8,
  diagonals: false,
}

export const useStore = create<AppState>((set) => ({
  imageUrl: null,
  imageEl: null,
  errorMessage: null,
  transform: defaultTransform,
  toggles: defaultToggles,
  overlayAlpha: 0.95,
  grid: defaultGrid,
  paper: 'none' as PaperSize,
  imageMode: 'color' as ImageMode,
  setImage: (imageUrl, imageEl) =>
    set((s) => {
      // Revoke previous blob URL so we don't leak object URLs across uploads.
      if (s.imageUrl && s.imageUrl.startsWith('blob:')) URL.revokeObjectURL(s.imageUrl)
      return { imageUrl, imageEl, errorMessage: null }
    }),
  setError: (errorMessage) => set({ errorMessage }),
  setTransform: (t) => set((s) => ({ transform: { ...s.transform, ...t } })),
  setOverlayAlpha: (overlayAlpha) => set({ overlayAlpha }),
  setGrid: (g) => set((s) => ({ grid: { ...s.grid, ...g } })),
  setPaper: (paper) => set({ paper }),
  setImageMode: (imageMode) => set({ imageMode }),
  toggle: (key) => set((s) => ({ toggles: { ...s.toggles, [key]: !s.toggles[key] } })),
  resetTransform: () => set({ transform: defaultTransform }),
  reset: () =>
    set((s) => {
      if (s.imageUrl && s.imageUrl.startsWith('blob:')) URL.revokeObjectURL(s.imageUrl)
      return { imageUrl: null, imageEl: null, errorMessage: null, transform: defaultTransform }
    }),
}))
