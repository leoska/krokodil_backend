/* eslint-disable */
import ErrorApiMethod from '../core/http/errorApiMethod.js';

/**
 * Декоратор для определения правильного API метода
 * @param {string} name - имя метода
 * @returns {(function(*, *, *): void)|*} - возвращает класс, обернутый в декоратор
 */
export default function method(name) {
  return function (target) {
    return class Api extends target {
      constructor(method) {
        // Обработка Method Not Allowed (405)
        if (method !== name) {
          throw new ErrorApiMethod(
            `Incorrect HTTP-method! Api-method [${target.name}] has a [${name}] method. Try to call another [${method}] method.`,
            'Method Not Allowed',
            405,
          );
        }
        super();
      }

      // Переопределяем имя класса
      static get name() {
        return super.name;
      }
    };
  };
}
