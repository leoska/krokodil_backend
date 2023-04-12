/**
*
* @param obj {object} объект со значениями перечисления
*/
export default function createEnum(values) {
    const enumObject = {};

    for (const val of values) {
        enumObject[val] = val;
    }
    
    return Object.freeze(enumObject);
}