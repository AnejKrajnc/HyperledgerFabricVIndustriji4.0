import * as env from 'env-var';
import * as dotenv from "dotenv";

dotenv.config();

export const peerName = env.get("PEER_NAME").required().asString();
export const peerAddress = env.get("PEER_ADDRESS").required().asString();
export const peerAddressSSL = env.get("PEER_ADDRESS_SSL").required().asString();
export const peerPort = env.get("PEER_PORT").required().asInt();
export const peerCert = env.get("PEER_CERT").required().asString();
export const msp = env.get("MSP").required().asString();
export const vlivalniStrojCert = env.get("VLIVALNI_STROJ_CERT").required().asString();
export const vlivalniStrojPrivKey = env.get("VLIVALNI_STROJ_PRIVKEY").required().asString();
export const oblikovniStrojCert = env.get("OBLIKOVNI_STROJ_CERT").required().asString();
export const oblikovniStrojPrivKey = env.get("OBLIKOVNI_STROJ_PRIVKEY").required().asString();
export const channelName = env.get("CHANNEL_NAME").required().asString();
export const chaincodeName = env.get("CHAINCODE_NAME").required().asString();