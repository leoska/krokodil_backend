import logger from "./../../utils/logger.js";
import Client from "./../client.js";

export default class WebSocketClient extends Client {
    #socket = null;
    #wsServer = null;

    /**
     * Constructor
     * 
     * @param {ws.WebSocket} ws 
     * @param {WebSocketServer} server 
     */
    constructor(ws, server) {
        ws.on("message", (data) => this.#message(data));
        ws.on("error", (err) => this.#error(err));
        ws.once("close", (...args) => server.disconnect(ws, ...args))


        this.#socket = ws;
        this.#wsServer = server;
    }

    /**
     * Метод, вызываемый, когда пришло сообщение от веб-сокет клиента
     * 
     * @private
     * @param {*} data 
     */
    #message(data) {
        this.#wsServer.message(data, this.#socket);
    }

    /**
     * Методы, вызываемый, когда веб-сокет клиент словил ошибку
     * 
     * @private
     * @this WebSocketClient
     * @param {Error} err 
     */
    #error(err) {
        logger.error(`WebSocketClient an error has occured [code: ${err.code}], stack: ${err.stack}`);
    }

    /**
     * Отправка данных клиенту
     * 
     * @param {Buffer} msg 
     */
    async send(data) {
        this.#socket.send(data, (err) => {
            logger.error(`WebSocketClient an error has occured on sending data [code: ${err.code}], stack: ${err.stack}`);
        });
    }
}