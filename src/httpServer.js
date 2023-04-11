import express from "express";
import http from "node:http";
import logger from "./utils/logger.js"
import fsExtra from "fs-extra";
import path from "node:path";

const DEFAULT_HTTP_HOST = "0.0.0.0";
const DEFAULT_HTTP_PORT = 8080;

const __dirname = path.resolve();


/**
 * Функция для возврата свойств файла/папки
 * 
 * @param {String} pathFile
 * @this _initApi
 * @return {Promise<(Error|null|Stats)>}
 */
function getFileStats(pathFile) {
    return new Promise((resolve, reject) => {
        fsExtra.pathExists(pathFile, (err, exists) => {
            if (err)
                reject(err);

            if (!exists)
                reject(new Error(`ENOENT: no such file or directory: [${pathFile}]`));

            fsExtra.stat(pathFile, (err, stats) => {
                if (err)
                    reject(err);

                resolve(stats);
            });
        });
    });
}


/**
 * Функция сканирования папки
 *
 * @param {String} pathDir
 * @this _initApi
 * @returns {Promise<(Error|Object.<string, BaseApi>)>}
 */
function readDir(pathDir) {
    return new Promise((resolve, reject) => {
        const pathToRead = path.join(__dirname, 'src', 'api', pathDir);
        const apies = {};

        fsExtra.readdir(pathToRead, async (err, files) => {
            if (err)
                reject(err);

            for (const file of files) {
                const filePath = path.join(pathToRead, file);

                const stats = await getFileStats(filePath);
                if (stats.isDirectory()) {
                    await readDir(path.join(pathDir, file));
                } else {
                    if (!(/^[^_].*\.js$/.test(file)))
                        continue;
                    
                    const subDirs = pathDir.split('/');
                    const apiName = (pathDir.length ? subDirs.join('.') + '.' : '') + file.substr(0, file.length - 3);
                    
                    const apiModule = (await import(filePath)).default;
                    
                    if (apiModule.isApi && apiModule.isApi()) {
                        if (apies[apiName])
                            throw new Error(`[HTTP-Server] API ${apiName} is already initialized!`);

                        logger.info(`[HTTP-Server] API ${apiModule.name} successfully initialized.`);
                        apies[apiName] = apiModule;
                    }
                }
            }
            
            resolve(apies);
        })
    });
}


export default class HttpServer {
    #server = null;
    #app = null;
    #api = null;

    constructor() {
        this.#app = express();
    }

    async #initApi() {
        this.#api = await readDir('');
    }

    async #initExpress() {
        // Configure middlewares
        this.#app.use(express.json());
        this.#app.use(express.urlencoded({ extended: true }));
        this.#app.use("/", express.static("public"));
    }

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
            logger.info(`[HTTP-Server] Successfully initialized and started API http-server on ${options.host}:${options.port}`);
        });
    }

    async stop() {
        if (this.#server && typeof(this.#server.close) === "function")
            return;
        
        return await new Promise((resolve, reject) => {
            try {
                this.#server.close(() => {
                    logger.info(`[HTTP-Server] Successfully stopped.`);
                    resolve();
                });
            } catch(e) {
                reject(e);
            }
        });
    }


}