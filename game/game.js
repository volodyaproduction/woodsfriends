/*
 * game.js — главный модуль игры
 *
 * Что делает: создаёт DOM оверлея и canvas,
 *   управляет масштабированием под экран,
 *   запускает/останавливает игровую музыку.
 *
 * Экспортирует: initGame(playerApi), stopGame()
 *   Вызываются из router.js.
 *
 * Шаг 1: только оверлей, пустой canvas и музыка.
 *   Игровой цикл добавляется в шаге 2.
 */

(function() {

  /* ── Состояние модуля ── */
  var overlay       = null;
  var wrapper       = null;
  var canvas        = null;
  var gameAudio     = null;
  var _playerApi    = null;
  var _resizeHandle = null;

  /* 1. Создаём DOM один раз при первом вызове */
  function ensureDOM() {
    if (overlay) return;

    // 1a. Оверлей
    overlay = document.createElement('div');
    overlay.className = 'game-overlay';

    // 1b. Обёртка (масштабируется целиком)
    wrapper = document.createElement('div');
    wrapper.className = 'game-wrapper';

    // 1c. Canvas с учётом Retina
    canvas = document.createElement('canvas');
    canvas.className = 'game-canvas';
    var dpr = window.devicePixelRatio || 1;
    canvas.width  = 360 * dpr;
    canvas.height = 180 * dpr;

    wrapper.appendChild(canvas);
    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);

    // 1d. Загружаем игровую музыку
    try {
      gameAudio = new Audio('assets/game-music.mp3');
      gameAudio.loop = true;
    } catch (e) {
      gameAudio = null;
    }
  }

  /* 2. Масштабирование canvas под viewport */
  function updateScale() {
    if (!wrapper) return;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var scale = Math.min(vw / 360, vh / 180) * 0.9;
    wrapper.style.transform = 'scale(' + scale + ')';
  }

  /* 3. Открыть игру */
  function initGame(playerApi) {
    _playerApi = playerApi;
    ensureDOM();

    // 3a. Показываем оверлей
    overlay.classList.add('visible');

    // 3b. Масштабируем и подписываемся на resize
    updateScale();
    _resizeHandle = updateScale;
    window.addEventListener('resize', _resizeHandle);
    window.addEventListener(
      'orientationchange', _resizeHandle
    );

    // 3c. Запускаем игровую музыку
    if (gameAudio) {
      gameAudio.currentTime = 0;
      gameAudio.play().catch(function() {});
    }
  }

  /* 4. Закрыть игру */
  function stopGame() {
    if (!overlay) return;

    // 4a. Прячем оверлей
    overlay.classList.remove('visible');

    // 4b. Останавливаем игровую музыку
    if (gameAudio) {
      gameAudio.pause();
      gameAudio.currentTime = 0;
    }

    // 4c. Снимаем слушатели resize
    if (_resizeHandle) {
      window.removeEventListener('resize', _resizeHandle);
      window.removeEventListener(
        'orientationchange', _resizeHandle
      );
      _resizeHandle = null;
    }
  }

  /* 5. Экспорт в глобальный скоуп */
  window.initGame = initGame;
  window.stopGame = stopGame;

})();
