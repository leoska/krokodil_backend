import { WebSocketServer } from "ws";
import logger from "../../utils/logger.js";
import WSClient from "./wsClient.js";
import Server from "./../server.js"
import ProtocolJSON from "./../protocol/json.js";

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
     * @this WSServer
     */
    constructor(options) {
        super();

        this.#options = {
            ...this.#options,
            ...options,
        };
    }

    /**
     * Сериализатор пакетов
     * 
     * @static
     * @getter
     * @returns {ProtocolJSON}
     */
    static get serializator() {
        return ProtocolJSON;
    }

    /**
     * Emitted when an error occurs before the WebSocket connection is established.
     * 
     * @param {Error} error 
     * @param {net.Socket|tls.Socket} socket 
     * @param {http.IncomingMessage} request 
     */
    #wsClientError(error, socket, request) {
        logger.error(`[WS-Server] Client error: \n${error}`);
    }

    /**
     * Инициализация веб-сокет сервера
     * 
     * @async
     * @public
     * @override
     * @this WSServer
     * @returns {Promise<void>}
     */
    async init() {
        this.#server = new WebSocketServer(this.#options, () => {
            logger.info(`[WS-Server] Successfully started ws-server on ${this.#options.host}:${this.#options.port}`);
        });

        this.#server.on("connection", (socket) => this.connection(socket, WSClient));
        this.#server.on("wsClientError", (error, socket, request) => this.#wsClientError(error, socket, request));
    }

    /**
     * Остановка сервера
     */
    async stop() {
        await super.stop();

        await new Promise((resolve, reject) => this.#server.close((err) => err ? reject(err) : resolve()));
    }
}