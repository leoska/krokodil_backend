import { EventEmitter } from 'node:events';
import logger from '../utils/logger.js';

export default class Client extends EventEmitter {
  #socket = null;

  #server = null;

  #id = 0;

  /**
   * Базовый конструктор клиента
   * @class
   * @param {number} id
   * @param {(net.Socket|EventEmitter|*)} socket
   * @param {Server} server
   */
  constructor(id = 0, socket = null, server = null) {
    super();

    this.#id = id;
    this.#socket = socket;
    this.#server = server;

    socket.on('data', (...args) => this.data(...args));
    socket.on('error', (...args) => this.error(...args));
    socket.once('close', (...args) => this.close(...args));
  }

  /**
   * Геттер на id
   * @getter
   * @this Client
   * @returns {number}
   */
  get id() {
    return this.#id;
  }

  /**
   * Отправка данных клиенту по сокету
   * @public
   * @param {(Buffer | string)} data
   * @this Client
   * @returns {void}
   */
  send(data) {
    this.#socket.send(data);
  }

  /**
   * Получили данные от клиента
   * @public
   * @param {...any} args
   * @param {(Buffer | string | ArrayBuffer | *)} data
   * @this Client
   * @returns {void}
   */
  data(...args) {
    this.#server.emit('clientData', this, ...args);
  }

  /**
   * Функция вызываемая при ошибке
   * @public
   * @param {*} err
   * @returns {void}
   */
  static error(err) {
    const code = err.code ? `code: ${err.code}` : '';
    logger.error(`Client an error has occured. ${code}\n${err.stack}`);
    throw err;
  }

  /**
   * Метод вызываемый при закрытии сокета
   * @public
   * @param {...} args
   * @returns {void}
   */
  close(...args) {
    this.#server.emit('disconnectClient', this.#id);

    try {
      if (typeof this.#socket.close === 'function') {
        this.#socket.close(...args);
      }
    } catch (e) {
      const code = e.code ? `code: ${e.code}` : '';
      logger.error(`Client an error has occured on close connection. ${code}\n${e.stack}`);
    } finally {
      this.removeAllListeners();
    }
  }
}
