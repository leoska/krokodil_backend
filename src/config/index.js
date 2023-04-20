import dotevt from "dotenv";

class Config {
    NODE_ENV = 'testing';

    constructor() {
        dotevt.config();

        this.NODE_ENV = process.env.NODE_ENV;
    }
}

const config = new Config();

Object.freeze(config);

export default config;