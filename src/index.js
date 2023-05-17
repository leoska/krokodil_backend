import logger from './utils/logger.js';

const ARGV_APPLICATION_CMD = process.argv[2];
const DEFAULT_CONFIG_ENV = 'develop';
const ARGV_CONFIG_ENV = process.argv[3] || DEFAULT_CONFIG_ENV;

try {
  logger.info(`Try to start [${ARGV_APPLICATION_CMD}] cmd application`);
  const cmdApplication = (await import(`./cmd/${ARGV_APPLICATION_CMD}/index.js`)).default;
  await cmdApplication(ARGV_CONFIG_ENV);
} catch (e) {
  logger.error(`Application can't start correct: ${e.stack}`);
  throw e;
}
