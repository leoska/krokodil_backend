import logger from "./../../utils/logger.js";
import createEnum from "./../../utils/enum.js";
import { EventEmitter } from "node:events";
import { Buffer } from "node:buffer";

const DEFAULT_TICK_RATE = 33;
const SECOND = 1000;

const GAME_ROOM_STATE = createEnum([
    'CREATED',
    'INITIALIZED',
    'WAITING',
    'STARTING',
    'PLAYING',
    'ENDING',
    'CLOSED',
]);

export default class GameRoom extends EventEmitter {
    #tickRate = DEFAULT_TICK_RATE;
    #bufferEvents = [];
    #server = null;
    #state = GAME_ROOM_STATE.CREATED;
    #tickTime = SECOND / DEFAULT_TICK_RATE;
    #intervalIdEventLoop = 0;
    #roomId = "";
    #eventsMap = null;
    #eventsMapT = {};

    /**
     * Базовый конструктор
     * 
     * @constructor
     * @param {Server} server
     * @param {String} roomId
     * @param {Number} tickRate
     * @param {Object} eventsMap
     * @this GameRoom
     */
    constructor(server = null, roomId = "", tickRate = DEFAULT_TICK_RATE, eventsMap = {}) {
        this.#tickRate = tickRate;
        this.#tickTime = SECOND / tickRate;
        this.#eventsMap = {...eventsMap};

        for (const [key, value] of Object.entries(eventsMap)) {
            this.#eventsMapT[value] = key;
        }

        this.#server = server;
        this.#roomId = roomId;
    }

    /**
     * Возвращает идентификатор комнаты
     * 
     * @getter
     * @this GameRoom
     * @returns {String}
     */
    get id() {
        return this.#roomId;
    }

    /**
     * Возвращает массив идентификаторов игроков у сервера
     * 
     * @getter
     * @this GameRoom
     * @returns {Array<Number>}
     */
    get clientIds() {
        return this.#server.clientIds;
    }

    /**
     * Вход в цикл событий с запуском первого тика.
     * 
     * @private
     * @this GameRoom
     * @returns {void}
     */
    #start() {
        this.#state = GAME_ROOM_STATE.STARTING;

        try {
            this.firstTick();
        } catch(e) {
            logger.error(`[${this.constructor.name}] Something went wrong on first tick\n${e.stack}`);
        }
        
        this.#state = GAME_ROOM_STATE.PLAYING;

        this.#intervalIdEventLoop = setInterval(() => this.#eventLoop(), this.#tickTime);
    }

    /**
     * Цикл событий игровой комнаты
     * 
     * @private
     * @this GameRoom
     * @returns {void}
     */
    async #eventLoop() {
        try {
            this.#dispatchMessageQueue();

            await this.tick();

            this.#dispathBufferEvents();

            // TODO: добавить замеры выполнения по времени тика и выводить алерт, если тик выполняется больше определенного времени
            // TODO: возможно стоит тормозить выполнения следующего тика, пока не выполнен текущий
        } catch(e) {
            logger.error(`[${this.constructor.name}] Game room with id: [${this.#roomId}] an error has occured in event loop\n${e.stack}`);
        }
    }

    /**
     * Метод извлекает буфер сообщений из сервера и кладем их в буфер событий.
     * 
     * @private
     * @this GameRoom
     * @returns {void}
     */
    #dispatchMessageQueue() {
        if (!this.#server || typeof(this.#server.receiveBuffer) !== "function")
            return;

        /**
         * @typedef {Object} PlayerEvent
         * @property {Buffer} data - binary data of event
         * @property {(net.Socket|EventEmitter|*)} socket - socket of source event
         * @property {Number} event - first 4 byte big-endian int of [data] 
         * @property {Number} stamp - stamp of register event
         */

        const events = this.eventNames();

        /** * @type {PlayerEvent} */
        for (const { data, socket, event, stamp } of this.#server.receiveBuffer()) {
            try {
                const eventName = this.#eventsMap[event];
                
                if (!eventName) {
                    logger.error(`[${this.constructor.name}] Event with id [${event}] not registered in eventMaps!`);
                    continue;
                }

                if (!events.includes(eventName)) {
                    logger.warn(`[${this.constructor.name}] Event with name [${eventName}] has not registered listeners.`);
                    continue;
                }

                this.emit(eventName, [data, stamp, socket]);
            } catch(e) {
                logger.error(`[${this.constructor.name}] Game room with id: [${this.#roomId}] an error has occured on dispatch input messages\n${e.stack}`);
            }
        }
    }

    /**
     * Метод отсылает все события клиентам, которые зарегистрировал bufferEvents
     * 
     * @private
     * @this GameRoom
     * @returns {void}
     */
    #dispathBufferEvents() {
        if (!this.#server || typeof(this.#server.receiveBuffer) !== "function")
            return;

        for (const { event, data, receiver, stamp } of this.#bufferEvents.splice(0, this.#bufferEvents.length)) {
            this.#server.sendToClient({
                event,
                data
            }, receiver);
        }
    }

    /**
     * Инициализация игровой комнаты
     * 
     * @async
     * @public
     * @this GameRoom
     * @returns {Promise<void>}
     */
    async init() {
        await this.#server.init();

        this.#state = GAME_ROOM_STATE.INITIALIZED;

        // Enter to event loop
        this.#start();
    }

    /**
     * Остановка игровой комнаты
     * 
     * @async
     * @public
     * @this GameRoom
     * @returns {Promise<void>}
     */
    async stop() {
        // Stoped event loop
        clearInterval(this.#intervalIdEventLoop);

        // Closed Server
        await this.#server.stop();

        this.#state = GAME_ROOM_STATE.CLOSED;
    }

    /**
     * Отправка сообщения на клиент
     * 
     * @async
     * @public
     * @param {String} event
     * @param {*} data
     * @param {Number} clientId
     * @this GameRoom
     * @returns {Promise<void>}
     */
    async send(event, data, clientId) {
        this.#bufferEvents.push({
            event: this.#eventsMapT[event],
            data,
            receiver: clientId,
            stamp: Date.now(),
        });
    }

    /**
     * Отправка всем сообщения
     * 
     * @async
     * @public
     * @param {String} event
     * @param {*} data
     * @param {Array<Number>} [ignoreIds]
     * @this GameRoom
     * @returns {Promise<void>}
     */
    async sendToAll(event, data, ignoreIds = []) {
        for (const clientId of this.clientIds) {
            if (ignoreIds.includes(clientId))
                continue;
            
            this.#bufferEvents.push({
                event: this.#eventsMapT[event],
                data,
                receiver: clientId,
                stamp: Date.now(),
            });
        }
    }

    /**
     * Первый "кадр" игровой комнаты.
     * Можно использовать для инициализации различных состоянии и переменных.
     * На первом тике буфер событий будет пустой.
     * 
     */
    async firstTick() {
    }

    /**
     * Каждый "кадр" игровой комнаты.
     * Вызывается каждый тик.
     */
    async tick() {
    }


}