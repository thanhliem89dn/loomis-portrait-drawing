# LearnDraw — Design Spec

Visual language inspired by **Nothing**: monochrome, typographic, industrial.
Treat the UI like instrument chrome around the photo. Information is laid out
like a technical readout — labels in uppercase mono, numbers right-aligned,
hairline rules between sections.

---

## 1. Palette

Pure black surface, white foreground, four neutral steps, one accent.

| Token        | Hex      | Use                                       |
|--------------|----------|-------------------------------------------|
| `--bg`       | `#0a0a0a`| App canvas background                     |
| `--surface`  | `#111`   | Panel surface (1 step lighter than bg)    |
| `--line`     | `#262626`| Hairline borders, dividers                |
| `--mute`     | `#666`   | Tertiary labels, disabled state           |
| `--text`     | `#e5e5e5`| Secondary text                            |
| `--fg`       | `#fff`   | Primary foreground, headings, values      |
| `--accent`   | `#ff3b30`| Single accent — active state, brand dot   |

No saturated colors anywhere except the Loomis layer strokes (which carry
functional meaning). Loomis palette is recoded to a monochrome set + accent
red for the centerline (the most important construction line).

---

## 2. Typography

Two faces: **Inter** for everything readable, **JetBrains Mono** for any
numeric value, technical label, slider readout, or section header.

| Role             | Family       | Size  | Weight | Tracking | Case      |
|------------------|--------------|-------|--------|----------|-----------|
| App title        | JetBrains Mono | 14px | 500   | +0.06em | UPPERCASE |
| Section header   | JetBrains Mono | 11px | 500   | +0.12em | UPPERCASE |
| Slider label     | Inter        | 12px  | 400   | normal   | sentence  |
| Numeric readout  | JetBrains Mono | 12px | 500   | normal   | as-is     |
| Helper text      | Inter        | 11px  | 400   | normal   | sentence  |
| Button label     | JetBrains Mono | 11px | 500   | +0.12em | UPPERCASE |

**Section headers carry an index** — `01`, `02`, `03` — drawn in mute color
on the left, small. Reads like a parts list.

---

## 3. Geometry

- **No rounded corners** anywhere. Sharp 90° edges everywhere except the
  slider thumb (which is a small square outline).
- **Hairlines, not boxes.** 1px borders in `--line`. Panels are not rounded
  cards — they're rectangles separated by horizontal rules.
- **Spacing scale**: 4 / 8 / 12 / 16 / 24 / 32. No 6 / 14 / 20.
- **Grid**: 16px gutter. Sidebar is 360px fixed.

---

## 4. Components

### Section
Single hairline rule above the section. Header line: index + uppercase title
on the left, optional inline control on the right. Body below with 12px
top padding.

```
─────────────────────────────────────
01  LOOMIS HEAD                [ACTION]
                                       
[…body…]
```

### Slider
Thin 1px track, monochrome. Square 8×8 thumb (filled white, 1px line in idle,
red fill on active). Value displayed to the right of the label in mono.

```
Size                              0.180
━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Button
Rectangular, 1px border, transparent background, uppercase mono text.
Hover: invert (white bg, black text). Active accent button: red border.

```
[ AUTO-FIT TO FACE                    ]
```

Disabled: 50% opacity, `not-allowed` cursor.

### Toggle / checkbox
Square outline 14×14, 1px border in `--line`. Filled state: solid white
square with a 2px black inset (so the check reads as a tile). No tick glyph.

### Dropdown
Native `<select>`, restyled: 1px border, sharp edges, mono text, no chrome.
Down-arrow: a small `▾` glyph in mute color.

### Status / error pill
Hairline border with a red dot at the leading edge. No fill. Dismiss button
on the right is just a `×` glyph in mono.

```
●  No face detected — try a clearer photo.            ×
```

### Drop zone
Dashed 1px border (8px-on, 4px-off), uppercase mono label centered. On
hover or drag-over, the dash inverts to solid red and the label tightens.

---

## 5. Loomis layer palette (recoded)

| Layer          | Stroke           | Style           |
|----------------|------------------|-----------------|
| Cranium ball   | `--fg`           | solid, 1.4×     |
| Centerline     | `--accent` (red) | solid, 1×       |
| Brow line      | `--fg`           | solid, 1×       |
| Hairline       | `--text`         | dashed, 1×      |
| Side planes    | `--text`         | dashed, 1×      |
| Nose-base      | `--text`         | solid, 1×       |
| Chin           | `--text`         | solid, 1×       |
| Jaw            | `--fg`           | solid, 1.1×     |
| Ear            | `--mute`         | solid, 1.4×     |
| Wireframe      | `--mute`         | solid, 0.5×     |
| Grid           | `--fg` @ 0.55    | solid, hairline |

The accent red is reserved for the **centerline** because it's the single
most important Loomis structure — the head's mirror plane.

---

## 6. Header

Top of the app:

```
─────────────────────────────────────────────────
●  LEARNDRAW                       v0.1 / loomis
─────────────────────────────────────────────────
```

A 6×6 red dot on the left, app wordmark in mono uppercase, tiny version
string on the far right in mute.

---

## 7. Motion

- Transitions: 120ms ease-out for hover state changes only.
- No translate animations on layout changes.
- The accent red dot near loading buttons is solid (not pulsing) — the
  spinner concept is replaced by a text change ("DETECTING…" with a
  trailing dot ellipsis).
