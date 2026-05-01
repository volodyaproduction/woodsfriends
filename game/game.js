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
  var _vvHandle     = null;

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
   *   Проблема A: flex центрирует только wrapper, не зная о шапке
   *   (top:-68px) — контент визуально уезжает вверх.
   *
   *   Проблема B: window.innerHeight на iOS Safari возвращает
   *   «большую» высоту, игнорируя браузерный chrome и баннеры.
   *   Решение — подгонять overlay под window.visualViewport,
   *   чтобы flex-центрирование происходило внутри реально
   *   видимой области.
   *
   *   Константы из CSS:
   *     canvas = 384px (32×12 и 16×24 дают одинаковый результат)
   *     CTRL_H: desktop — 1 ряд кнопок ≈ 60px; mobile — 2 ряда ≈ 115px
   *     OVERHANG = 68px (top:-68px в life.css и menu.css)
   *
   *   На мобильном overlay имеет padding-top:72px — вычитаем из availH.
   */

  /* 2a. Подгоняем overlay под реально видимую область */
  function applyViewport() {
    var vv  = window.visualViewport;
    var w   = vv ? vv.width      : window.innerWidth;
    var h   = vv ? vv.height     : window.innerHeight;
    var top = vv ? vv.offsetTop  : 0;
    var lft = vv ? vv.offsetLeft : 0;

    // position: fixed + inset:0 — сбрасываем right/bottom,
    // чтобы они не конфликтовали с явными width/height
    overlay.style.top    = top + 'px';
    overlay.style.left   = lft + 'px';
    overlay.style.width  = w   + 'px';
    overlay.style.height = h   + 'px';
    overlay.style.right  = 'auto';
    overlay.style.bottom = 'auto';

    updateScale(w, h);
  }

  /* 2b. Масштаб wrapper'а внутри overlay */
  function updateScale(vw, vh) {
    if (!wrapper) return;
    vw = vw || window.innerWidth;
    vh = vh || window.innerHeight;
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
    applyViewport();
    _resizeHandle = applyViewport;
    window.addEventListener('resize', _resizeHandle);
    window.addEventListener(
      'orientationchange', _resizeHandle
    );

    // 3c. visualViewport: точный размер видимой области на iOS
    var vv = window.visualViewport;
    if (vv) {
      _vvHandle = function() {
        requestAnimationFrame(applyViewport);
      };
      vv.addEventListener('resize', _vvHandle);
      vv.addEventListener('scroll', _vvHandle);
    }
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

    // 4d. Снимаем слушатели visualViewport и сбрасываем стили
    var vv = window.visualViewport;
    if (vv && _vvHandle) {
      vv.removeEventListener('resize', _vvHandle);
      vv.removeEventListener('scroll', _vvHandle);
      _vvHandle = null;
    }
    overlay.style.top    = '';
    overlay.style.left   = '';
    overlay.style.width  = '';
    overlay.style.height = '';
    overlay.style.right  = '';
    overlay.style.bottom = '';
  }

  window.initGame = initGame;
  window.stopGame = stopGame;

})();
