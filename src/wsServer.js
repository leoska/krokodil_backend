import { WebSocketServer as wsServer } from "ws";
import logger from "./utils/logger.js";
import WebSocketClient from "./wsClient.js";

const DEFAULT_WS_HOST = "0.0.0.0";
const DEFAULT_WS_PORT = 8081;

export default class WebSocketServer {
    #server = null;
    #clients = new Map();

    #connection(ws) {
        logger.debug(`[WS-Server] Client joined.`);
        this.#clients.set(ws, new WebSocketClient(ws, this));
    }

    async init() {
        const options = {
            host: DEFAULT_WS_HOST,
            port: DEFAULT_WS_PORT,
        };

        this.#server = new wsServer(options, () => {
            logger.info(`[WS-Server] Successfully initialized and started ws-server on ${options.host}:${options.port}`);
        });

        this.#server.on("connection", (ws) => this.#connection(ws));
    }


    broadcast(data) {
        this.#clients.forEach((client) => {
            client.send(data);
        });
    }

    async sendOthers(data, source) {
        this.#clients.forEach((client, key) => {
            if (source === key)
                return;
            
            client.send(data);
        });
    }
}