export default class ErrorApiMethod extends Error {
    /**
     * Базовый конструктор
     * 
     * @param {String} message 
     * @param {String} code 
     * @param {Number} status 
     * @param {Boolean} stack 
     */
    constructor(message, code, status, stack = false) {
        super('');
        this.code = code;
        this.status = status;
        this.message = message;
        
        if (stack)
            Error.captureStackTrace(this, this.constructor);
        else 
            this.stack = null;
    }
}