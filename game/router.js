/*
 * router.js — hash-роутинг для игры
 *
 * Управляет переходами /#game ↔ /.
 * Экспортирует: openGame(), closeGame(), initRouter(playerApi)
 *
 * Два сценария открытия игры:
 *   а) клик по ТВ → openGame() → меняем хэш → hashchange → _showGame
 *   б) обновление страницы на /#game → initRouter находит хэш → _showGame
 *
 * Сценарий б) раньше ломался из-за history.pushState, который
 * в некоторых браузерах тригерит hashchange и мешает инициализации.
 * Теперь история не манипулируется — просто проверяем хэш при старте.
 */

// 1. Сохраняем playerApi на уровне модуля —
//    нужен в openGame() когда hashchange не срабатывает
var _playerApi = null;

/* 2. Показать игру */
function _showGame() {
  document.title = 'Woods Friends: Game';
  if (_playerApi) _playerApi.pauseMusic();
  initGame(_playerApi);
}

/* 3. Скрыть игру */
function _hideGame() {
  document.title = 'Woods Friends';
  stopGame();
  if (_playerApi) _playerApi.resumeMusic();
}

/* 4. Открыть игру (вызывается из tv.js) */
function openGame() {
  if (location.hash === '#game') {
    // Хэш уже стоит — hashchange не сработает, вызываем напрямую
    _showGame();
  } else {
    location.hash = 'game';
  }
}

/* 5. Закрыть игру (вызывается из menu.js) */
function closeGame() {
  location.hash = '';
}

/* 6. Инициализация */
function initRouter(playerApi) {
  _playerApi = playerApi;

  // 6a. Слушаем смену хэша
  window.addEventListener('hashchange', function() {
    if (location.hash === '#game') {
      _showGame();
    } else {
      _hideGame();
    }
  });

  // 6b. Прямой заход / обновление страницы на /#game
  if (location.hash === '#game') {
    _showGame();
  }
}
