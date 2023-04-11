import timeout from "./utils/timeout.js";

const API_TIMEOUT = 20000;

export default class BaseApi {
    #params = null;
    #body = null;
    #headers = null;
    #ip = '';

    /**
     * Статическая функция на то, что класс является API-методом
     * 
     * @return {Boolean}
     */
    static isApi() {
        return true;
    }

    /**
     * Сеттер для параметров
     * 
     * @setter
     * @public
     * @param {Object} params
     * @this {BaseApi}
     */
    set params(params) {
        this.#params = params;
    }

    /**
     * Сеттер для тело запроса (POST)
     * 
     * @setter
     * @public
     * @param {Object} body
     * @this {BaseApi}
     */
    set body(body) {
        this.#body = body;
    }

    /**
     * Сеттер для заголовков
     * 
     * @setter
     * @public
     * @param {Object} headers
     * @this {BaseApi}
     */
    set headers(headers) {
        this.#headers = headers;
    }

    /**
     * Сеттер для ip-адреса
     * 
     * @setter
     * @public
     * @param {String} ip
     * @this {BaseApi}
     */
    set ip(ip) {
        this.#ip = ip;
    }

    /**
     * Базовый конструктор класса
     * 
     * @public
     * @constructor
     * @this BaseApi
     */
    constructor() {
        this.#params = null;
        this.#body = null;
        this.#headers = null;
        this.#ip = "";
    }
    
    /**
     * Виртуальное тело метода
     * 
     * @public
     * @virtual
     * @param {Object} [params] - Параметры запроса
     * @param {Object} [body] - Тело запроса
     * @this {BaseApi}
     * @returns {any}
     */
    async process(data, body) {
        throw new Error("Try to call virtual method.");
    }
    
    /**
     * Метод вызова обработки API-метода
     * 
     * @async
     * @public
     * @this {BaseApi}
     * @returns {Promise<Object>}
     */
    async callProcess() {
        return {
            response: await Promise.race([
                timeout(API_TIMEOUT), 
                this.process(this._params || {}, this._body || {}),
            ]),
        };
    }
}