import GameRoom from "./../../core/game-room/index.js";
import logger from "./../../utils/logger.js";

export default class KrokodilRoom extends GameRoom {
    constructor(...args) {
        super(...args);
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