import BaseApi from '../baseApi.js';

export default class Ping extends BaseApi {
  /**
   * Базовый конструктор класса
   * @class
   * @this Ping
   */
  constructor() {
    super();
  }

  /**
   * Дебаговый API-метод для проверки работы сервера
   * @override
   * @this Ping
   * @returns {Promise<boolean>}
   */
  async process() {
    return true;
  }
}
