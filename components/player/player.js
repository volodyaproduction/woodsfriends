/*
 * player.js — компонент плеера (кнопка play/stop)
 *
 * Что делает: создаёт кнопку play/stop внутри
 *   сцены. При нажатии запускает/останавливает
 *   анимации дерева и музыку.
 *
 * Вызывается: из index.html после загрузки DOM.
 * Зависит от:
 *   - animate.js (функции startAnimation,
 *     stopAnimation — должен быть подключён
 *     раньше в index.html)
 *   - player.css (стили кнопки .player-btn)
 *   - assets/music.mp3 (опционально, если нет
 *     файла — работает без музыки)
 *
 * Экспортирует: функцию initPlayer(scene)
 *   scene — DOM-элемент <div id="scene">
 */

function initPlayer(scene) {

  // 1. Состояние плеера
  var isPlaying = false;
  var audio = null;

  // 2. Загрузка музыки (не обязательна)
  try {
    audio = new Audio('assets/music.mp3');
    audio.loop = true;
  } catch (e) {
    console.log('Музыка не загружена');
  }

  // 3. Создаём обёртку, кнопку и нотку
  var wrap = document.createElement('div');
  wrap.className = 'player-wrap';

  var note = document.createElement('span');
  note.className = 'player-note';
  note.textContent = '♪';

  var btn = document.createElement('button');
  btn.className = 'player-btn';
  btn.innerHTML = '&#9654; Play';
  btn.setAttribute('aria-label', 'Play/Stop');

  wrap.appendChild(note);
  wrap.appendChild(btn);
  scene.appendChild(wrap);

  // 4. Обработчик нажатия
  btn.addEventListener('click', function() {
    isPlaying = !isPlaying;

    if (isPlaying) {
      // 4a. Включаем
      startAnimation(scene);
      btn.innerHTML = '&#9632; Stop';
      btn.classList.add('active');
      note.classList.add('visible');
      if (audio) {
        audio.play().catch(function() {});
      }
    } else {
      // 4b. Выключаем
      stopAnimation(scene);
      btn.innerHTML = '&#9654; Play';
      btn.classList.remove('active');
      note.classList.remove('visible');
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  });
}
