export default class WebSocketClient {
    #socket = null;
    #wsServer = null;

    /**
     * 
     * @param {ws.WebSocket} ws 
     * @param {WebSocketServer} server 
     */
    constructor(ws, server) {
        ws.on("message", (data) => this.#message(data));

        this.#socket = ws;
        this.#wsServer = server;
    }

    async #message(data) {
        this.#wsServer.sendOthers(data, this.#socket);
    }

    async send(msg) {
        this.#socket.send(msg, (err) => {

        });
    }
}