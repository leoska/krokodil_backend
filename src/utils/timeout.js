/**
 * Функция обработчик таймаута
 * @param {number} ms - Время в милисекундах
 * @param {boolean} [safe] - Безопасный таймаут (без ошибки)
 * @returns {Promise<Error>} - Возвращает промис, возможно с результатом ошибки в зависимости от параметра [safe]
 */
export default function timeout(ms, safe = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (safe ? resolve() : reject(new Error('Timeout reached'))), ms);
  });
}
