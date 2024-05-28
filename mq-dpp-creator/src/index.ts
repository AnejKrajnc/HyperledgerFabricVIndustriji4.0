import {
    chaincodeName,
    channelName,
    vlivniStrojCert,
    vlivniStrojPrivKey,
    msp, produktDPPQueueName,
    peerAddress,
    peerAddressSSL, peerCert,
    peerName,
    peerPort, publicApiUrl,
    oblikovniStrojCert, oblikovniStrojPrivKey
} from "./config";
import {FabricGatewayConnector, UserIdentity} from "./fabric/fabric.gateway.connector";
import fs from "fs";
import {Queue, Worker} from "bullmq";
import {redisConnection} from "./redis-connection";
import {add, createLogger, format, transports} from "winston";
import {
    VlivniStrojParametersMeasurements,
    ProduktDPP,
    ProduktDPPCreation,
    ProduktDPPVlivniStrojPhaseCreation
} from "./types";

// Ignore log messages if they have { private: true }
const ignorePrivate = format((info, opts) => {
    if (info.private) { return false; }
    return info;
});

const logger = createLogger({
    format: format.combine(
        ignorePrivate(),
        format.json()
    ),
    transports: [new transports.Console()]
});

export const fabricConnector = new FabricGatewayConnector({
    peerName: peerName,
    peerAddress: peerAddress,
    port: peerPort,
    peerAddressSSL: peerAddressSSL,
    mspID: msp
});

export const vlivniStrojIdentity: UserIdentity = {
    credentials: {
        certificate: fs.readFileSync(vlivniStrojCert).toString('utf-8'),
        privateKey: fs.readFileSync(vlivniStrojPrivKey).toString('utf-8'),
    },
    mspId: msp,
    type: "client",
    role: "client"
};

export const oblikovniStrojIdentity: UserIdentity = {
    credentials: {
        certificate: fs.readFileSync(oblikovniStrojCert).toString('utf-8'),
        privateKey: fs.readFileSync(oblikovniStrojPrivKey).toString('utf-8')
    },
    mspId: msp,
    type: "client",
    role: "client"
};

fabricConnector.loadCredentials({
    tls: {
        certificate: fs.readFileSync(peerCert).toString('utf-8')
    }
});

fabricConnector.createClient();

var currentZavojData: ProduktDPP | null = null;

// Creating for persisting latest zavoj data if DPP Creator fails and there are vlivni stroj data to be processed before new kolut
//const latestDataQueue = new Queue(produktDataQueueName, { connection: redisConnection});

const workerProduktDPP = new Worker(produktDPPQueueName, async (job: any, token: any) => {
        if (job.name === "ProduktDPPCreation") {
            logger.log({
                level: 'info',
                message: `Job started for Produkt DPP creation with data: ${JSON.stringify(job.data.zavojData as ProduktDPP)}`
            });

            currentZavojData = job.data.kolutData as ProduktDPP; // Setting current Kolut in production at OT for incoming manufacture phases
            /* latestDataQueue.add("latestZavoj", {
                kolutData: currentZavojData
            }); */

            try {
                // @ts-ignore
                const gateway = await fabricConnector.connectGateway(vlivniStrojIdentity);
                const contract = fabricConnector.getContractOnChannel(gateway, channelName, chaincodeName, "ProduktDPPContract");

                let submittedTransaction = await contract.submitAsync("CreateProduktDPP", {
                    arguments: [JSON.stringify(job.data.zavojData as ProduktDPP)]
                });

                const createdOTKolutDPP: ProduktDPPCreation = {
                    status: await submittedTransaction.getStatus(),
                    txID: submittedTransaction.getTransactionId(),
                    zavojData: currentZavojData
                };

                // TODO - Post created Produkt DPP to API
                /* const responsePostCreatedProduktDPP = await fetch(`${publicApiUrl}/produkt/dpp`, {
                    method: 'POST',
                    body: JSON.stringify(createdProduktDPP)
                });

                if (responsePostCreatedProduktDPP.status == 200) {
                    logger.log({
                        level: 'info',
                        message: 'New Produkt DPP successfully posted to API'
                    });
                    // TODO - additional checking, processing
                } else {
                    logger.log({
                        level: 'error',
                        message: 'Error occurred when  trying to post new Produkt DPP to API'
                    });
                    // TODO - additional checking, processing of error posting new Produkt DPP
                } */

                gateway.close();
            } catch (e) {
                logger.info({
                    level: 'error',
                    message: `Failed to submit transaction for DPP creation for Produkt - Cause: ${JSON.stringify(e)}`
                });
                throw e; // job has failed
            }
        }
        else if (job.name === "ProduktDPPVlivniStrojPhase") {
            if (currentZavojData != null) {
                logger.log({
                    level: 'info',
                    message: `Job started for Produkt DPP vlivni stroj phase with data: ${JSON.stringify(job.data)}`
                });
                const dppID = `${currentZavojData.Sarza}/${currentZavojData.Zavoj}`;

                try {
                    // @ts-ignore
                    const gateway = await fabricConnector.connectGateway(vlivniStrojIdentity);
                    const contract = fabricConnector.getContractOnChannel(gateway, channelName, chaincodeName, "ProduktDPPContract");
                    let submittedTransaction = await contract.submitAsync("AddVlivniStrojParametersMeasurements", {
                        arguments: [
                            dppID,
                            JSON.stringify(job.data.vlivniStrojParametersMeasurements)
                        ]
                    });

                    /*const addedLivniStrojParametersMeasurementsOTKolutDPP: OTKolutDPPLivniStrojPhaseCreation = {
                        status: await submittedTransaction.getStatus(),
                        txID: submittedTransaction.getTransactionId(),
                        kolutData: currentKolutData,
                        livniStrojParametersMeasurements: job.data.livniStrojParametersMeasurements
                    };

                    // TODO - Post created OT Kolut DPP to API
                    const responsePostedLivniStrojPhase = await fetch(`${publicApiUrl}/ot-kolut/dpp/add-livni-stroj-parameters-measurements`, {
                        method: 'POST',
                        body: JSON.stringify(addedLivniStrojParametersMeasurementsOTKolutDPP)
                    });

                    if (responsePostedLivniStrojPhase.status == 200) {
                        logger.log({
                            level: 'info',
                            message: 'Livni Stroj phase of OT Kolut DPP successfully posted to API'
                        });
                        // TODO - additional checking, processing
                    } else {
                        logger.log({
                            level: 'error',
                            message: 'Error occurred when  trying to add Livni Stroj phase to OT Kolut DPP to API'
                        });
                        // TODO - additional checking, processing of error posting new OT Kolut DPP
                    }*/

                    gateway.close();
                } catch (e) {
                    logger.info({
                        level: 'error',
                        message: `Failed to submit transaction for Produkt DPP vlivni stroj phase ${JSON.stringify(e)}`
                    });
                    throw e
                }
            } else logger.log({
                level: 'info',
                message: 'Vlivni Stroj phase parameters and measurements received but zavoj data is not present!'
            });
        }
        else logger.log({
                level: 'info',
                message: `Received job from queue does not exist with name: ${job.name}`
            });
},
    {connection: redisConnection});

workerProduktDPP.on('completed', async job => {
    logger.log({
        level: 'info',
        message: `Job with action: ${job.name} and with data: ${JSON.stringify(job.data)} has been completed`
    });
});

workerProduktDPP.on('failed', async job => {
    logger.log({
        level: 'error',
        message: `Job with action: ${job?.name} and with data: ${JSON.stringify(job?.data)} failed!`
    });
});

logger.log({
    level: 'info',
    message: 'Produkt DPP Creator Worker has started!'
});