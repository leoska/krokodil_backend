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
    #bufferEvents = {};
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
        super();
        
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
        const startTime = Date.now();

        try {
            this.#dispatchMessageQueue();

            await this.tick();

            this.#dispathBufferEvents();
        } catch(e) {
            logger.error(`[${this.constructor.name}] Game room with id: [${this.#roomId}] an error has occured in event loop\n${e.stack}`);
        } finally {
            const diffTime = Date.now() - startTime;

            if (diffTime > this.#tickTime) {
                logger.alert(`[${this.constructor.name}] Game room with id: [${this.#roomId}] `)
            }
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
         * @property {Client} client - socket of source event
         * @property {Number} event - first 4 byte big-endian int of [data] 
         * @property {Number} stamp - stamp of register event
         */

        const events = this.eventNames();

        // TODO: разбить на методы, код выглядит сложным

        /** * @type {PlayerEvent} */
        for (const packet of this.#server.receiveBuffer()) {
            try {
                if (!Array.isArray(packet.data.events)) {
                    throw new Error(`[${this.constructor.name}] Received packet field 'events' expected a array! Type: [${typeof(packet.data.events)}]`);
                }

                for (const { data, eventCode, stamp } of packet.data.events) {
                    try {
                        const eventName = this.#eventsMap[eventCode];
                        
                        if (!eventName) {
                            logger.error(`[${this.constructor.name}] Event with id [${eventCode}] not registered in eventMaps!`);
                            continue;
                        }
        
                        if (!events.includes(eventName)) {
                            logger.warn(`[${this.constructor.name}] Event with name [${eventName}] has not registered listeners.`);
                            continue;
                        }
        
                        this.emit(eventName, [JSON.parse(data), stamp, packet.client]);
                    } catch(e) {
                        logger.error(`[${this.constructor.name}] Game room with id: [${this.#roomId}] an error has occured on dispatch input messages\n${e.stack}`);
                    }
                }
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

        const userExistsIds = this.#server.clientIds;
        const idsForRemove = [];

        for (const [ receiver, buffer ] of Object.entries(this.#bufferEvents)) {
            if (!userExistsIds.includes(Number(receiver))) {
                idsForRemove.push(Number(receiver));
                continue;
            }

            if (buffer.length < 1)
                continue;

            const dataToSend = Array(buffer.length);
            let i = 0;

            for (const { event, data, stamp } of buffer.splice(0, buffer.length)) {
                dataToSend[i++] = {
                    eventCode: Number(event),
                    // FIXME: исправить двойную сериализацию data
                    data: JSON.stringify(data),
                };
            }

            this.#server.sendToClient({ events: dataToSend }, Number(receiver));
        }

        for (const idForRemove of idsForRemove)
            delete this.#bufferEvents[idForRemove];
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
        if (!this.#bufferEvents[clientId])
            this.#bufferEvents[clientId] = [];

        this.#bufferEvents[clientId].push({
            event: this.#eventsMapT[event],
            data,
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
            
            if (!this.#bufferEvents[clientId])
                this.#bufferEvents[clientId] = [];
            
            this.#bufferEvents[clientId].push({
                event: this.#eventsMapT[event],
                data,
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