# LearnDraw — Loomis Portrait

Interactive web tool for drawing portraits using the **Loomis method** and the **grid method**, with adjustable 3D head construction overlaid on a reference photo.

**Live demo:** https://thanhliem89dn.github.io/loomis-portrait-drawing/

## What it does

Upload a portrait photo and drop a parametric Loomis-method head construction over it — cranium ball, side planes, brow / nose-base / chin lines, jawline, ears, and centerline — to study the underlying structure. Position, scale, and rotate the construction (yaw / pitch / roll) so it lines up with the subject's actual head.

A second drawing aid is built in: a **square-cell grid** that fits the photo into a real paper size (A5 / A4 / A3), with a readout of physical cell size in millimetres so you can transfer cell-by-cell to a printed sheet.

For tonal study, the photo can be filtered to **grayscale** or a **dodge-blend pencil sketch** before drawing.

## Features

- 3D Loomis head model (sphere + side planes + jaw) projected onto the photo
- Interactive controls: drag to position, right/alt-drag for yaw + pitch, shift-drag for roll, scroll to scale, sliders for everything
- Shape sliders: jaw width, jaw length, chin taper
- Equal-thirds layout: brow / nose-base / chin lines auto-divide brow→chin into halves
- Grid drawing aid with **square cells** (always — never rectangles), 8–30 cells along the short side
- Paper sizing: fits the photo into A5 / A4 / A3 with auto-orientation; cell physical size shown in mm
- Image filters: color / grayscale / pencil sketch
- Master overlay opacity slider; per-layer toggles
- Export PNG of the photo + live overlay (preserves all current settings)

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Zustand for state
- SVG-based 3D projection (no WebGL — depth-aware front/back stroke rendering)
- Canvas 2D for image filters and PNG export

## Local development

Requires Node 18+ (use `nvm` or [nodejs.org](https://nodejs.org)).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output → dist/
```

## Deployment

Pushes to `main` are auto-deployed to GitHub Pages via `.github/workflows/deploy.yml`.

To enable Pages on a fresh fork:
1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Push to `main`.

## License

MIT
