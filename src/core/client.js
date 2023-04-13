import { EventEmitter } from "node:events";
import logger from "./../utils/logger.js";

export default class Client extends EventEmitter {
    #socket = null;
    #server = null;
    #id = 0;

    /**
     * 
     * @constructor
     * @param {Number} id 
     * @param {(net.Socket|EventEmitter|*)} socket 
     * @param {(net.Socket|EventEmitter|*)} server 
     */
    constructor(id = 0, socket = null, server = null) {
        super();

        this.#id = id;
        this.#socket = socket;
        this.#server = server;

        socket.on("error", (...args) => this.error(...args));
        socket.once("close", (...args) => this.close(...args));
    }

    /**
     * Отправка данных клиенту по сокету
     * 
     * @param {*} data 
     */
    async send(data) {
        this.#socket.send(data);
    }

    /**
     * Функция вызываемая при ошибке
     * 
     * @public
     * @param {*} err 
     * @returns {void}
     */
    error(err) {
        code = err.code ? `code: ${err.code}` : '';
        logger.error(`Client an error has occured. ${code}\n${err.stack}`);
        throw err;
    }

    /**
     * Метод вызываемый при закрытии сокета
     * 
     * @public
     * @param {...} args
     * @returns {void}
     */
    close(...args) {
        this.#server.emit("disconnect", this.#id);

        try {
            if (typeof(this.#socket.close) === "function") {
                this.#socket.close(...args);
            }
        } catch(e) {
            code = e.code ? `code: ${e.code}` : '';
            logger.error(`Client an error has occured on close connection. ${code}\n${e.stack}`);
        }
    }
}