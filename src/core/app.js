import logger from "../utils/logger.js";

const _instance = Symbol("_instance");

class Application {
    #modules = new Map(); // Инициализированные экземпляры модулей
    #appAlreadyStopping = false;

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
        const tasks = [];

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

            tasks.push(instanceOfModule.init().then(() => {
                logger.info(`Module [${module.name}] successfully initialized`);
            }));
        }

        await Promise.all(tasks);
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

            this.#modules.forEach((module) => tasks.push(module.stop().then(() => {
                logger.info(`Module [${module.name}] successfully stopped.`);
            }, (e) => {
                logger.error(`Module [${module.name}] can't stop correct: ${e.stack}`);
            })));

            await Promise.all(tasks);
        } catch(e) {
            logger.error(`Something went wrong: ${e.stack}`);
        }
    }
}

const app = Application.Instance;
export default app;