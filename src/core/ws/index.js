import { WebSocketServer } from "ws";
import logger from "../../utils/logger.js";
import WebSocketClient from "./wsClient.js";

const DEFAULT_WS_HOST = "0.0.0.0";
const DEFAULT_WS_PORT = 8081;

export default class WSServer {
    #server = null;
    #clients = new Map();

    /**
     * Новое подключение по веб-сокету
     * 
     * @private
     * @param {ws.WebSocket} socket
     */
    #connection(socket) {
        logger.debug(`[WS-Server] Client [${socket.url}] joined.`);
        this.#clients.set(ws, new WebSocketClient(socket, this));
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
        const options = {
            host: DEFAULT_WS_HOST,
            port: DEFAULT_WS_PORT,
        };

        this.#server = new WebSocketServer(options, () => {
            logger.info(`[WS-Server] Successfully initialized and started ws-server on ${options.host}:${options.port}`);
        });

        this.#server.on("connection", (ws) => this.#connection(ws));
    }

    /**
     * Отправка сообщения всем клиентам
     * 
     * @public
     * @param {Buffer} data 
     * @this WSServer
     * @returns {void}
     */
    broadcast(data) {
        this.#clients.forEach((client) => {
            client.send(data);
        });
    }

    /**
     * Отправка сообщения всем клиентам, кроме источника
     * 
     * @public
     * @param {Buffer} data 
     * @param {ws.WebSocket} source 
     * @this WSServer
     * @returns {void}
     */
    sendOthers(data, source) {
        this.#clients.forEach((client, key) => {
            if (source === key)
                return;
            
            client.send(data);
        });
    }

    /**
     * Отключение игрока
     * 
     * @public
     * @param {ws.WebSocket} socket 
     * @param {Number} [code]
     * @param {String} [reason]
     * @this WSServer
     * @returns {void}
     */
    disconnect(socket, code = 0, reason = "") {
        if (socket.readyState < 2){
            socket.close(code, reason);
        }
        
        this.#clients.delete(socket);
        logger.debug(`[WS-Server] Client [${socket.url}] has disconnected.`);
    }
}