import express from 'express';
import http from 'node:http';
import fsExtra from 'fs-extra';
import path from 'node:path';
import logger from '../../utils/logger.js';

const DEFAULT_HTTP_HOST = '0.0.0.0';
const DEFAULT_HTTP_PORT = 8080;

const __dirname = path.resolve();

/**
 * Функция для возврата свойств файла/папки
 * @param {string} pathFile
 * @this _initApi
 * @returns {Promise<(Error|null|Stats)>}
 */
function getFileStats(pathFile) {
  return new Promise((resolve, reject) => {
    fsExtra.pathExists(pathFile, (err, exists) => {
      if (err) reject(err);

      if (!exists) reject(new Error(`ENOENT: no such file or directory: [${pathFile}]`));

      fsExtra.stat(pathFile, (statErr, stats) => {
        if (statErr) reject(statErr);

        resolve(stats);
      });
    });
  });
}

/**
 * Функция сканирования папки
 * @param {string} pathDir
 * @this _initApi
 * @returns {Promise<(Error|Object.<string, BaseApi>)>}
 */
function readDir(pathDir) {
  return new Promise((resolve, reject) => {
    const apies = {};

    fsExtra.readdir(pathDir, async (err, files) => {
      if (err) reject(err);

      for (const file of files) {
        const filePath = path.join(pathDir, file);

        const stats = await getFileStats(filePath);
        if (stats.isDirectory()) {
          const dirApies = await readDir(path.join(pathDir, file));
          Object.assign(apies, dirApies);
        } else if (/^[^_].*\.js$/.test(file)) {
          const subDirs = pathDir.split('/');
          const apiName =
            (pathDir.length ? `${subDirs.join('.')}.` : '') + file.substr(0, file.length - 3);

          const apiModule = (await import(filePath)).default;

          if (apiModule.isApi && apiModule.isApi()) {
            if (apies[apiName]) {
              reject(new Error(`[HTTP-Server] API ${apiName} is already initialized!`));
              return;
            }

            logger.info(`[HTTP-Server] API ${apiModule.name} successfully initialized.`);
            apies[apiName] = apiModule;
          }
        }
      }
    });

    resolve(apies);
  });
}

export default class HttpServer {
  #server = null;

  #app = null;

  #api = {};

  static apiDirs = [
    // Default path for core http module apies
    path.join('core', 'http', 'api'),
  ];

  /**
   * @class
   * @this HttpServer
   */
  constructor() {
    this.#app = express();
  }

  /**
   * Добавление директорию для инициализации api модулей для http сервера
   * Путь начинается с папки src\/* и должен заканчиваться на папку *\/api
   * @static
   * @public
   * @param {string} apiPath
   * @returns {void}
   */
  static addWalkDirApi(apiPath) {
    if (!apiPath) return;

    const dirs = apiPath.split('/');
    if (dirs[dirs.length - 1] !== 'api') return;

    this.constructor.apiDirs.push(apiPath);
  }

  /**
   * Инициализация АПИ методов
   * @async
   * @private
   * @this HttpServer
   * @returns {Promise<void>}
   */
  async #initApi() {
    for (const pathDir of this.constructor.apiDirs) {
      const pathToRead = path.join(__dirname, 'src', pathDir);
      const resultApies = await readDir(pathToRead);
      Object.assign(this.#api, resultApies);
    }
  }

  /**
   * Инициализация приложения express
   * @async
   * @private
   * @this HttpServer
   * @returns {Promise<void>}
   */
  async #initExpress() {
    // Configure middlewares
    this.#app.use(express.json());
    this.#app.use(express.urlencoded({ extended: true }));

    // TODO: написать шаблонизатор для генерации динамики
    this.#app.use('/', express.static('public'));

    // Роутинг GET-методов
    // this._app.get("/api/:apiName.json", (req, res) => this.#responseHandler(req, res, 'GET'));
  }

  /**
   * Инициализация HTTP-сервера
   * @async
   * @public
   * @this HttpServer
   * @returns {Promise{void}}
   */
  async init() {
    await this.#initApi();

    await this.#initExpress();

    // Initialize http-server
    this.#server = http.createServer(this.#app);

    const options = {
      host: DEFAULT_HTTP_HOST,
      port: DEFAULT_HTTP_PORT,
    };

    // Listen http-server
    this.#server.listen(options, () => {
      logger.info(`[HTTP-Server] Successfully started API http-server on \
      ${options.host}:${options.port}`);
    });
  }

  /**
   * Остановка HTTP-сервера
   * @async
   * @public
   * @this HttpServer
   * @returns {Promise<void>}
   */
  async stop() {
    if (this.#server && typeof this.#server.close === 'function') return;

    await new Promise((resolve, reject) => {
      try {
        this.#server.close(() => {
          logger.info('[HTTP-Server] Successfully stopped.');
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}
