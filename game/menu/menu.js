/*
 * menu.js — бургер-меню и панель "Figure Examples"
 *
 * Экспортирует: initMenu(wrapper, onPause, onResume, onHome)
 */

(function() {

  /* ─── Паттерны для Figure Examples ─── */

  // Клетки задаются как [dr, dc] смещения от центра поля
  var PATTERNS = [
    {
      name:  'Glider',
      // . ■ .
      // . . ■
      // ■ ■ ■
      cells: [[-1,0],[0,1],[1,-1],[1,0],[1,1]],
      desc:  'Moves diagonally across the grid forever. ' +
             'Proposed as the emblem of the hacker community.',
      wiki:  'https://en.wikipedia.org/wiki/' +
             'Glider_(Conway%27s_Game_of_Life)'
    },
    {
      name:  'R-pentomino',
      // . ■ ■
      // ■ ■ .
      // . ■ .
      cells: [[-1,0],[-1,1],[0,-1],[0,0],[1,0]],
      desc:  'Only 5 cells. On an infinite grid it takes ' +
             '1103 generations to stabilize — on a finite ' +
             'grid gliders wrap around and collide sooner.',
      wiki:  'https://en.wikipedia.org/wiki/Pentomino'
    }
  ];

  /* ─── Мини-превью паттерна (canvas 8×8) ─── */

  function buildPreviewCanvas(cells) {
    var PCOLS = 8, PROWS = 8, PCELL = 14;
    var dpr   = window.devicePixelRatio || 1;
    var cv    = document.createElement('canvas');
    cv.width        = PCOLS * PCELL * dpr;
    cv.height       = PROWS * PCELL * dpr;
    cv.style.width  = PCOLS * PCELL + 'px';
    cv.style.height = PROWS * PCELL + 'px';
    cv.style.display        = 'block';
    cv.style.imageRendering = 'pixelated';

    var ctx = cv.getContext('2d');
    var s   = dpr;

    // Фон = цвет линий сетки
    ctx.fillStyle = '#252545';
    ctx.fillRect(0, 0, PCOLS * PCELL * s, PROWS * PCELL * s);

    // Строим set живых клеток
    var alive = {};
    var cr = Math.floor(PROWS / 2) - 1;
    var cc = Math.floor(PCOLS / 2) - 1;
    cells.forEach(function(c) {
      alive[(cr + c[0]) + ',' + (cc + c[1])] = true;
    });

    // Отрисовка клеток
    for (var r = 0; r < PROWS; r++) {
      for (var c = 0; c < PCOLS; c++) {
        ctx.fillStyle = alive[r + ',' + c]
          ? '#7EC87E' : '#1a1a2e';
        ctx.fillRect(
          (c * PCELL + 1) * s, (r * PCELL + 1) * s,
          (PCELL - 2) * s,     (PCELL - 2) * s
        );
      }
    }
    return cv;
  }

  /* ─── Основная функция ─── */

  function initMenu(wrapper, onPause, onResume, onHome) {

    /* 1. Кнопка-бургер */
    var burger = document.createElement('button');
    burger.className = 'game-burger';
    burger.setAttribute('aria-label', 'Menu');
    burger.innerHTML =
      '<span></span><span></span><span></span>';
    wrapper.appendChild(burger);

    /* 2. Фон-затемнение */
    var backdrop = document.createElement('div');
    backdrop.className = 'game-menu-backdrop';

    /* 3. Главная карточка */
    var card = document.createElement('div');
    card.className = 'game-menu-card';

    var title = document.createElement('p');
    title.className   = 'game-menu-title';
    title.textContent = 'MENU';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'game-menu-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.textContent = '×';

    var figuresBtn = document.createElement('button');
    figuresBtn.className   = 'game-menu-btn';
    figuresBtn.textContent = 'Figure Examples';

    var homeBtn = document.createElement('button');
    homeBtn.className   = 'game-menu-btn';
    homeBtn.textContent = 'Main Screen';

    card.appendChild(title);
    card.appendChild(closeBtn);
    card.appendChild(figuresBtn);
    card.appendChild(homeBtn);

    /* 4. Карточка Figure Examples */
    var exCard = document.createElement('div');
    exCard.className    = 'game-menu-card game-examples-card';
    exCard.style.display = 'none';

    // 4a. Шапка с кнопкой «назад»
    var exHeader = document.createElement('div');
    exHeader.className = 'game-examples-header';

    var backBtn = document.createElement('button');
    backBtn.className    = 'game-menu-close game-back-btn';
    backBtn.textContent  = '←';
    backBtn.setAttribute('aria-label', 'Back');

    var exTitle = document.createElement('p');
    exTitle.className   = 'game-menu-title';
    exTitle.textContent = 'FIGURE EXAMPLES';

    exHeader.appendChild(backBtn);
    exHeader.appendChild(exTitle);
    exCard.appendChild(exHeader);

    // 4b. Секции паттернов
    PATTERNS.forEach(function(p) {
      var section = document.createElement('div');
      section.className = 'game-pattern-section';

      var pName = document.createElement('p');
      pName.className   = 'game-pattern-name';
      pName.textContent = p.name;

      var pCanvas = buildPreviewCanvas(p.cells);
      pCanvas.className = 'game-pattern-canvas';

      var pDesc = document.createElement('p');
      pDesc.className   = 'game-pattern-desc';
      pDesc.textContent = p.desc;

      var pLink = document.createElement('a');
      pLink.className   = 'game-pattern-link';
      pLink.href        = p.wiki;
      pLink.target      = '_blank';
      pLink.rel         = 'noopener noreferrer';
      pLink.textContent = 'Wikipedia →';

      var tryBtn = document.createElement('button');
      tryBtn.className   = 'game-menu-btn game-try-btn';
      tryBtn.textContent = 'Try it!';
      tryBtn.addEventListener(
        'click',
        (function(cells) {
          return function() {
            loadPattern(cells);
            backdrop.classList.remove('visible');
            onResume();
          };
        })(p.cells)
      );

      section.appendChild(pName);
      section.appendChild(pCanvas);
      section.appendChild(pDesc);
      section.appendChild(pLink);
      section.appendChild(tryBtn);
      exCard.appendChild(section);
    });

    backdrop.appendChild(card);
    backdrop.appendChild(exCard);
    document.body.appendChild(backdrop);

    /* 5. Открыть / закрыть меню */
    function openMenu() {
      card.style.display    = '';
      exCard.style.display  = 'none';
      backdrop.classList.add('visible');
      onPause();
    }

    function closeMenu() {
      backdrop.classList.remove('visible');
      onResume();
    }

    /* 6. Обработчики */
    burger.addEventListener('click', openMenu);

    closeBtn.addEventListener('click', closeMenu);

    figuresBtn.addEventListener('click', function() {
      card.style.display    = 'none';
      exCard.style.display  = '';
    });

    backBtn.addEventListener('click', function() {
      exCard.style.display = 'none';
      card.style.display   = '';
    });

    homeBtn.addEventListener('click', function() {
      backdrop.classList.remove('visible');
      onHome();
    });

    /* 7. Уничтожить меню */
    function destroyMenu() {
      burger.removeEventListener('click', openMenu);
      closeBtn.removeEventListener('click', closeMenu);
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
      if (burger.parentNode) {
        burger.parentNode.removeChild(burger);
      }
    }

    return { destroyMenu: destroyMenu };
  }

  window.initMenu = initMenu;

})();
