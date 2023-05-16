export default class Protocol {
  /**
   * Виртуальный метод для парсинга пакета
   * @static
   * @abstract
   * @param {Buffer} buf
   * @returns {*}
   */
  static readFromBuffer(buf) {
    throw new Error('Try to call virtual method.');
  }

  /**
   * Виртуальный пакет для сериализации пакета
   * @static
   * @abstract
   * @param {*} data
   * @returns {Buffer}
   */
  static writeToBuffer(data) {
    throw new Error('Try to call virtual method.');
  }
}
