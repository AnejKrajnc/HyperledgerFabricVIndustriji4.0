"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mqttPassword = exports.mqttUsername = exports.mqttBrokerUrl = exports.queueName = exports.redisPort = exports.redisHost = void 0;
const env = __importStar(require("env-var"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
exports.redisHost = env.get("REDIS_HOST").required().asString();
exports.redisPort = env.get("REDIS_PORT").required().asPortNumber();
exports.queueName = env.get("QUEUE_NAME").required().asString();
exports.mqttBrokerUrl = env.get("MQTT_BROKER_URL").required().asString();
exports.mqttUsername = env.get("MQTT_BROKER_USERNAME").asString();
exports.mqttPassword = env.get("MQTT_BROKER_PASSWORD").asString();
