import app from '../../core/app.js';
import timeout from '../../utils/timeout.js';
import logger from '../../utils/logger.js';
import http from '../../core/http/index.js';
import gm from '../../core/game-master/index.js';
import WSServer from '../../core/ws/index.js';
import KrokodilRoom from '../../projects/krokodil/gameRoom.js';
import ConsulModule from '../../core/consul/index.js';

const EXIT_MAX_WAIT = 10000; // 10 secs

process.once('SIGINT', async () => {
  try {
    await Promise.race([app.stop(), timeout(EXIT_MAX_WAIT)]);
    logger.info('Application successfully stopped.');
  } catch (e) {
    logger.error(`Application can't stop correct: ${e}`);
    throw e;
  }
});

/**
 * Entry point of cmd application
 * @async
 * @param {string} env
 * @returns {Promise<void>}
 */
export default async function main() {
  gm.newGameRoom = KrokodilRoom;
  gm.serverFactory = function serverFactory(options) {
    return new WSServer(options);
  };

  await app.init([ConsulModule, gm, http]);

  await app.gamemaster.createGameSession();
}
