import { EventEmitter } from "node:events";

export default class Server extends EventEmitter {
    #buffer = [];
    #clients = new WeakMap();

    async init() {

    }

    async stop() {

    }

    /**
     * Получение сообщения от клиента
     * 
     * @public
     * @param {Buffer} data 
     * @param {(net.Socket|EventEmitter|*)} socket 
     * @returns {void}
     */
    message(data, socket) {
        this.#buffer.push({
            data,
            socket,
            event: data.readInt32BE(0),
            stamp: Date.now(),
        });
    }

    /**
     * 
     */
    receiveBuffer() {
        return this.#buffer.splice(0, this.#buffer.length);
    }
}