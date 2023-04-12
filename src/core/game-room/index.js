import logger from "./../../utils/logger.js";

const DEFAULT_TICK_RATE = 33;

export default class GameRoom {
    #tickRate = DEFAULT_TICK_RATE;
    #bufferEvents = [];

    /**
     * Базовый конструктор
     * 
     * 
     */
    constructor(tickRate = DEFAULT_TICK_RATE) {
        this.#tickRate = tickRate;
    }

    async init() {

    }

    async stop() {

    }

    /**
     * Первый "кадр" игровой комнаты
     * Можно использовать для инициализации различных состоянии и переменных
     * 
     * 
     */
    async firstTick() {

    }

    /**
     * Каждый "кадр" игровой комнаты
     * Вызывается каждый тик
     */
    async tick() {

    }
}