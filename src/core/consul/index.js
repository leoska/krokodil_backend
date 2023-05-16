import os from 'node:os';
import Consul from 'consul';
import { v4 as uuid } from 'uuid';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';

const ARGV_APPLICATION_CMD = process.argv[2];
const CONSUL_CHECHED_ALIVE_TIME = 5 * 1000;

export default class ConsulModule {
  #consul = null;

  #intervalChecker = 0;

  #options = {
    name: `${os.hostname()}-${ARGV_APPLICATION_CMD}`,
    id: uuid(),
    // address: config.consul_address,
    // port: config.consul_port,
    check: {
      ttl: '10s',
      deregister_critical_service_after: '1m',
    },
  };

  /**
   * Инициализация подключения к консулу
   * @async
   * @public
   * @this ConsulModule
   * @returns {Promise<void>}
   */
  async init() {
    this.#consul = new Consul({
      host: config.consul_address,
      port: config.consul_port,
    });

    await this.#consul.agent.service.register(this.#options);

    this.#intervalChecker = setInterval(async () => {
      await this.#consul.agent.check.pass({
        id: `service:${this.#options.id}`,
      });
    }, CONSUL_CHECHED_ALIVE_TIME);

    logger.info(`[ConsulModule] Successfully service [${this.#options.name}] registered`);
  }

  /**
   * Остановка модуля
   * @async
   * @public
   */
  async stop() {
    clearInterval(this.#intervalChecker);

    const details = {
      id: this.#options.id,
    };

    await this.#consul.agent.service.deregister(details);

    logger.warn(`[ConsulModule] Successfully service [${this.#options.name}] deregistered`);
  }
}
