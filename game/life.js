/*
 * life.js — Conway's Game of Life
 *
 * === Rules ===
 * Each cell has 8 neighbours (including diagonals).
 * Every generation applies these rules simultaneously:
 *   1. A live cell with fewer than 2 live neighbours dies
 *      (underpopulation).
 *   2. A live cell with 2 or 3 live neighbours survives.
 *   3. A live cell with more than 3 live neighbours dies
 *      (overpopulation).
 *   4. A dead cell with exactly 3 live neighbours becomes
 *      alive (reproduction).
 * The grid is toroidal — edges wrap around.
 *
 * === Step algorithm ===
 * Current: Naive Full Scan — every step iterates over all
 * COLS × ROWS cells and recomputes all 8 neighbours.
 * Time complexity: O(n²) per step. Simple and correct.
 *
 * Alternative: Frontier (Active-Cell) approach — track only
 * cells that changed in the last step plus their neighbours.
 * Next step checks only this "frontier" set instead of the
 * whole grid. Efficient on sparse fields (many dead cells).
 *
 * For a 40×40 grid the gain is negligible — Full Scan is
 * the right choice here. Consider switching to Frontier if
 * the grid grows to 200×200 or larger.
 *
 * === Exports ===
 *   initLife(canvas, wrapper) — one-time initialisation
 *   destroyLife()             — pause when overlay closes
 *   pauseLife()               — pause from external modules
 */

