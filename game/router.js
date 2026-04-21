/*
 * router.js — hash-роутинг для игры
 *
 * Что делает: слушает hashchange, открывает/закрывает
 *   игру при переходах /#game ↔ /.
 *   При прямом заходе на /#game выстраивает
 *   корректный стек истории браузера.
 *
 * Экспортирует: openGame(playerApi), closeGame()
 *   (вызываются из tv.js и menu.js)
 */

/* 1. Показать игру (без изменения URL) */
function _showGame(playerApi) {
  document.title = 'Woods Friends: Game';
  if (playerApi) playerApi.pauseMusic();
  initGame(playerApi);
}

/* 2. Скрыть игру (без изменения URL) */
function _hideGame(playerApi) {
  document.title = 'Woods Friends';
  stopGame();
  if (playerApi) playerApi.resumeMusic();
}

/* 3. Открыть игру — меняет URL → hashchange → _showGame */
function openGame(playerApi) {
  location.hash = 'game';
}

/* 4. Закрыть игру — меняет URL → hashchange → _hideGame */
function closeGame() {
  location.hash = '';
}

/* 5. Инициализация роутера */
function initRouter(playerApi) {
  // 5a. Слушаем hashchange
  window.addEventListener('hashchange', function() {
    if (location.hash === '#game') {
      _showGame(playerApi);
    } else {
      _hideGame(playerApi);
    }
  });

  // 5b. Прямой заход на /#game — выстраиваем стек истории
  if (location.hash === '#game') {
    history.replaceState(null, '', '/');
    history.pushState(null, '', '/#game');
    _showGame(playerApi);
  }
}
