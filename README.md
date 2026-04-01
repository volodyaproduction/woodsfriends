# 🌳 Pixel Tree

A pixel-art night scene with an animated tree, lantern, stars, and meteors.
Press **Play** to bring it to life.

```
        *    .  *       .   *
  .  *    ·    *    ·       .
      ░░░░░░░
    ░░░░░░░░░░░
  ░░  ░░░░░  ░░
       █ █ █
       █ █ █         🪔
  ────────────────────────
```

## How it works

Press **▶ Play** → leaves sway, lantern ignites, meteors streak across the sky, music plays.
Press **■ Stop** → everything freezes smoothly back to static.

Animations are driven purely by toggling `.playing` on `.scene` via CSS.

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

## Structure

```
index.html
assets/
  music.mp3
components/
  scene/    — background, stars, meteors, ground
  tree/     — pixel tree structure + animations
  player/   — play/stop button
```
