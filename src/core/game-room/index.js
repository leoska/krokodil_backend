import logger from "./../../utils/logger.js";
import createEnum from "./../../utils/enum.js";
import { EventEmitter } from "node:events";

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

    /**
     * Базовый конструктор
     * 
     * @constructor
     * 
     */
    constructor(tickRate = DEFAULT_TICK_RATE, eventsMap = {}, server = null, roomId = "") {
        this.#tickRate = tickRate;
        this.#tickTime = SECOND / tickRate;

        this.#server = serverModule;
        this.#roomId = roomId;
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
    #eventLoop() {
        try {
            this.#dispatchMessageQueue();

            this.tick();

            this.#dispathBufferEvents();

            // TODO: добавить замеры выполнения по времени тика и выводить алерт, если тик выполняется больше определенного времени
            // TODO: возможно стоит тормозить выполнения следующего тика, пока не выполнен текущий
        } catch(e) {
            logger.error(`[Game-Room] Game room with id: [${this.#roomId}] an error has occured in event loop\n${e.stack}`);
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

        for (const event of this.#server.receiveBuffer()) {
            try {

            } catch(e) {
                logger.error(`[Game-Room] Game room with id: [${this.#roomId}] an error has occured on dispatch input messages\n${e.stack}`);
            }
        }
    }

    /**
     * Метод отсылает все события клиентам, которые зарегистрировал bufferEvents
     */
    #dispathBufferEvents() {
        if (!this.#server || typeof(this.#server.receiveBuffer) !== "function")
            return;
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