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

    var aboutBtn = document.createElement('button');
    aboutBtn.className   = 'game-menu-btn';
    aboutBtn.textContent = 'About';

    var homeBtn = document.createElement('button');
    homeBtn.className   = 'game-menu-btn';
    homeBtn.textContent = 'Main Screen';

    card.appendChild(title);
    card.appendChild(closeBtn);
    card.appendChild(figuresBtn);
    card.appendChild(aboutBtn);
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

    var exCloseBtn = document.createElement('button');
    exCloseBtn.className = 'game-menu-close game-ex-close-btn';
    exCloseBtn.textContent = '×';
    exCloseBtn.setAttribute('aria-label', 'Close menu');

    exHeader.appendChild(backBtn);
    exHeader.appendChild(exTitle);
    exHeader.appendChild(exCloseBtn);
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

    /* 5. Карточка About */
    var aboutCard = document.createElement('div');
    aboutCard.className    = 'game-menu-card game-examples-card';
    aboutCard.style.display = 'none';

    // 5a. Шапка
    var aboutHeader = document.createElement('div');
    aboutHeader.className = 'game-examples-header';

    var aboutBackBtn = document.createElement('button');
    aboutBackBtn.className = 'game-menu-close game-back-btn';
    aboutBackBtn.textContent = '←';
    aboutBackBtn.setAttribute('aria-label', 'Back');

    var aboutTitle = document.createElement('p');
    aboutTitle.className   = 'game-menu-title';
    aboutTitle.textContent = 'ABOUT';

    var aboutCloseBtn = document.createElement('button');
    aboutCloseBtn.className = 'game-menu-close game-ex-close-btn';
    aboutCloseBtn.textContent = '×';
    aboutCloseBtn.setAttribute('aria-label', 'Close menu');

    aboutHeader.appendChild(aboutBackBtn);
    aboutHeader.appendChild(aboutTitle);
    aboutHeader.appendChild(aboutCloseBtn);
    aboutCard.appendChild(aboutHeader);

    // 5b. Секция: название и автор
    var secIntro = document.createElement('div');
    secIntro.className = 'game-pattern-section';

    var introName = document.createElement('p');
    introName.className   = 'game-pattern-name';
    introName.textContent = "Conway's Game of Life";

    var introDesc = document.createElement('p');
    introDesc.className   = 'game-pattern-desc';
    introDesc.textContent =
      'A zero-player game devised by mathematician ' +
      'John Horton Conway in 1970. The evolution is ' +
      'determined entirely by the initial state — ' +
      'no further input is needed.';

    var introLink = document.createElement('a');
    introLink.className   = 'game-pattern-link';
    introLink.href        =
      'https://en.wikipedia.org/wiki/' +
      'Conway%27s_Game_of_Life';
    introLink.target      = '_blank';
    introLink.rel         = 'noopener noreferrer';
    introLink.textContent = 'Wikipedia →';

    secIntro.appendChild(introName);
    secIntro.appendChild(introDesc);
    secIntro.appendChild(introLink);
    aboutCard.appendChild(secIntro);

    // 5c. Секция: начальное состояние
    var secState = document.createElement('div');
    secState.className = 'game-pattern-section';

    var stateName = document.createElement('p');
    stateName.className   = 'game-pattern-name';
    stateName.textContent = 'Initial State';

    var stateDesc = document.createElement('p');
    stateDesc.className   = 'game-pattern-desc';
    stateDesc.textContent =
      'You draw the starting pattern on the grid. ' +
      'This is the initial state from which the ' +
      'simulation evolves autonomously.';

    secState.appendChild(stateName);
    secState.appendChild(stateDesc);
    aboutCard.appendChild(secState);

    // 5d. Секция: поколение
    var secGen = document.createElement('div');
    secGen.className = 'game-pattern-section';

    var genName = document.createElement('p');
    genName.className   = 'game-pattern-name';
    genName.textContent = 'Generation';

    var genDesc = document.createElement('p');
    genDesc.className   = 'game-pattern-desc';
    genDesc.textContent =
      'Each step of the simulation is called a ' +
      'generation. All cells update simultaneously ' +
      'based on the rules below.';

    secGen.appendChild(genName);
    secGen.appendChild(genDesc);
    aboutCard.appendChild(secGen);

    // 5e. Секция: правила
    var secRules = document.createElement('div');
    secRules.className = 'game-pattern-section';

    var rulesName = document.createElement('p');
    rulesName.className   = 'game-pattern-name';
    rulesName.textContent = 'Rules';

    var RULES = [
      'A live cell with fewer than 2 neighbours dies' +
        ' — underpopulation.',
      'A live cell with 2 or 3 neighbours survives.',
      'A live cell with more than 3 neighbours dies' +
        ' — overpopulation.',
      'A dead cell with exactly 3 neighbours' +
        ' becomes alive — reproduction.'
    ];

    secRules.appendChild(rulesName);
    RULES.forEach(function(text) {
      var p = document.createElement('p');
      p.className   = 'game-about-rule';
      p.textContent = '• ' + text;
      secRules.appendChild(p);
    });
    aboutCard.appendChild(secRules);

    backdrop.appendChild(card);
    backdrop.appendChild(exCard);
    backdrop.appendChild(aboutCard);
    document.body.appendChild(backdrop);

    /* 6. Открыть / закрыть меню */
    function openMenu() {
      card.style.display      = '';
      exCard.style.display    = 'none';
      aboutCard.style.display = 'none';
      backdrop.classList.add('visible');
      onPause();
    }

    function closeMenu() {
      backdrop.classList.remove('visible');
      onResume();
    }

    /* 7. Обработчики */
    burger.addEventListener('click', openMenu);

    closeBtn.addEventListener('click', closeMenu);

    figuresBtn.addEventListener('click', function() {
      card.style.display      = 'none';
      exCard.style.display    = '';
      aboutCard.style.display = 'none';
    });

    backBtn.addEventListener('click', function() {
      exCard.style.display = 'none';
      card.style.display   = '';
    });

    exCloseBtn.addEventListener('click', closeMenu);

    aboutBtn.addEventListener('click', function() {
      card.style.display      = 'none';
      exCard.style.display    = 'none';
      aboutCard.style.display = '';
    });

    aboutBackBtn.addEventListener('click', function() {
      aboutCard.style.display = 'none';
      card.style.display      = '';
    });

    aboutCloseBtn.addEventListener('click', closeMenu);

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
