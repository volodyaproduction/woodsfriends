/*
 * tv-zoom.js — zoom-эффект «камера наезжает на ТВ»
 *
 * Что делает: оборачивает .scene в .scene-zoom-wrap и даёт
 *   две функции для управления масштабом обёртки.
 *
 * Вызывается из:
 *   - index.html (DOMContentLoaded): wrapScene(scene) — один раз
 *   - components/tv/tv.js: zoomInTV()  — по клику на ТВ
 *   - game/game.js:        zoomOutTV() — при закрытии игры
 *
 * Координаты центра ТВ и величина scale захардкожены —
 *   модуль ТВ-специфичен. Когда понадобится zoom для других
 *   объектов, обобщаем в components/zoom/ с параметрами.
 */

(function() {

  // 1. Ссылка на zoom-обёртку, выставляется в wrapScene
  var _wrap = null;

  /* 2. Обернуть сцену в две обёртки:
   *      .scene-resize-wrap   — внешняя, resize-scale под viewport
   *      .scene-zoom-wrap     — внутренняя, zoom-эффект ТВ
   *    Разделение нужно, чтобы transition zoom-обёртки не «ловил»
   *    изменения --scene-scale при resize окна.
   */
  function wrapScene(scene) {
    var resizeWrap = document.createElement('div');
    resizeWrap.className = 'scene-resize-wrap';

    _wrap = document.createElement('div');
    _wrap.className = 'scene-zoom-wrap';

    scene.parentNode.insertBefore(resizeWrap, scene);
    resizeWrap.appendChild(_wrap);
    _wrap.appendChild(scene);
  }

  /* 3. Включить zoom — наезд камеры на ТВ.
   *    Снимаем флаг zoom-out на случай быстрого
   *    re-open до завершения предыдущего отъезда.
   */
  function zoomInTV() {
    if (!_wrap) return;
    if (_wrap.classList.contains('zoom-tv')) return;
    _wrap.classList.remove('zoom-out');
    _wrap.classList.add('zoom-tv');
  }

  /* 4. Выключить zoom — отъезд камеры.
   *    Снимаем zoom-tv (animation forwards перестаёт держать
   *    scale 5), сразу запускаем animation tvZoomOut через
   *    класс zoom-out. По окончании 0.6s снимаем и его —
   *    обёртка возвращается в полностью «чистое» состояние.
   */
  function zoomOutTV() {
    if (!_wrap) return;
    if (!_wrap.classList.contains('zoom-tv')) return;
    _wrap.classList.remove('zoom-tv');
    _wrap.classList.add('zoom-out');
    setTimeout(function() {
      if (_wrap) _wrap.classList.remove('zoom-out');
    }, 600);
  }

  // 5. Экспорт в глобальную область (как остальные модули)
  window.wrapScene = wrapScene;
  window.zoomInTV  = zoomInTV;
  window.zoomOutTV = zoomOutTV;

})();
