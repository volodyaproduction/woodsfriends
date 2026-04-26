/*
 * player.js — player component (play/stop button)
 *
 * What it does: creates a play/stop button inside
 *   the scene. On click starts/stops tree
 *   animations and music.
 *
 * Called from: index.html after DOM is loaded.
 * Depends on:
 *   - animate.js (startAnimation, stopAnimation —
 *     must be included before in index.html)
 *   - player.css (styles for .player-btn)
 *   - assets/main.mp3 (optional — works without it)
 *
 * Exports: initPlayer(scene)
 *   scene — DOM element <div id="scene">
 */

function initPlayer(scene) {

  // 1. Player state
  var isPlaying = false;
  var audio = null;

  // 2. Load audio (optional)
  try {
    audio = new Audio('assets/main.mp3');
    audio.loop = true;
  } catch (e) {
    console.log('Audio not loaded');
  }

  // 3. Create wrapper, button, and note icon
  var wrap = document.createElement('div');
  wrap.className = 'player-wrap';

  var note = document.createElement('span');
  note.className = 'player-note';
  note.textContent = '♪';

  var btn = document.createElement('button');
  btn.className = 'player-btn';
  btn.innerHTML = '&#9654;&#xFE0E; Play';
  btn.setAttribute('aria-label', 'Play/Stop');

  wrap.appendChild(note);
  wrap.appendChild(btn);
  scene.appendChild(wrap);

  // 4. Click handler
  btn.addEventListener('click', function() {
    isPlaying = !isPlaying;

    if (isPlaying) {
      // 4a. Start
      startAnimation(scene);
      btn.innerHTML = '&#9632;&#xFE0E; Stop';
      btn.classList.add('active');
      note.classList.add('visible');
      if (audio) {
        audio.play().catch(function() {});
      }
    } else {
      // 4b. Stop
      stopAnimation(scene);
      btn.innerHTML = '&#9654;&#xFE0E; Play';
      btn.classList.remove('active');
      note.classList.remove('visible');
      if (audio) {
        audio.pause();
      }
    }
  });

  // 5. Public API для внешних модулей (игра)
  return {
    pauseMusic: function() {
      if (audio) audio.pause();
    },
    resumeMusic: function() {
      if (isPlaying && audio) {
        audio.play().catch(function() {});
      }
    },
  };
}
