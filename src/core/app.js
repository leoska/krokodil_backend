import logger from "../utils/logger.js";
import config from "../config/index.js";

const _instance = Symbol("_instance");

class Application {
    #modules = new Map(); // Инициализированные экземпляры модулей
    #appAlreadyStopping = false;

    constructor() {
        logger.info(`Application created with [${config.NODE_ENV}] env`);
    }

    /**
     * Статический геттер на экземпляр приложения
     * 
     * @static
     * @getter
     * @returns {Application}
     */
    static get Instance() {
        return this[_instance] || (this[_instance] = new this());
    }

    /**
     * Старт всего приложения с инициализацией модулей
     * 
     * @async
     * @public
     * @this Application
     * @param {Array<Object>} modules 
     * @returns {Promise<void>}
     */
    async init(modules) {
        for (const module of modules) {
            logger.info(`Start initialize module [${module.name}]`);

            const instanceOfModule = new module();
            this.#modules.set(module.name.toLowerCase(), instanceOfModule);

            Object.defineProperty(this, module.name.toLowerCase(), {
                value: instanceOfModule,
                writable: false,
                configurable: false,
                enumerable: false,
            });

            await instanceOfModule.init();

            logger.info(`Module [${module.name}] successfully initialized`);
        }
    }

    /**
     * Остановка приложения
     * 
     * @async
     * @public
     * @this Application
     * @returns {Promise<void>}
     */
    async stop() {
        if (this.#appAlreadyStopping)
            return;

        const tasks = [];

        try {
            this.#appAlreadyStopping = true;
            logger.warn('Received SIGINT signal! Application try to stop.');

            this.#modules.forEach((module, key) => tasks.push(module.stop().then(() => {
                logger.info(`Module [${key}] successfully stopped.`);
            }, (e) => {
                logger.error(`Module [${key}] can't stop correct: ${e.stack}`);
            })));

            await Promise.all(tasks);
        } catch(e) {
            logger.error(`Something went wrong: ${e.stack}`);
        }
    }
}

const app = Application.Instance;
export default app;