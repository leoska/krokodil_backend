export default class ErrorApiMethod extends Error {
  /**
   * Базовый конструктор
   * @param {string} message
   * @param {string} code
   * @param {number} status
   * @param {boolean} stack
   */
  constructor(message, code, status, stack = false) {
    super('');
    this.code = code;
    this.status = status;
    this.message = message;

    if (stack) Error.captureStackTrace(this, this.constructor);
    else this.stack = null;
  }
}
