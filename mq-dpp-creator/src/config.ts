import * as env from 'env-var';
import * as dotenv from "dotenv";

dotenv.config();

export const redisHost = env.get("REDIS_HOST").required().asString();
export const redisPort = env.get("REDIS_PORT").required().asPortNumber();
export const produktDPPQueueName = env.get("QUEUE_NAME").required().asString();
//export const produktDataQueueName = env.get("LATEST_ZAVOJ_DATA_QUEUE_NAME").required().asString();
export const publicApiUrl = env.get("PUBLIC_API_URL").required().asString();
export const peerName = env.get("PEER_NAME").required().asString();
export const peerAddress = env.get("PEER_ADDRESS").required().asString();
export const peerAddressSSL = env.get("PEER_ADDRESS_SSL").required().asString();
export const peerPort = env.get("PEER_PORT").required().asInt();
export const peerCert = env.get("PEER_CERT").required().asString();
export const msp = env.get("MSP").required().asString();
export const vlivniStrojCert = env.get("VLIVNI_STROJ_CERT").required().asString();
export const vlivniStrojPrivKey = env.get("VLIVNI_STROJ_PRIVKEY").required().asString();
export const oblikovniStrojCert = env.get("OBLIKOVNI_STROJ_CERT").required().asString();
export const oblikovniStrojPrivKey = env.get("OBLIKOVNI_STROJ_PRIVKEY").required().asString();
export const channelName = env.get("CHANNEL_NAME").required().asString();
export const chaincodeName = env.get("CHAINCODE_NAME").required().asString();