/*
 * animate.js — управление анимациями дерева
 *
 * Что делает: включает/выключает анимации
 *   (покачивание листьев, мерцание фонаря)
 *   через CSS-класс .playing на элементе .scene.
 *
 * Вызывается: из player.js при нажатии play/stop.
 * Зависит от: tree.css (keyframes и правила
 *   .scene.playing ...).
 *
 * Как работает:
 *   - startAnimation() → .scene получает класс
 *     .playing → CSS-правила в tree.css включают
 *     анимации
 *   - stopAnimation() → класс убирается →
 *     transition в tree.css плавно возвращает
 *     элементы в исходное положение
 *
 * Экспортирует:
 *   startAnimation(scene) — запуск
 *   stopAnimation(scene)  — остановка
 */

function startAnimation(scene) {
  scene.classList.add('playing');
}

function stopAnimation(scene) {
  scene.classList.remove('playing');
}
