# 🌳 Pixel Tree

A pixel-art night scene with two modes: an animated main scene and Conway's Game of Life.

```
  *  .    *       .    *    .
      ░░░░░░░
    ░░░░░░░░░░░
  ░░  ░░░░░  ░░
🏮     █ █ █
       █ █ █              📺
  ────────────────────────────
```

## Two modes

### 🌲 Main scene
The default view — a pixel-art night scene with a tree, lantern, stars, and meteors.

Press **▶ Play** → leaves sway, lantern ignites, meteors streak across the sky, music plays.
Press **■ Stop** → everything freezes back to static.

Animations are driven purely by toggling `.playing` on `.scene` via CSS.

### 📺 Game of Life
Click the **pixel TV** on the right side of the scene to open Conway's Game of Life as a full-screen overlay (URL changes to `/#game`).

To return to the main scene — use the **≡ burger menu → Main Screen** or the browser back button.

## Components

### 🌲 Tree (`components/tree/`)
A pixel-art tree built entirely from `<div>` elements positioned on a grid.
`tree.js` constructs trunk, branches, leaves (4 swaying groups), lantern, and roots.
`tree.css` defines colors and all animation keyframes.

### 🏮 Lantern (`components/tree/`)
Hangs at the end of the left branch. Has five layers: top cap, body, light glass, bottom cap, and a soft glow halo behind it.

**Off state** — gray body, dark red glass, glow hidden.
**On state** — body turns red, glass turns yellow with a box-shadow bloom, halo pulses, body sways. All triggered by `.scene.playing` in CSS — no JS logic.

### ✨ Stars & Meteors (`components/scene/`)
Stars always twinkle (independent of play/stop).
Meteors are CSS-only: a round `<div>` with a gradient tail via `::after`. They activate only under `.scene.playing` and respect `prefers-reduced-motion`.

### ▶️ Play Button (`components/player/`)
A single button that toggles `.playing` on `.scene`, plays/pauses `music.mp3`, and shows an animated `♪` note icon above itself during playback.

### 📺 Game of Life (`game/`)

Conway's Game of Life opens as a full-screen overlay when you click the pixel TV.

- **32×32 grid**, 12px cells, toroidal (edges wrap around).
- **Draw** cells with mouse or touch drag.
- Controls: **◀ 1 step back** (up to 100 steps), **▶ play/pause**, **1 ▶ step forward**, **↺ reset**, **− / + speed** (1–20 gen/s).
- Export animation to **GIF**.
- Closing the overlay preserves the grid state.

Colors match the night sky palette: pastel green live cells (`#7EC87E`) on dark blue background (`#1a1a2e`).

## Structure

```
index.html
assets/
  music.mp3
components/
  scene/    — background, stars, meteors, ground
  tree/     — pixel tree structure + animations
  player/   — play/stop button
game/
  life.js   — Game of Life logic, rendering, input
  life.css  — controls styling
  game.js   — overlay lifecycle
  game.css  — overlay layout
  router.js — hash-based routing (/#game)
  menu/     — burger menu (pause + home navigation)
```
