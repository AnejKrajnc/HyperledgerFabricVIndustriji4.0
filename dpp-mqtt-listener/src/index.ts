import * as mqtt from "mqtt";
import {Queue, Worker} from "bullmq";
import {
    mqttBrokerPort,
    mqttBrokerUrl,
    mqttPassword,
    mqttUsername, otKolutDPPQueueName,
} from "./config";
import {redisConnection} from "./redis-connection";
import fs from "fs";
import {ConfigTopic, VlivniStrojParametersMeasurements, ProduktDPP} from "./types";
import {createLogger, format, transports} from "winston";

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

const produktDPPJobsQueue = new Queue(otKolutDPPQueueName, {
    connection: redisConnection
});


const mqttClient = mqtt.connect(mqttBrokerUrl, {
    port: mqttBrokerPort,
    username: mqttUsername,
    password: mqttPassword
});

const config = JSON.parse(fs.readFileSync("../config.json", "utf-8"));

var vlivnoKolo: number | null = null;

mqttClient.on("connect", (connack) => {
    console.log(`MQTT Client successfully connected to ${mqttBrokerUrl}`)
    logger.log({
        level: 'info',
        message: `MQTT Client Connack packet received: ${connack}`
    });
    logger.log({
        level: 'info',
        message: `MQTT Client successfully connected to ${mqttBrokerUrl}`
    });
    // Add all topics config to subscription of these topics in MQTT
    mqttClient.subscribe( config.subscribedTopics.map((item: ConfigTopic) => item.topic), { qos: 0}, (err, granted) => {
        if (err != null) {
            logger.log({
                level: 'error',
                message: `Subscribing to specified topics unsuccessful: ${err}`
            });
        }
    });
});

mqttClient.on("message", async (topic, payload, packet) => {
    const foundSubscribedTopic = config.subscribedTopics.find((item: ConfigTopic) => item.topic === topic);
    if (foundSubscribedTopic) {
        // @ts-ignore
        logger.log({
            level: 'info',
            message: `New message from topic: ${foundSubscribedTopic.topic} with content: ${payload.toString("utf-8")}`
        });
        if (foundSubscribedTopic.topic == "Podjetje/Produkt/Proizvodnja2/Zavoj/Data") {
            var zavojData: ProduktDPP = JSON.parse(payload.toString("utf-8").replace("\\\"", "'"));
            zavojData.DatumZacetkaIzdelave = new Date(); // Since there is no timestamp for available data
            await produktDPPJobsQueue.add('ProduktDPPCreation', {
                zavojData: zavojData
            });
            logger.log({
                level: 'info',
                    message: `Job for Produkt DPP creation added to queue with data: ${payload.toString("utf-8")}`
            });
        }
        else if (foundSubscribedTopic.topic == "Podjetje/Produkt/Proizvodnja2/Baza/Data") {
            const data = JSON.parse(payload.toString("utf-8").replace("\\\"", "'"));
            const lkSkupaj = data["DB_scada_povprecje.Povprecje40_1min"] + data["DB_scada_povprecje.Povprecje11_1min"] + data["DB_scada_povprecje.Povprecje12_1min"] + data["DB_scada_povprecje.Povprecje13_1min"] + data["DB_scada_povprecje.Povprecje41_1min"];
            const pretokVodeVortex = lkSkupaj + data["DB_scada_povprecje.Povprecje14_1min"];
            const datavlivniStroj: VlivniStrojParametersMeasurements = { // Opisi pomenov posameznih mapiranj v ALU API
                NIVO_BIZETA: data["DB_Laser.Laser_relativ_nivo"],
                TEM_TALINE: data["DB_scada_povprecje.Povprecje3_5min"],
                TEMP_VODE: data["DB_Scada.Temp_vode_kolo"],
                TLAK_VODE_ZHS: data["DB_scada_povprecje.Povprecje2_1min"],
                LIVNA_HIT: data["DB_Scada.Kolo_hitrost"],
                HITROST_HV: data["DB_scada_povprecje.Povprecje29_1min"],
                DISKI: data["DB_scada_povprecje.Povprecje35_1min"],
                JK_CONA1: data["DB_scada_povprecje.Povprecje3_1min"],
                JK_CONA2: data["DB_scada_povprecje.Povprecje4_1min"],
                JK_CONA3: data["DB_scada_povprecje.Povprecje5_1min"],
                JK_CONA4: data["DB_scada_povprecje.Povprecje6_1min"],
                JK_CONA5: data["DB_scada_povprecje.Povprecje7_1min"],
                JK_CONA6: data["DB_scada_povprecje.Povprecje8_1min"],
                JK_CONA7: data["DB_scada_povprecje.Povprecje9_1min"],
                JK_CONA8: data["DB_scada_povprecje.Povprecje10_1min"],
                JK_CONA9: data["DB_scada_povprecje.Povprecje39_1min"],
                JT_SKUP: data["DB_scada_povprecje.Povprecje14_1min"],
                LK_CONA1: data["DB_scada_povprecje.Povprecje40_1min"],
                LK_CONA2: data["DB_scada_povprecje.Povprecje11_1min"],
                LK_CONA3: data["DB_scada_povprecje.Povprecje12_1min"],
                LK_CONA4: data["DB_scada_povprecje.Povprecje13_1min"],
                LK_CONA5: data["DB_scada_povprecje.Povprecje41_1min"],
                LK_SKUP: lkSkupaj,
                NIVO_LASER: data["DB_Laser.Laser_relativ_nivo"],
                TempTrakPirometerPovpr: data["DB_TempPirometerTrak.TempTrakPirometerPovpr"],
                TempTrakPiromPovprKolut: data["DB_TempPirometerTrak.TempTrakPiromPovprKolut"],
                TempTrakPiromKolutKonec: data["DB_TempPirometerTrak.TempTrakPiromKolutKonec"],
                PRET_VODE_VORTEX: pretokVodeVortex,
                LIVNO_KOLO: vlivnoKolo ? vlivnoKolo : -1,
                PRETOK_ZHS_LIV_STROJ: 368.7,
                timestamp: new Date()
            };
            await produktDPPJobsQueue.add('ProduktDPPVlivniStrojPhase', {
                vlivniStrojParametersMeasurements: datavlivniStroj
            });
            logger.log({
                level: 'info',
                message: `Job for Produkt vlivni stroj phase added to queue with data: ${payload.toString("utf-8")}`
            });
        }
    }
});

mqttClient.on("reconnect", () => {
    logger.log({
        level: 'info',
        message: 'MQTT Client reconnecting to MQTT Broker'
    });
});

mqttClient.on("disconnect", (disconnect) => {
    logger.log({
        level: 'info',
        message: `MQTT Client disconnected from MQTT Broker: ${disconnect}`
    });
});

logger.log({
    level: 'info',
    message: 'Produkt DPP MQTT Listener Worker has started!'
});