/*
 * tv.js — пиксельный ЭЛТ-телевизор на сцене
 *
 * Что делает: рисует ТВ справа от дерева.
 *   По клику вызывает openGame() из router.js.
 *
 * Вызывается из: index.html после DOMContentLoaded.
 * Зависит от: tv.css, tree.css (.px), game/router.js
 *
 * Экспортирует: buildTV(scene, playerApi)
 *   scene     — DOM-элемент <div id="scene">
 *   playerApi — { pauseMusic, resumeMusic }
 */

function buildTV(scene, playerApi) {

  // 1. Вспомогательная функция создания пикселя
  function px(left, top, cls, parent) {
    var el = document.createElement('div');
    el.className = 'px ' + cls;
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    (parent || tv).appendChild(el);
  }

  // 2. Группа-контейнер
  var tv = document.createElement('div');
  tv.className = 'tv-group';

  // 3. Антенны (2 штуки, расходятся вверх)
  //    Левая антенна
  px(12, -32, 'tv-ant');
  px(8,  -48, 'tv-ant');
  //    Правая антенна
  px(36, -32, 'tv-ant');
  px(40, -48, 'tv-ant');

  // 4. Корпус ТВ (5 строк × 4 пикселя = 64×80px)
  var bodyRows = [0, 16, 32, 48, 64];
  bodyRows.forEach(function(y) {
    px(0,  y, 'tv-body');
    px(16, y, 'tv-body');
    px(32, y, 'tv-body');
    px(48, y, 'tv-body-d');
  });

  // 5. Экран (3×3 пикселя внутри корпуса, отступ 1px)
  var screenRows = [0, 16, 32];
  screenRows.forEach(function(y) {
    px(4,  y + 4, 'tv-screen');
    px(20, y + 4, 'tv-screen');
    px(36, y + 4, 'tv-screen');
  });

  // 6. Текст «GAME» на экране
  var label = document.createElement('div');
  label.className = 'tv-label';
  label.innerHTML = 'GAME<br>LIFE';
  tv.appendChild(label);

  // 7. Ножки (2 пикселя)
  px(8,  80, 'tv-foot');
  px(40, 80, 'tv-foot');

  // 8. Клик — открываем игру
  tv.addEventListener('click', function() {
    openGame();
  });

  scene.appendChild(tv);
}
