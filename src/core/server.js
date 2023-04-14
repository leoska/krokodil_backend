import { EventEmitter } from "node:events";
import Client from "./client.js";
import Protocol from "./protocol/index.js";

export default class Server extends EventEmitter {
    #buffer = [];
    #clients = new Map();

    /**
     * Базовый конструктора сервера
     * 
     * @constructor
     * @this Server
     */
    constructor() {
        super();

        this.on("disconnect", (clientId) => this.disconnect(clientId));
        this.on("clientData", (...args) => this.clientData(...args));
    }

    /**
     * Сериализатор пакетов
     * 
     * @static
     * @getter
     * @returns {Protocol}
     */
    static get serializator() {
        return Protocol;
    }

    /**
     * Возвращает массив идентификаторов игроков
     * 
     * @public
     * @getter
     * @returns {Array<Number>}
     */
    get clientIds() {
        return this.#clients.keys();
    }

    /**
     * Возвращает свободный цифровой идентификатор
     * 
     * @private
     * @this Server
     * @returns {Number}
     */
    #getFreeClientId() {
        if (this.#clients.size < 1)
            return 1;

        let result = 0;
        for (const id of this.#clients.keys().sort()) {
            if (id !== ++result)
                return result;
        }

        return this.#clients.size + 1;
    }

    /**
     * Инициализация сервера
     * 
     * @async
     * @public
     * @virtual
     * @this Server
     * @returns {Promise<void>}
     */
    async init() {
        throw new Error("Try to call virtual method.");
    }

    /**
     * Остановка сервера
     * 
     * @async
     * @public
     * @this Server
     * @returns {Promise<void>}
     */
    async stop() {
        this.removeAllListeners("disconnect");

        const tasks = [];
        this.#clients.forEach((client) => {
            tasks.push(client.close().error((err) => {
                const code = err.code ? `code: ${err.code}` : '';
                logger.error(`[${this.constructor.name}] Client an error has occured on close connection. ${code}\n${err.stack}`);
            }));
        });

        await Promise.all(tasks);

        this.removeAllListeners();
    }

    /**
     * Получение сообщения от клиента
     * 
     * @public
     * @param {Client} client
     * @param {(Buffer|String|ArrayBuffer|*)} buffer 
     * @returns {void}
     */
    clientData(client, buffer) {
        const [ data, event ] = this.constructor.serializator.readFromBuffer(buffer);

        this.#buffer.push({
            data,
            client,
            event,
            stamp: Date.now(),
        });
    }

    /**
     * Получение буффера сообщений
     * 
     * @public
     * @this Server
     * @returns {Array<Object>}
     */
    receiveBuffer() {
        return this.#buffer.splice(0, this.#buffer.length);
    }

    /**
     * Клиент отключился
     * 
     * @public
     * @param {Number} client 
     * @returns {void}
     */
    disconnect(clientId) {
        logger.info(`[${this.constructor.name}] Client with id: [${clientId}] has disconnected.`);
        this.#clients.delete(clientId);
    }

    /**
     * Новое подключение
     * 
     * @public
     * @param {(net.Socket|EventEmitter|*)} socket 
     * @param {Client} clientClass
     */
    connection(socket, clientClass) {
        const id = this.#getFreeClientId();

        if (this.#clients.has(id)) {
            socket.close();
            throw new Error(`[${this.constructor.name}] Generated free id has already exists in client map!`);
        }

        const client = new clientClass(id, socket, this);

        this.#clients.set(id, client);

        logger.info(`[${this.constructor.name}] Client with id: [${id}] joined.`);
    }

    /**
     * Отправка сообщения всем клиентам
     * 
     * @public
     * @param {*} data 
     * @this Server
     * @returns {void}
     */
    broadcast(data) {
        const buf = this.constructor.serializator.writeToBuffer(data);
        this.#clients.forEach((client) => {
            client.send(buf);
        });
    }

    /**
     * Отправка сообщения всем клиентам, кроме источника
     * 
     * @public
     * @param {*} data 
     * @param {Number} sourceId 
     * @this Server
     * @returns {void}
     */
    sendOthers(data, sourceId) {
        const buf = this.constructor.serializator.writeToBuffer(data);

        this.#clients.forEach((client, key) => {
            if (sourceId === key)
                return;
            
            client.send(buf);
        });
    }

    /**
     * Отправка сообщения конкретному клиенту
     * 
     * @public
     * @param {*} data 
     * @param {Number} clientId 
     * @this Server
     * @returns {void}
     */
    sendToClient(data, clientId) {
        if (!this.#clients.has(clientId)) {
            throw new Error(`[${this.constructor.name}] client with id: [${clientId}] not exists!`);
        }

        const client = this.#clients.get(clientId);
        client.send(this.constructor.serializator.writeToBuffer(data));
    }

    /**
     * Проверка на существование клиента
     * 
     * 
     * @param {*} clientId 
     */
    existsClient(clientId) {
        return this.#clients.has(clientId);
    }
}