/*
 * animate.js — controls tree animations
 *
 * What it does: toggles animations
 *   (leaf sway, lantern flicker)
 *   via CSS class .playing on the .scene element.
 *
 * Called from: player.js on play/stop click.
 * Depends on: tree.css (keyframes and
 *   .scene.playing rules).
 *
 * How it works:
 *   - startAnimation() → .scene gets class
 *     .playing → CSS rules in tree.css enable
 *     animations
 *   - stopAnimation() → class is removed →
 *     transition in tree.css smoothly returns
 *     elements to their initial state
 *
 * Exports:
 *   startAnimation(scene) — start
 *   stopAnimation(scene)  — stop
 */

function startAnimation(scene) {
  scene.classList.add('playing');
}

function stopAnimation(scene) {
  scene.classList.remove('playing');
}
