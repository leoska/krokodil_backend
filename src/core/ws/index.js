import { WebSocketServer } from "ws";
import logger from "../../utils/logger.js";
import WSClient from "./wsClient.js";
import Server from "./../server.js"

const DEFAULT_WS_HOST = "0.0.0.0";
const DEFAULT_WS_PORT = 8081;

export default class WSServer extends Server {
    #server = null;
    #options = {
        host: DEFAULT_WS_HOST,
        port: DEFAULT_WS_PORT,
    }

    /**
     * Базовый конструктор
     * 
     * @param {Object} options 
     */
    constructor(options) {
        super();

        this.#options = {
            ...this.#options,
            ...options,
        };
    }

    /**
     * Новое подключение по веб-сокету
     * 
     * @private
     * @param {ws.WebSocket} socket
     */
    #connection(socket) {
        logger.debug(`[WS-Server] Client [${socket.url}] joined.`);
    }

    /**
     * Инициализация веб-сокет сервера
     * 
     * @async
     * @public
     * @this WSServer
     * @returns {Promise<void>}
     */
    async init() {
        this.#server = new WebSocketServer(this.#options, () => {
            logger.info(`[WS-Server] Successfully started ws-server on ${this.#options.host}:${this.#options.port}`);
        });

        this.#server.on("connection", (socket) => this.connection(socket, WSClient));
    }

    /**
     * 
     */
    async stop() {

    }
}