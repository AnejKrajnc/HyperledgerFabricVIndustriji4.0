import * as env from "env-var";
import * as dotenv from "dotenv";

dotenv.config();

export const redisHost = env.get("REDIS_HOST").required().asString();
export const redisPort = env.get("REDIS_PORT").required().asPortNumber();
export const redisPassword = env.get("REDIS_PASSWORD").asString();
export const otKolutDPPQueueName = env.get("QUEUE_NAME").required().asString();
export const mqttBrokerUrl = env.get("MQTT_BROKER_URL").required().asString();
export const mqttBrokerPort = env.get("MQTT_BROKER_PORT").default(1883).asPortNumber();
export const mqttUsername = env.get("MQTT_BROKER_USERNAME").asString();
export const mqttPassword = env.get("MQTT_BROKER_PASSWORD").asString();
