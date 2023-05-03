import grpc from "@grpc/grpc-js";
import { EventEmitter } from "node:events";
import logger from "./../../utils/logger.js";

class GRpc extends EventEmitter {
    #rpc = {};
    #calledRpc = {};
    #server = null;
    #options = {
        host: "0.0.0.0:50051",
        credentials: grpc.ServerCredentials.createInsecure(),
    };

    constructor(...args) {
        super(...args);

        this.#server = new grpc.Server();
    }

    async init() {
        await new Promise((resolve, reject) => {
            server.bindAsync(this.#options.host, this.#options.credentials, (error, port) => {
                if (error) {
                    reject(error);
                    return;
                }

                logger.info(`[GRPC-server] Server running at http://127.0.0.1:50051`);
                resolve();
            });
        });
    }

    async stop() {

    }
}

const grpcModule = new GRpc();

export default grpcModule;