(function() {

  // 1. Константы
  var COLS        = 32;
  var ROWS        = 32;
  var CELL        = 12;          // CSS px на клетку
  var COLOR_ALIVE = '#7EC87E';
  var COLOR_DEAD  = '#1a1a2e';
  var COLOR_GRID  = '#252545';
  var MAX_HISTORY  = 1000;
  var SPEEDS       = [1, 2, 5, 10, 20]; // поколений/сек
  var EXPORT_CELL  = 12;  // px на клетку в GIF (256×256 для сетки 32×32)

  // 2. Состояние
  var _canvas   = null;
  var _ctx      = null;
  var _dpr      = 1;
  var _grid     = null;  // Uint8Array(COLS * ROWS)
  var _history  = [];    // массив снимков Uint8Array
  var _running  = false;
  var _timerId  = null;
  var _speedIdx = 3;     // дефолт: 10 gen/s
  var _drawing  = false;
  var _drawVal  = 1;
  var _audio    = null;

  // 3. Ссылки на кнопки UI
  var _btnPlay  = null;
  var _btnBack  = null;
  var _btnGif   = null;
  var _lblSpeed = null;
  var _lblGen   = null;
  var _gen      = 0;

  /* ─── Игровая логика ─── */

  // 4. Вычислить следующее поколение (тороидальная сетка)
  function computeNext(current) {
    var next = new Uint8Array(COLS * ROWS);
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var n = 0;
        for (var dr = -1; dr <= 1; dr++) {
          for (var dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            var nr = (r + dr + ROWS) % ROWS;
            var nc = (c + dc + COLS) % COLS;
            n += current[nr * COLS + nc];
          }
        }
        var alive = current[r * COLS + c];
        next[r * COLS + c] = alive
          ? (n === 2 || n === 3 ? 1 : 0)
          : (n === 3 ? 1 : 0);
      }
    }
    return next;
  }

  // 5. Шаг вперёд
  function step() {
    _history.push(new Uint8Array(_grid));
    if (_history.length > MAX_HISTORY) _history.shift();
    _grid = computeNext(_grid);
    _gen++;
    render();
    updateButtons();
  }

  // 6. Шаг назад
  function stepBack() {
    if (_history.length === 0) return;
    _grid = _history.pop();
    if (_gen > 0) _gen--;
    render();
    updateButtons();
  }

  // 7. Запуск / пауза
  function setRunning(val) {
    _running = val;
    clearInterval(_timerId);
    _timerId = null;
    if (_running) {
      var ms = Math.round(1000 / SPEEDS[_speedIdx]);
      _timerId = setInterval(step, ms);
      // Продолжаем с текущей позиции (currentTime не сбрасываем)
      if (_audio) _audio.play().catch(function() {});
    } else {
      // Пауза сохраняет позицию трека
      if (_audio) _audio.pause();
    }
    updateButtons();
  }

  // 8. Сброс
  function reset() {
    setRunning(false);
    _grid    = new Uint8Array(COLS * ROWS);
    _history = [];
    _gen     = 0;
    render();
    updateButtons();
  }

  // 9. Изменить скорость
  function changeSpeed(delta) {
    _speedIdx = Math.max(
      0, Math.min(SPEEDS.length - 1, _speedIdx + delta)
    );
    _lblSpeed.textContent = SPEEDS[_speedIdx] + ' gen/sec';
    if (_running) {
      clearInterval(_timerId);
      var ms = Math.round(1000 / SPEEDS[_speedIdx]);
      _timerId = setInterval(step, ms);
    }
  }

  /* ─── Рендер ─── */

  // 10. Отрисовка сетки на canvas
  function render() {
    var s   = _dpr;
    var ctx = _ctx;
    var W   = COLS * CELL * s;
    var H   = ROWS * CELL * s;

    // 10a. Фон = цвет линий сетки
    ctx.fillStyle = COLOR_GRID;
    ctx.fillRect(0, 0, W, H);

    // 10b. Клетки с отступом 1px — создаёт эффект сетки
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        ctx.fillStyle = _grid[r * COLS + c]
          ? COLOR_ALIVE : COLOR_DEAD;
        ctx.fillRect(
          (c * CELL + 1) * s,
          (r * CELL + 1) * s,
          (CELL - 2) * s,
          (CELL - 2) * s
        );
      }
    }

  }

  /* ─── Ввод ─── */

  // 11. Вычислить клетку из координат события
  function getCell(e) {
    var rect = _canvas.getBoundingClientRect();
    var cx = e.touches ? e.touches[0].clientX : e.clientX;
    var cy = e.touches ? e.touches[0].clientY : e.clientY;
    var sx = (COLS * CELL) / rect.width;
    var sy = (ROWS * CELL) / rect.height;
    var col = Math.floor((cx - rect.left) * sx / CELL);
    var row = Math.floor((cy - rect.top)  * sy / CELL);
    if (col < 0 || col >= COLS ||
        row < 0 || row >= ROWS) return null;
    return { col: col, row: row };
  }

  // 12. Начало рисования (mousedown / touchstart)
  function onDrawStart(e) {
    e.preventDefault();
    var cell = getCell(e);
    if (!cell) return;
    var idx = cell.row * COLS + cell.col;
    _drawVal   = _grid[idx] ? 0 : 1;
    _grid[idx] = _drawVal;
    _drawing   = true;
    render();
  }

  // 12. Продолжение рисования (mousemove / touchmove)
  function onDrawMove(e) {
    if (!_drawing) return;
    e.preventDefault();
    var cell = getCell(e);
    if (!cell) return;
    var idx = cell.row * COLS + cell.col;
    if (_grid[idx] !== _drawVal) {
      _grid[idx] = _drawVal;
      render();
    }
  }

  function onDrawEnd() { _drawing = false; }

  /* ─── UI ─── */

  // 13. Обновить визуальное состояние кнопок
  function updateButtons() {
    if (!_btnPlay) return;
    _btnPlay.textContent  = _running ? '⏸︎' : '▶︎';
    _btnBack.disabled     = _history.length === 0;
    _lblSpeed.textContent = SPEEDS[_speedIdx] + ' gen/sec';
    _lblGen.textContent   = 'Gen: ' + _gen;
    if (_btnGif) _btnGif.disabled = _gen < 10;
  }

  // 13a. Вспомогательная: обернуть элемент с подписью снизу
  function makeItem(content, labelText) {
    var item = document.createElement('div');
    item.className = 'life-ctrl-item';
    item.appendChild(content);
    var lbl = document.createElement('span');
    lbl.className   = 'life-ctrl-label';
    lbl.textContent = labelText;
    item.appendChild(lbl);
    return item;
  }

  // 14. Создать строку контролов
  function buildControls(wrapper) {
    var bar = document.createElement('div');
    bar.className = 'life-controls';

    // 14a. Шаг назад
    _btnBack = document.createElement('button');
    _btnBack.className   = 'life-btn';
    _btnBack.textContent = '◀ 1';
    _btnBack.addEventListener('click', function() {
      if (_running) setRunning(false);
      stepBack();
    });

    // 14b. Play / Pause
    _btnPlay = document.createElement('button');
    _btnPlay.className   = 'life-btn life-btn--play';
    _btnPlay.textContent = '▶';
    _btnPlay.addEventListener('click', function() {
      setRunning(!_running);
    });

    // 14c. Шаг вперёд
    var btnStep = document.createElement('button');
    btnStep.className   = 'life-btn';
    btnStep.textContent = '1 ▶';
    btnStep.addEventListener('click', function() {
      if (_running) setRunning(false);
      step();
    });

    // 14d. Сброс
    var btnReset = document.createElement('button');
    btnReset.className   = 'life-btn';
    btnReset.textContent = '↺';
    btnReset.addEventListener('click', reset);

    // 14e. Группа скорости
    var speedGroup = document.createElement('div');
    speedGroup.className = 'life-speed';

    var btnSlow = document.createElement('button');
    btnSlow.className   = 'life-btn life-btn--sm';
    btnSlow.textContent = '−';
    btnSlow.addEventListener('click', function() {
      changeSpeed(-1);
    });

    _lblSpeed = document.createElement('span');
    _lblSpeed.className   = 'life-speed-label';
    _lblSpeed.textContent = SPEEDS[_speedIdx] + ' gen/sec';

    var btnFast = document.createElement('button');
    btnFast.className   = 'life-btn life-btn--sm';
    btnFast.textContent = '+';
    btnFast.addEventListener('click', function() {
      changeSpeed(+1);
    });

    speedGroup.appendChild(btnSlow);
    speedGroup.appendChild(_lblSpeed);
    speedGroup.appendChild(btnFast);

    // 14f. Элемент Play со счётчиком поколений вместо подписи
    var playItem = document.createElement('div');
    playItem.className = 'life-ctrl-item';
    playItem.appendChild(_btnPlay);
    _lblGen = document.createElement('span');
    _lblGen.className   = 'life-ctrl-label';
    _lblGen.textContent = 'Gen: 0';
    playItem.appendChild(_lblGen);

    bar.appendChild(makeItem(_btnBack, 'Step Back'));
    bar.appendChild(playItem);
    bar.appendChild(makeItem(btnStep,  'Step Fwd'));

    if (window.innerWidth <= 600) {
      // На мобилке: Reset + Speed во 2-й ряд
      wrapper.appendChild(bar);
      var bar2 = document.createElement('div');
      bar2.className = 'life-controls life-controls--row2';
      bar2.appendChild(makeItem(btnReset,   'Reset'));
      bar2.appendChild(makeItem(speedGroup, 'Speed'));
      wrapper.appendChild(bar2);
    } else {
      // На десктопе: всё в одном ряду
      bar.appendChild(makeItem(btnReset,   'Reset'));
      bar.appendChild(makeItem(speedGroup, 'Speed'));
      wrapper.appendChild(bar);
    }

    updateButtons();
  }

  /* ─── GIF экспорт ─── */

  // 14g. Преобразовать снимок поля в пиксельные индексы палитры
  //   Граница клетки (pr=0 или pc=0) = 0 (сетка),
  //   внутренность = 1 (мёртвая) или 2 (живая).
  function renderFrameToPixels(grid) {
    var EW = COLS * EXPORT_CELL;
    var EH = ROWS * EXPORT_CELL;
    var px = new Uint8Array(EW * EH);  // 0 по умолчанию = сетка

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var color = grid[r * COLS + c] ? 2 : 1;
        var bx    = c * EXPORT_CELL;
        var by    = r * EXPORT_CELL;
        for (var pr = 0; pr < EXPORT_CELL; pr++) {
          for (var pc = 0; pc < EXPORT_CELL; pc++) {
            if (pr !== 0 && pc !== 0) {
              px[(by + pr) * EW + (bx + pc)] = color;
            }
          }
        }
      }
    }
    return px;
  }

  // 14h. Экспортировать анимацию в GIF и скачать
  function exportGIF() {
    // 1. Snapshot состояния (защита от шагов во время генерации)
    var snapHistory = _history.slice();
    var snapGrid    = new Uint8Array(_grid);
    var genNum      = _gen;
    var delayMs     = Math.round(1000 / SPEEDS[_speedIdx]);

    // 2. Блокируем кнопку и показываем прогресс
    _btnGif.disabled    = true;
    _btnGif.textContent = '...';

    // 3. Даём браузеру отрисовать изменение кнопки
    setTimeout(function() {
      var allSnapshots = snapHistory.concat([snapGrid]);
      var EW = COLS * EXPORT_CELL;
      var EH = ROWS * EXPORT_CELL;

      // 4. Рендерим каждый снимок в пиксели
      var frames = allSnapshots.map(renderFrameToPixels);

      // 5. Кодируем GIF и скачиваем
      var gif  = encodeAnimatedGIF(frames, EW, EH, delayMs);
      var blob = new Blob([gif], { type: 'image/gif' });
      var url  = URL.createObjectURL(blob);
      var a    = document.createElement('a');
      a.href     = url;
      a.download = 'life-gen-' + genNum + '.gif';
      a.click();
      URL.revokeObjectURL(url);

      // 6. Восстанавливаем кнопку
      _btnGif.textContent = '⬇︎ GIF';
      _btnGif.disabled    = _gen < 10;
    }, 16);
  }

  /* ─── Публичный API ─── */

  // 15. Инициализация — вызывается один раз из game.js
  function initLife(canvas, wrapper) {
    // Мобильные: 16×16 по умолчанию (CSS-размер canvas не меняется)
    if (window.innerWidth <= 600) {
      COLS = 16; ROWS = 16; CELL = 24;
    }

    _canvas = canvas;
    _dpr    = window.devicePixelRatio || 1;
    var W   = COLS * CELL;
    var H   = ROWS * CELL;

    // 15a. Настройка canvas под физические пиксели
    canvas.width        = W * _dpr;
    canvas.height       = H * _dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    _ctx = canvas.getContext('2d');

    // 15b. Начальное состояние — пустое поле
    _grid    = new Uint8Array(COLS * ROWS);
    _history = [];
    _running = false;

    // 15c. Обработчики рисования
    canvas.addEventListener('mousedown',  onDrawStart);
    canvas.addEventListener('mousemove',  onDrawMove);
    canvas.addEventListener('mouseup',    onDrawEnd);
    canvas.addEventListener('mouseleave', onDrawEnd);
    canvas.addEventListener(
      'touchstart', onDrawStart, { passive: false }
    );
    canvas.addEventListener(
      'touchmove', onDrawMove, { passive: false }
    );
    canvas.addEventListener('touchend', onDrawEnd);

    // 15d. Игровое аудио — создаём один раз, позиция не сбрасывается
    if (!_audio) {
      try {
        _audio = new Audio('assets/game-music.mp3');
        _audio.loop = true;
      } catch(e) {
        _audio = null;
      }
    }

    // 15e. Шапка над полем: название + подсказка
    var header = document.createElement('div');
    header.className = 'life-header';

    var label = document.createElement('div');
    label.className = 'life-title';
    label.textContent = 'GAME: LIFE';

    var subtitle = document.createElement('div');
    subtitle.className = 'life-subtitle';
    subtitle.innerHTML =
      '1. draw cells<br>2. press &#9654;&#65038; to run';

    header.appendChild(label);
    header.appendChild(subtitle);
    wrapper.appendChild(header);

    // 15f. Угловые кнопки: GIF + размер сетки
    var corner = document.createElement('div');
    corner.className = 'life-corner';

    _btnGif = document.createElement('button');
    _btnGif.className   = 'life-gif-btn';
    _btnGif.textContent = '⬇︎ GIF';
    _btnGif.disabled    = true;
    _btnGif.addEventListener('click', exportGIF);
    corner.appendChild(_btnGif);

    var sizeBtn = document.createElement('button');
    sizeBtn.className = 'life-size-btn';
    sizeBtn.setAttribute('aria-label', 'Toggle grid size');
    sizeBtn.textContent = COLS + '\xD7' + ROWS;
    sizeBtn.addEventListener('click', function() {
      var newSize = COLS === 32 ? 16 : 32;
      resizeGrid(newSize);
      sizeBtn.textContent = COLS + '\xD7' + ROWS;
    });
    corner.appendChild(sizeBtn);

    wrapper.appendChild(corner);

    // 15g. Контролы и начальный рендер
    buildControls(wrapper);
    render();
  }

  // 16. Пауза симуляции (состояние поля сохраняется)
  function destroyLife() {
    setRunning(false);
  }

  // 17. Загрузить паттерн по центру поля
  //   cells — массив [dr, dc] смещений от центра сетки
  function loadPattern(cells) {
    setRunning(false);
    _grid    = new Uint8Array(COLS * ROWS);
    _history = [];
    _gen     = 0;
    var cr = Math.floor(ROWS / 2);
    var cc = Math.floor(COLS / 2);
    cells.forEach(function(c) {
      var r = cr + c[0];
      var col = cc + c[1];
      if (r >= 0 && r < ROWS && col >= 0 && col < COLS) {
        _grid[r * COLS + col] = 1;
      }
    });
    render();
    updateButtons();
  }

  // 18. Изменить размер сетки (CSS-размер canvas сохраняется)
  function resizeGrid(newSize) {
    // 1. Стоп и новые параметры
    setRunning(false);
    COLS = newSize;
    ROWS = newSize;
    CELL = newSize === 16 ? 24 : 12;

    // 2. Пересчитать canvas
    var W = COLS * CELL;
    var H = ROWS * CELL;
    _canvas.width        = W * _dpr;
    _canvas.height       = H * _dpr;
    _canvas.style.width  = W + 'px';
    _canvas.style.height = H + 'px';

    // 3. Сброс состояния
    _grid    = new Uint8Array(COLS * ROWS);
    _history = [];
    _gen     = 0;
    render();
    updateButtons();
  }

  window.initLife    = initLife;
  window.destroyLife = destroyLife;
  window.loadPattern = loadPattern;
  window.resizeGrid  = resizeGrid;
  window.pauseLife   = function() { setRunning(false); };

})();
