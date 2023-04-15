import GameRoom from "./../../core/game-room/index.js";
import logger from "./../../utils/logger.js";
import createEnum from "./../../utils/enum.js";
import fs from "node:fs";
import path from "node:path";

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

const wordsPath = path.join(path.resolve(), "src", "projects", "krokodil", "words.txt");
const WORDS = (fs.readFileSync(wordsPath, "utf8")).split('\n');

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
    canvas = null;
    // TODO: добавить массив пикселей картинки

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

        // Server Events
        server.on("disconnect", (client) => this.#disconnect(client));

        // Game Events
        this.on("connected", (...args) => this.#connected(...args));
        this.on("disconnectForce", (...args) => this.#disconnectForce(...args));       
        this.on("draw",  (...args) => this.#draw(...args));
        this.on("chat",  (...args) => this.#chat(...args));
        this.on("selectWord",  (...args) => this.#selectWord(...args));
    }

    /**
     * Клиент отключился от комнаты (намеренно)
     * 
     * @private
     * @param {Object} data
     * @param {Number} stamp
     * @param {Client} client
     * @this KrokodilRoom
     * @returns {void}
     */
    #disconnectForce([data, stamp, client]) {
        // TODO: пока ничего не делаем, используем другой слушатель
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
    }

    /**
     * Клиент отключился от комнаты (завязано на сервере). 
     * Возможно потеря подключения, т.е. даем возможность вернуться в игру.
     * 
     * @private
     * @param {Client} client
     * @returns {void}
     */
    #disconnect(client) {
        --this.amountPlayers;

        delete this.players[client.id];

        // Остановка игры, рисующий игрок вышел
        if (this.playerDrawing === client.id) {
            this.#finishState();
        } else {
            this.sendToAll("disconnect", { id: client.id }, [client.id])
        }
    }


    /**
     * Событие отрисовки в комнате
     * 
     * @private
     * @param {Object} data
     * @param {Number} stamp
     * @param {Client} client
     * @this KrokodilRoom
     * @returns {void}
     */
    #draw([data, stamp, client]) {
        // if (this.playerDrawing == client.id) {
            this.sendToAll("draw", data, [client.id]);
        // }
    }

    /**
     * Событие чата
     * 
     * @private
     * @param {Object} data
     * @param {Number} stamp
     * @param {Client} client
     * @this KrokodilRoom
     * @returns {void}
     */
    #chat([data, stamp, client]) {
        chat.push();
    }

    /**
     * Событие выбора слова
     * 
     * @private
     * @param {Object} data
     * @param {Number} stamp
     * @param {Client} client
     * @this KrokodilRoom
     * @returns {void}
     */
    #selectWord([data, stamp, client]) {

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