/**
 * Создает ENUM объект из переданных массива значений
 * @param {Array<string>} values - массив значений
 * @returns {object} - объект типа enum из переданных значений
 */
export default function createEnum(values) {
  const enumObject = {};

  for (const val of values) {
    enumObject[val] = val;
  }

  return Object.freeze(enumObject);
}
