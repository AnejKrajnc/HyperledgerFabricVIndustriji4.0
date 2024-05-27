import express, { NextFunction, Request, Response } from "express";
import * as bodyParser from "body-parser";
const app = express();
import helmet from "helmet";
const winston = require("winston");
const expressWinston = require("express-winston");
import {
    vlivalniStrojCert,
    vlivalniStrojPrivKey,
    msp,
    peerAddress,
    peerAddressSSL, peerCert,
    peerName,
    peerPort,
    oblikovniStrojCert, oblikovniStrojPrivKey
} from "./config";
import {FabricGatewayConnector, UserIdentity} from "./fabric/fabric.gateway.connector";
import {produktRouter} from "./routes/produkt.routes";
import fs from "fs";

export const fabricConnector = new FabricGatewayConnector({
    peerName: peerName,
    peerAddress: peerAddress,
    port: peerPort,
    peerAddressSSL: peerAddressSSL,
    mspID: msp
});

export const livniStrojIdentity: UserIdentity = {
    credentials: {
        certificate: fs.readFileSync(vlivalniStrojCert).toString('utf-8'),
        privateKey: fs.readFileSync(vlivalniStrojPrivKey).toString('utf-8'),
    },
    mspId: msp,
    type: "client",
    role: "client"
};

export const toplaValjarnaIdentity: UserIdentity = {
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

app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    ),
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function (req: Request, res: Response) { return false; } // optional: allows to skip some log messages based on request and/or response
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.json({
        name: "Rest API for creating ALU DPPs"
    });
    next();
});

app.use("/ot-kolut", produktRouter);

app.listen(8000, () => {
    console.log("Server listening on port 8000");
})