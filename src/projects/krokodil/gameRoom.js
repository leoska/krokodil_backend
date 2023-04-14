import GameRoom from "./../../core/game-room/index.js";
import logger from "./../../utils/logger.js";
import createEnum from "./../../utils/enum.js";
import fs from "node:fs";

import eventsMap from "./eventsMap.json" assert { type: "json" };

const AMOUNT_PLAYERS_SESSION = 2; // 4

const DEFAULT_TICK_RATE = 15;
const DEFAULT_GAME_STATE = createEnum([
    "WAITING",
    "SELECT_WORD",
    "PLAYING",
    "WINNING",
    "LOSING",
    "FINISH",
]);

const WORDS = (fs.readFileSync("words.txt", "utf8")).split('\n');

function getRandomWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function getRandomPlayer(players) {
    const ids = Object.keys(players);
    return ids[Math.floor(Math.random() * ids.length)]
}

export default class KrokodilRoom extends GameRoom {
    gameState = DEFAULT_GAME_STATE.WAITING;
    amountPlayers = 0;
    word = "";
    playerDrawing = 0;
    players = {};
    chat = [];

    /**
     * Конструктор игровой комнаты крокодила
     * 
     * @constructor
     * @param {Server} server 
     * @param {String} roomId 
     * @param  {...any} args 
     */
    constructor(server = null, roomId = "", ...args) {
        super(server, roomId, DEFAULT_TICK_RATE, eventsMap);

        // System Events
        this.on("connected", (...args) => this.#connected(...args));
        this.on("disconnect", (...args) => this.#disconnect(...args));
        server.on("disconnect", (clientId) => this.#disconnectClient(clientId));

        // Game Events
        this.on("draw",  (...args) => this.#connected(...args));
        this.on("chat",  (...args) => this.#connected(...args));
        this.on("selectWord",  (...args) => this.#connected(...args));
    }

    /**
     * Событие подключение игрока
     * 
     * @param {Object} data
     * @param {Number} stamp
     * @param {Client} client
     */
    #connected([data, stamp, client]) {
        this.players[client.id] = client;

        if (++this.amountPlayers >= AMOUNT_PLAYERS_SESSION) {
            if (this.gameState === DEFAULT_GAME_STATE.WAITING) {
                this.#selectWordState();
                
            }
        }

        logger.debug(data);
    }

    /**
     * Клиент отключился от комнаты
     * 
     * @private
     * @param {Object} data
     * @param {Number} stamp
     * @param {Client} client
     * @this KrokodilRoom
     * @returns {void}
     */
    #disconnect([data, stamp, client]) {
        // TODO: пока ничего не делаем, используем другой слушатель
    }

    #draw([data, stamp, client]) {
        
    }

    /**
     * Клиент отключился от комнаты (завязано на сервере)
     * 
     * @private
     * @param {Number} clientId 
     * @returns {void}
     */
    #disconnectClient(clientId) {
        --amountPlayers;

        // Остановка игры, рисующий игрок вышел
        if (this.playerDrawing === clientId) {
            this.#finishState();
        }
    }

    /**
     * Переводим комнату в состояние выбора слова
     * 
     * @private
     * @this KrokodilRoom
     * @returns {void}
     */
    #selectWordState() {
        gameState = DEFAULT_GAME_STATE.SELECT_WORD;

        // Выбираем случайное слово и случайного рисующего игрока
        this.word = getRandomWord();
        this.playerDrawing = getRandomPlayer(this.players);
    }

    /**
     * Переводим комнату в состония освобождение ресурсов
     * 
     * @private
     * @this KrokodilRoom
     * @returns {void}
     */
    #finishState() {

    }

    /**
     * Первый "кадр" игровой комнаты.
     * Можно использовать для инициализации различных состоянии и переменных.
     * На первом тике буфер событий будет пустой.
     * 
     */
    async firstTick() {
        logger.info(`[KrokodilRoom (${this.id})] Started playing. Waiting for players.`);
    }
    
    /**
     * Каждый "кадр" игровой комнаты.
     * Вызывается каждый тик.
     */
    async tick() {

    }
}