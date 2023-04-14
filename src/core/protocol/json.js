import Protocol from "./index.js";
import { Buffer } from "node:buffer";

export default class ProtocolJSON extends Protocol {
    /**
     * Парсинга буфера в JSON 
     * 
     * @static
     * @override
     * @param {Buffer} buf 
     * @returns {[Object, Number]}
     */
    static readFromBuffer(buf) {
        return JSON.parse(buf.toString('utf8'));
    }

    /**
     * Сериализация JSON в байтовый буфер
     * 
     * @static
     * @override
     * @param {*} data 
     * @returns {Buffer}
     */
    static writeToBuffer(data) {
        return Buffer.from(JSON.stringify(data));
    }
}