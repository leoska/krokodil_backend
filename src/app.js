import HttpServer from "./httpServer.js";
import WebSocketServer from "./wsServer.js";
import logger from "./utils/logger.js";

const DEFAULT_CONFIG_ENV = 'develop';
const ARGV_CONFIG_ENV = process.argv[2] || DEFAULT_CONFIG_ENV;
const _instance = Symbol("_instance");

class Application {
    #httpServer = new HttpServer();
    #wsServer = new WebSocketServer();
    #appAlreadyStopping = false;

    static get Instance() {
        return this[_instance] || (this[_instance] = new this());
    }

    async init() {
        await this.#httpServer.init();

        await this.#wsServer.init();
    }

    async stop() {
        if (this.#appAlreadyStopping)
            return;

        try {
            this.#appAlreadyStopping = true;
            logger.warn('Received SIGINT signal! Application try to stop.');
        } catch(e) {

        }
    }
}

const app = Application.Instance;
export default app;