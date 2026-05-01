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
   *   — контент визуально уезжает вверх.
   *
   *   Проблема B: window.innerHeight на iOS Safari возвращает
   *   «большую» высоту, игнорируя браузерный chrome и баннеры.
   *   Решение — подгонять overlay под window.visualViewport,
   *   чтобы flex-центрирование происходило внутри реально
   *   видимой области.
   *
   *   Текущий подход: измеряем реальные размеры wrapper (canvas + контролы
   *   + padding-top под шапку) и подбираем scale под доступные vw/vh с учётом
   *   padding overlay (safe-area).
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

    // 1. Сбрасываем transform, чтобы корректно измерить layout-габариты
    //    (offsetWidth/offsetHeight не зависят от transform, но так проще
    //    избежать сюрпризов при будущих правках).
    wrapper.style.transform = '';

    // 2. Реальные отступы overlay (safe-area)
    var cs     = getComputedStyle(overlay);
    var padTop = parseFloat(cs.paddingTop)    || 0;
    var padBot = parseFloat(cs.paddingBottom) || 0;

    // 3. Доступная область
    var pad    = isMobile ? 0 : 16;
    var availH = vh - padTop - padBot;
    var availW = vw;

    // 4. Реальные габариты контента (canvas + контролы + padding-top)
    var baseW = wrapper.offsetWidth  || 1;
    var baseH = wrapper.offsetHeight || 1;

    // 5. Масштаб: вписываем в видимую область без клипа
    var scale = Math.min(
      (availW - 2 * pad) / baseW,
      (availH - 2 * pad) / baseH
    );
    scale = Math.max(0.1, scale);

    // 6. Применяем масштаб
    wrapper.style.transform = 'scale(' + scale.toFixed(4) + ')';
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
