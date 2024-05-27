"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const ioredis_1 = require("ioredis");
const config_1 = require("./config");
const redisConnectioncConfig = {
    host: config_1.redisHost,
    port: config_1.redisPort
};
exports.redisConnection = new ioredis_1.Redis(redisConnectioncConfig);
