import GameRoom from "./../../core/game-room/index.js";
import logger from "./../../utils/logger.js";
import createEnum from "./../../utils/enum.js";

import eventsMap from "./eventsMap.json" assert { type: "json" };


const DEFAULT_TICK_RATE = 15;
const DEFAULT_GAME_STATE = createEnum([
    "WAITING",
    "SELECT_WORD",
    "PLAYING",
    "WINNING",
    "LOSING",
    "FINISH",
]);

export default class KrokodilRoom extends GameRoom {
    gameState = DEFAULT_GAME_STATE.WAITING;

    constructor(server = null, roomId = "", ...args) {
        super(server, roomId, DEFAULT_TICK_RATE, eventsMap);

        server.on("disconnect", (clientId) => );

        this.on("connected", (...args) => this.#connected(...args));
        this.on("loaded", (...args) => this.#loaded(...args));
        this.on("disconnect", (...args) => this.#disconnect(...args));
    }

    /**
     * Событие подключение игрока
     * 
     * @param {Buffer} data
     * @param {Number} stamp
     * @param {Client} client
     */
    #connected([data, stamp, client]) {
        
    }

    /**
     *  Готовность к игре
     * 
     * @param {Buffer} data
     * @param {Number} stamp
     * @param {Client} client
     */
    #loaded([data, stamp, client]) {

    }

    /**
     * 
     * @param {Buffer} data
     * @param {Number} stamp
     * @param {Client} client
     */
    #disconnect([data, stamp, client]) {
        // TODO: пока ничего не делаем, используем другой слушатель
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