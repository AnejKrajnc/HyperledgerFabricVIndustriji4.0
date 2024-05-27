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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt = __importStar(require("mqtt"));
const bullmq_1 = require("bullmq");
const config_1 = require("./config");
const redis_connection_1 = require("./redis-connection");
const fs_1 = __importDefault(require("fs"));
const livniStrojParametersMeasurementsQueue = new bullmq_1.Queue(config_1.otKolutDPPCreationQueueName, {
    connection: redis_connection_1.redisConnection
});
const mqttClient = mqtt.connect(config_1.mqttBrokerUrl, {
    username: config_1.mqttUsername,
    password: config_1.mqttPassword
});
const config = JSON.parse(fs_1.default.readFileSync("config.json", "utf-8"));
mqttClient.on("connect", () => {
    console.log("MQTT Client successfully connected!");
    // Add all topics config to subscription of these topics in MQTT
    mqttClient.subscribe(config.subscribedTopics.map((item) => item.topic), { qos: 0 });
});
mqttClient.on("message", (topic, payload, packet) => {
    const foundSubscribedTopic = config.subscribedTopics.find((item) => item.topic === topic);
    if (foundSubscribedTopic) {
        // @ts-ignore
        console.log(payload.toString("utf-8"));
    }
});
