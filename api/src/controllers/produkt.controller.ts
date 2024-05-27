import {NextFunction, Request, Response} from "express";
import {fabricConnector, livniStrojIdentity, toplaValjarnaIdentity} from "../index";
import {TextDecoder} from "util";
import {X509Certificate} from "crypto";
import {validationResult} from "express-validator";
import {chaincodeName, channelName} from "../config";

const utf8Decoder = new TextDecoder();

export const CreateProduktDPP = async (req: Request, res: Response, next: NextFunction) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res.status(400).json(validation.array());
    }

    try {
        // @ts-ignore
        const gateway = await fabricConnector.connectGateway(livniStrojIdentity);
        const contract = fabricConnector.getContractOnChannel(gateway, channelName, chaincodeName, "ALUOTKolutDPPContract");

        let submittedTransaction = await contract.submitAsync("CreateOTKolutDPP", {
            arguments: [JSON.stringify(req.body)]
        });

        res.json({
            Status: utf8Decoder.decode(submittedTransaction.getResult()),
            TxID: submittedTransaction.getTransactionId()
        });
        next();
        gateway.close();
    }
    catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}

export const ReadProduktDPP = async (req: Request, res: Response, next: NextFunction) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res.status(400).json(validation.array());
    }

    try {
        // @ts-ignore
        const gateway = await fabricConnector.connectGateway(livniStrojIdentity);
        const contract = fabricConnector.getContractOnChannel(gateway, channelName, chaincodeName, "ProduktDPPContract");
        const dppID = `${req.params.sarza}/${req.params.kolut}`;
        let result = await contract.evaluateTransaction("ReadProduktDPP", dppID);
        const DPPJSON = JSON.parse(utf8Decoder.decode(result));
        const clientCert = new X509Certificate(gateway.getIdentity().credentials);
        DPPJSON.client = {
            issuer: clientCert.issuer,
            infoAddress: clientCert.infoAccess,
            subject: clientCert.subject,
            subjectAltName: clientCert.subjectAltName
        };
        res.json(DPPJSON);
        next();
        gateway.close();
    }
    catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}

export const AddVlivalniStrojPhaseParametersMeasurements = async (req: Request, res: Response, next: NextFunction) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res.status(400).json(validation.array());
    }

    const dppID = `${req.params.sarza}/${req.params.zavoj}`;

    try {
        // @ts-ignore
        const gateway = await fabricConnector.connectGateway(livniStrojIdentity);
        const contract = fabricConnector.getContractOnChannel(gateway, channelName, chaincodeName, "ProduktDPPContract");
        let submittedTransaction = await contract.submitAsync("AddVlivalniStrojParametersMeasurements", {
            arguments: [
                dppID,
                JSON.stringify(req.body)
            ]
        });

        res.json({
            Status: utf8Decoder.decode(submittedTransaction.getResult()),
            TxID: submittedTransaction.getTransactionId()
        });
        next();
        gateway.close();
    }
    catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}

export const AddOblikovalniStrojPhaseParametersMeasurements = async (req: Request, res: Response, next: NextFunction) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res.status(400).json(validation.array());
    }

    const dppID = `${req.params.sarza}/${req.params.kolut}`;

    try {
        // @ts-ignore
        const gateway = await fabricConnector.connectGateway(toplaValjarnaIdentity);
        const contract = fabricConnector.getContractOnChannel(gateway, channelName, chaincodeName, "ProduktDPPContract");
        let submittedTransaction = await contract.submitAsync("AddOblikovalniStrojParametersMeasurements", {
            arguments: [
                dppID,
                JSON.stringify(req.body.AddToplaValjarnaParametersMeasurements)
            ]
        });

        res.json({
            Status: utf8Decoder.decode(submittedTransaction.getResult()),
            TxID: submittedTransaction.getTransactionId()
        });
        next();
        gateway.close();
    }
    catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}