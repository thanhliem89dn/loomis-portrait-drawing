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
  mouthLine: boolean
  jaw: boolean
  ear: boolean
  wireframe: boolean
}

type AppState = {
  imageUrl: string | null
  imageEl: HTMLImageElement | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  errorMessage: string | null
  transform: Transform
  toggles: OverlayToggles
  setImage: (url: string, el: HTMLImageElement) => void
  setStatus: (s: AppState['status'], err?: string | null) => void
  setTransform: (t: Partial<Transform>) => void
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
  mouthLine: true,
  jaw: true,
  ear: true,
  wireframe: false,
}

export const useStore = create<AppState>((set) => ({
  imageUrl: null,
  imageEl: null,
  status: 'idle',
  errorMessage: null,
  transform: defaultTransform,
  toggles: defaultToggles,
  setImage: (imageUrl, imageEl) => set({ imageUrl, imageEl, status: 'ready', errorMessage: null }),
  setStatus: (status, errorMessage = null) => set({ status, errorMessage }),
  setTransform: (t) => set((s) => ({ transform: { ...s.transform, ...t } })),
  toggle: (key) => set((s) => ({ toggles: { ...s.toggles, [key]: !s.toggles[key] } })),
  resetTransform: () => set({ transform: defaultTransform }),
  reset: () => set({ imageUrl: null, imageEl: null, status: 'idle', errorMessage: null, transform: defaultTransform }),
}))
