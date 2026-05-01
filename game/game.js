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
   *
   *   Проблема: flex центрирует только wrapper, не зная о шапке
   *   (top:-68px) — контент визуально уезжает вверх.
   *
   *   Решение:
   *   1. scale считается так, чтобы весь контент (wrapper + шапка)
   *      влезал в экран с отступом pad.
   *   2. translateY(OVERHANG*scale/2) компенсирует смещение:
   *      центр (wrapper + шапка) совпадает с центром overlay.
   *
   *   Константы из CSS:
   *     canvas = 384px (32×12 и 16×24 дают одинаковый результат)
   *     CTRL_H: desktop — 1 ряд кнопок ≈ 60px; mobile — 2 ряда ≈ 115px
   *     OVERHANG = 68px (top:-68px в life.css и menu.css)
   *
   *   На мобильном overlay имеет padding-top:72px — вычитаем из availH.
   */
  function updateScale() {
    if (!wrapper) return;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var isMobile = vw <= 600;

    // 1. Размеры контента из CSS-констант
    var CTRL_H   = isMobile ? 115 : 60;
    var wrapperH = 384 + CTRL_H;
    var OVERHANG = 68;

    // 2. Масштаб: весь контент (wrapper + шапка) должен влезть
    var pad    = isMobile ? 0 : 16;
    var availH = isMobile ? vh - 72 : vh;
    var scale  = Math.min(
      (vw - 2 * pad) / 384,
      (availH - 2 * pad) / (wrapperH + OVERHANG)
    );

    // 3. Компенсация: flex не знает о шапке и центрирует только wrapper,
    //    сдвигая контент вверх на OVERHANG*scale/2 — исправляем
    var offsetY = (OVERHANG * scale / 2).toFixed(2);
    wrapper.style.transform =
      'translateY(' + offsetY + 'px) scale(' + scale + ')';
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
