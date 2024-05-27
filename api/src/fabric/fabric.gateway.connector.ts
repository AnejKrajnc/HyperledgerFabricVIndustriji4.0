import {Client} from "@grpc/grpc-js";
import fs from "fs/promises";
import path from "path";
import * as grpc from "@grpc/grpc-js";
import {connect, Contract, Gateway, Identity, signers} from "@hyperledger/fabric-gateway";
import crypto, {PrivateKeyInput} from "crypto";
import {TextDecoder, TextEncoder} from "util";

/**
 * Author: Anej Krajnc, Inova IT d.o.o.
 */
interface FabricGatewayConnectorOptions {
    peerName: string;
    peerAddress: string;
    peerAddressSSL: string;
    port: number;
    mspID: string;
}

export interface UserIdentity {
    credentials: {
        certificate: string;
        privateKey: string;
    },
    mspId: string;
    type: string;
    role: string | undefined;
}

export interface PeerCert {
    tls: {
        certificate: string;
    }
}

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();

export class FabricGatewayConnector {
    settings: FabricGatewayConnectorOptions;
    client?: grpc.Client;
    tlsRootCert?: Buffer;
    tlsCredentials?: grpc.ChannelCredentials;
    constructor(options: FabricGatewayConnectorOptions) {
        this.settings = options;
    }

    async loadCredentials(peerCert: PeerCert) {
        if (peerCert) {
            this.tlsRootCert = Buffer.from(peerCert.tls.certificate)
            this.tlsCredentials = grpc.credentials.createSsl(this.tlsRootCert);
        }
        else
            throw new Error("Cannot load credentials for peer: " + this.settings.peerName);
    }

    async createClient() {
        if (this.tlsCredentials) {
            this.client = new grpc.Client(`${this.settings.peerAddress}:${this.settings.port}`, this.tlsCredentials, {
                'grpc.ssl_target_name_override': this.settings.peerAddressSSL
            });
        }
        else {
            throw new Error("TLS credentials are not loaded");
        }
    }
    async connectGateway(userIdentity: UserIdentity): Promise<Gateway> {
        if (userIdentity) {
            const privateKeyPem = {key: userIdentity?.credentials.privateKey} as PrivateKeyInput;
            const privateKey = crypto.createPrivateKey(privateKeyPem);
            const orgIdentity: Identity = { mspId: this.settings.mspID, credentials: utf8Encoder.encode(userIdentity?.credentials.certificate)};
            const signer = signers.newPrivateKeySigner(privateKey);
            // @ts-ignore
            if (this.client) {
                const gateway = await connect({
                    client: this.client,
                    identity: orgIdentity,
                    signer: signer
                });
                return gateway;
            }
            else {
                throw new Error("Client is not set - gRPC connection to peer is not established!");
            }
        }
        else {
            throw new Error("Identity doesn't exist in wallet!");
        }
    }

    getContractOnChannel(gateway: Gateway, channelName: string, chaincodeName: string, contractName?: string): Contract {
        return gateway.getNetwork(channelName).getContract(chaincodeName, contractName);
    }
    close() {
        if (this.client)
            this.client.close();
    }
}