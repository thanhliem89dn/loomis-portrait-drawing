import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the site from /<repo-name>/, so the build needs a matching base.
// Override at build time with `BASE_PATH=/foo/ npm run build` if the repo is renamed.
declare const process: { env: Record<string, string | undefined> }
const base = process.env.BASE_PATH ?? '/loomis-portrait-drawing/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
