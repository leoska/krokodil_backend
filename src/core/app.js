import logger from '../utils/logger.js';
import config from '../config/index.js';

const instance = Symbol('_instance');

class Application {
  #modules = new Map(); // Инициализированные экземпляры модулей

  #appAlreadyStopping = false;

  /**
   * Базовый конструктор
   * @class
   */
  constructor() {
    logger.info(`Application created with [${config.NODE_ENV}] env`);
  }

  /**
   * Статический геттер на экземпляр приложения
   * @static
   * @getter
   * @returns {Application} - Возвращает экземпляр синглтона приложения
   */
  static get Instance() {
    if (!this[instance]) {
      this[instance] = new this();
    }

    return this[instance];
  }

  /**
   * Старт всего приложения с инициализацией модулей
   * @async
   * @public
   * @this Application
   * @param {Array<object>} modules
   * @returns {Promise<void>}
   */
  async init(modules) {
    for (const Module of modules) {
      logger.info(`Start initialize module [${Module.name}]`);

      const instanceOfModule = new Module();
      this.#modules.set(Module.name.toLowerCase(), instanceOfModule);

      Object.defineProperty(this, Module.name.toLowerCase(), {
        value: instanceOfModule,
        writable: false,
        configurable: false,
        enumerable: false,
      });

      await instanceOfModule.init();

      logger.info(`Module [${Module.name}] successfully initialized`);
    }
  }

  /**
   * Остановка приложения
   * @async
   * @public
   * @this Application
   * @returns {Promise<void>}
   */
  async stop() {
    if (this.#appAlreadyStopping) return;

    this.#appAlreadyStopping = true;
    logger.warn('Received SIGINT signal! Application try to stop.');

    this.#modules.forEach(async (module, name) => {
      try {
        await module.stop();

        logger.info(`Module [${name}] successfully stopped.`);
      } catch (e) {
        logger.error(`Module [${name}] can't stop correct: ${e.stack}`);
      }
    });

    this.#modules.clear();
  }
}

const app = Application.Instance;
export default app;
