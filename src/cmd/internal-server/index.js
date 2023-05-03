import app from "./../../core/app.js";
import timeout from "./../../utils/timeout.js";
import logger from "./../../utils/logger.js";
import http from "./../../core/http/index.js";
import ConsulModule from "./../../core/consul/index.js";

const EXIT_MAX_WAIT = 10000; // 10 secs

process.once('SIGINT', async () => {
    try {
        await Promise.race([
            app.stop(),
            timeout(EXIT_MAX_WAIT),
        ]);

        logger.info(`Application successfully stopped.`);
        process.exit(0);
    } catch(e) {
        logger.error(`Application can't stop correct: ${e}`);
        process.exit(1);
    }
});

/**
 * Entry point of cmd application
 * 
 * @async
 * @param {String} env
 * @returns {Promise<void>}
 */
export default async function main() {


    await app.init([
        http,
        ConsulModule,
    ]);
}