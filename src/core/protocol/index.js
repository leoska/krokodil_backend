export default class Protocol {
    /**
     * Виртуальный метод для парсинга пакета 
     * 
     * @static
     * @virtual
     * @param {Buffer} buf 
     * @returns {*}
     */
    static readFromBuffer(buf) {
        throw new Error("Try to call virtual method.");
    }

    /**
     * Виртуальный пакет для сериализации пакета
     * 
     * @static
     * @virtual
     * @param {*} data 
     * @returns {Buffer}
     */
    static writeToBuffer(data) {
        throw new Error("Try to call virtual method.");
    }
}