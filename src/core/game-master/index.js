import crypto from 'node:crypto';
import logger from '../../utils/logger.js';
import GameRoom from '../game-room/index.js';
import Server from '../server.js';

const SESSION_BYTES_LENGTH = 16;
const DEFAULT_PORT_DIAPOSON = [25565, 27632];

const DEFAULT_SERVER_OPTIONS = {
  host: '0.0.0.0',
  port: DEFAULT_PORT_DIAPOSON[0],
};

export default class GameMaster {
  #gameSessions = new Map();

  #busyPorts = {};

  static gameRoomModule = GameRoom;

  static gameServerFactory = function (options) {
    return new Server(options);
  };

  /**
   * Модуль игровой сессии (комнаты)
   * @static
   * @setter
   * @param {GameRoom} module
   */
  static set newGameRoom(module) {
    GameMaster.gameRoomModule = module;
  }

  /**
   * Фабрика игрового сервера
   * @static
   * @setter
   * @param {Function} factory
   */
  static set serverFactory(factory) {
    GameMaster.gameServerFactory = factory;
  }

  /**
   * Базовый конструктор
   * @class
   * @this GameMaster
   */
  constructor() {

  }

  /**
   * Инициализация модуля игрового мастера
   * @async
   * @public
   * @this GameMaster
   * @returns {Promise<void>}
   */
  async init() {
    // TODO: добавить возможность старта некоторого кол-ва игровых сессий для быстрой инициализации игровых серверов
  }

  /**
   * Остановка игровых комнат
   * @async
   * @public
   * @this GameMaster
   * @returns {Promise<void>}
   */
  async stop() {
    const tasks = [];

    this.#gameSessions.forEach((gameRoom) => {
      tasks.push(gameRoom.stop().catch((err) => {
        const code = err.code ? `code: ${err.code}` : '';
        logger.error(`[${this.constructor.name}] GameRoom an error has occured on stop event. ${code}\n${err.stack}`);
      }));
    });

    await Promise.all(tasks);

    this.#busyPorts = {};
  }

  /**
   * Получение свободного порта
   * @private
   * @this GameMaster
   * @returns {number}
   */
  #getFreePort() {
    for (let port = DEFAULT_PORT_DIAPOSON[0]; port <= DEFAULT_PORT_DIAPOSON[1]; ++port) {
      if (!this.#busyPorts[port]) {
        this.#busyPorts[port] = true;
        return port;
      }
    }

    throw new Error(`[${this.constructor.name}] No available ports!`);
  }

  /**
   * Получение конфига для сервера
   * @private
   * @this GameMaster
   * @returns {object}
   */
  #getServerConfig() {
    return {
      ...DEFAULT_SERVER_OPTIONS,
      port: this.#getFreePort(),
    };
  }

  /**
   * Генерация идентификатора игровой сессии (комнаты)
   * @private
   * @returns {string}
   */
  #generateSessionId() {
    return crypto.randomBytes(SESSION_BYTES_LENGTH).toString('base64');
  }

  /**
   * Создание новой игровой сессии (комнаты)
   * @async
   * @public
   * @this GameMaster
   * @returns {Promise<string>}
   */
  async createGameSession() {
    const sessionId = this.#generateSessionId();

    if (this.#gameSessions.has(sessionId)) {
      throw new Error(`[Game-Master] Game session with sessionId=${sessionId} already exists`);
    }

    // TODO: сейчас это работает в одном потоке и повесить 1 игровой комнатой можно все остальные
    // Нужно как-то разграничить их, например, поднимать несколько тредов в помощь
    const gameServer = GameMaster.gameServerFactory(this.#getServerConfig());
    const gameRoom = new GameMaster.gameRoomModule(gameServer, sessionId);

    this.#gameSessions.set(sessionId, gameRoom);

    await gameRoom.init();

    return sessionId;
  }

  /**
   * Остановка игровой сессии
   * @async
   * @public
   * @param {string} sessionId
   * @this GameMaster
   * @returns {Promise<void>}
   */
  async stopGameSession(sessionId) {

  }
}
