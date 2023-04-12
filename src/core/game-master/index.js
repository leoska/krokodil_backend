import logger from "./../../utils/logger.js";
import crypto from "node:crypto";

const SESSION_BYTES_LENGTH = 16;

export default class GameMaster {
    #gameSessions = new Map();

    async init() {

    }

    async stop() {

    }

    /**
     * Генерация идентификатора игровой сессии (комнаты)
     * 
     * @private
     * @returns {String}
     */
    #generateSessionId() {
        return crypto.randomBytes(SESSION_BYTES_LENGTH).toString('base64');
    }

    /**
     * Создание новой игровой сессии (комнаты)
     * 
     * @async
     * @public
     * @this GameMaster
     * @returns {Promise<String>}
     */
    async createGameSession() {
        const sessionId = this.#generateSessionId();

        if (this.#gameSessions.has(sessionId)) {
            throw new Error(`[Game-Master] Game session with sessionId=${sessionId} already exists`);
        }

        return sessionId;
    }
}