/*
 * game.js — оверлей игры и его жизненный цикл
 *
 * Экспортирует: initGame(playerApi), stopGame()
 *   Вызываются из router.js при навигации /#game.
 *
 * DOM создаётся один раз; при повторном открытии
 *   поле Game of Life сохраняет своё состояние.
 */

(function() {

  var overlay       = null;
  var wrapper       = null;
  var canvas        = null;
  var _resizeHandle = null;

  /* 1. Создать DOM один раз */
  function ensureDOM() {
    if (overlay) return;

    // 1a. Полноэкранный оверлей
    overlay = document.createElement('div');
    overlay.className = 'game-overlay';

    // 1b. Обёртка (масштабируется целиком)
    wrapper = document.createElement('div');
    wrapper.className = 'game-wrapper';

    // 1c. Canvas (размер устанавливает initLife)
    canvas = document.createElement('canvas');
    canvas.className = 'game-canvas';
    wrapper.appendChild(canvas);

    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);

    // 1d. Меню: бургер + кнопка «Главный экран»
    initMenu(
      wrapper,
      function() { pauseLife(); },
      function() {},
      function() { closeGame(); }
    );

    // 1e. Инициализация Game of Life
    initLife(canvas, wrapper);
  }

  /* 2. Масштабирование под viewport
   *   384 = 32 клетки × 12px (ширина сетки)
   *   При align-items:center шапка (top:-68px) симметрично
   *   учитывается: budget = wrapperH + 2 * headerH (68).
   *   desktop: (384+60)  + 2×68 = 580
   *   mobile:  (384+115) + 2×68 = 635
   */
  function updateScale() {
    if (!wrapper) return;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var budget = vw <= 600 ? 635 : 580;
    var scale = Math.min(vw / 384, vh / budget) * 0.9;
    wrapper.style.transform = 'scale(' + scale + ')';
  }

  /* 3. Открыть игру */
  function initGame(playerApi) {
    ensureDOM();

    // 3a. Показываем оверлей через rAF — иначе при первом
    //     клике браузер не успевает применить начальный
    //     opacity:0 и fade-in проигрывается мгновенно
    requestAnimationFrame(function() {
      overlay.classList.add('visible');
    });

    // 3b. Масштабируем и подписываемся на resize
    updateScale();
    _resizeHandle = updateScale;
    window.addEventListener('resize', _resizeHandle);
    window.addEventListener(
      'orientationchange', _resizeHandle
    );
  }

  /* 4. Закрыть игру */
  function stopGame() {
    if (!overlay) return;

    // 4a. Пауза симуляции (поле сохраняется)
    destroyLife();

    // 4b. Сначала fade-out оверлея (0.4s),
    //     затем отъезд камеры — иначе zoom-out пройдёт
    //     под чёрным фоном и его не будет видно.
    overlay.classList.remove('visible');
    setTimeout(zoomOutTV, 400);

    // 4c. Снимаем слушатели resize
    if (_resizeHandle) {
      window.removeEventListener('resize', _resizeHandle);
      window.removeEventListener(
        'orientationchange', _resizeHandle
      );
      _resizeHandle = null;
    }
  }

  window.initGame = initGame;
  window.stopGame = stopGame;

})();
