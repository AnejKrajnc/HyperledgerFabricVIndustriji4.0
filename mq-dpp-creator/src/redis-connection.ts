import {Redis, RedisOptions} from "ioredis";
import {redisHost, redisPort} from "./config";

const redisConnectioncConfig: RedisOptions = {
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null
};

export const redisConnection = new Redis(redisConnectioncConfig);