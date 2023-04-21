import dotevt from "dotenv";

class Config {
    NODE_ENV = 'testing';
    consul_address = '172.21.0.2';
    consul_port = 8500;

    constructor() {
        dotevt.config();
        this.NODE_ENV = process.env.NODE_ENV || this.NODE_ENV;
        this.consul_address = process.env.CONSUL_HOST || this.consul_address;
        this.consul_port = Number(process.env.CONSUL_PORT || this.consul_port);
    }
}

const config = new Config();

Object.freeze(config);

export default config;