import app from "./src/app.js";
import timeout from "./src/utils/timeout.js";
import logger from "./src/utils/logger.js";

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


try {
    await app.init();
} catch(e) {
    logger.error(`Application can't start correct: ${e.stack}`);
    process.exit(1);
}
