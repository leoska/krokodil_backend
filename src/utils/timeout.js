/**
 * Функция обработчик таймаута
 * 
 * @param {Number} ms
 * @param {Boolean} [safe]
 * @returns {Promise<Error>}
 */
export default function timeout(ms, safe = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => safe ? resolve() : reject(new Error("Timeout reached")), ms);
    });
}