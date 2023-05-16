import timeout from '../../utils/timeout.js';

const API_TIMEOUT = 20000;

export default class BaseApi {
  #params = null;

  #body = null;

  #headers = null;

  #ip = '';

  /**
   * Статическая функция на то, что класс является API-методом
   * @returns {boolean}
   */
  static isApi() {
    return true;
  }

  /**
   * Сеттер для параметров
   * @setter
   * @public
   * @param {object} params
   * @this {BaseApi}
   */
  set params(params) {
    this.#params = params;
  }

  /**
   * Сеттер для тело запроса (POST)
   * @setter
   * @public
   * @param {object} body
   * @this {BaseApi}
   */
  set body(body) {
    this.#body = body;
  }

  /**
   * Сеттер для заголовков
   * @setter
   * @public
   * @param {object} headers
   * @this {BaseApi}
   */
  set headers(headers) {
    this.#headers = headers;
  }

  /**
   * Сеттер для ip-адреса
   * @setter
   * @public
   * @param {string} ip
   * @this {BaseApi}
   */
  set ip(ip) {
    this.#ip = ip;
  }

  /**
   * Базовый конструктор класса
   * @public
   * @class
   * @this BaseApi
   */
  constructor() {
    this.#params = null;
    this.#body = null;
    this.#headers = null;
    this.#ip = '';
  }

  /**
   * Виртуальное тело метода
   * @public
   * @abstract
   * @param {object} [params] - Параметры запроса
   * @param data
   * @param {object} [body] - Тело запроса
   * @this {BaseApi}
   * @returns {any}
   */
  async process(data, body) {
    throw new Error('Try to call virtual method.');
  }

  /**
   * Метод вызова обработки API-метода
   * @async
   * @public
   * @this {BaseApi}
   * @returns {Promise<object>}
   */
  async callProcess() {
    return {
      response: await Promise.race([
        timeout(API_TIMEOUT),
        this.process(this.#params || {}, this.#body || {}),
      ]),
    };
  }
}
