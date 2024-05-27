import express from "express";
import * as ProduktDPPController from "../controllers/produkt.controller";
import {param, body} from "express-validator";


export const produktRouter = express.Router();

produktRouter.get("/:sarza/:zavoj",
    param("sarza").notEmpty().isNumeric(),
    param("zavoj").notEmpty().isNumeric(),
    ProduktDPPController.ReadProduktDPP);

produktRouter.post("/create-dpp",
    body("Sarza").notEmpty().isNumeric(),
    body("Zavoj").notEmpty().isNumeric(),
    body("Linija").notEmpty().isString(),
    body("DatumZacetkaIzdelave").notEmpty().isString(),
    ProduktDPPController.CreateProduktDPP);

produktRouter.post("/:sarza/:zavoj/add-vlivalni-stroj-parameters-measurements",
    body().notEmpty(),
    ProduktDPPController.AddVlivalniStrojPhaseParametersMeasurements);

produktRouter.post("/:sarza/:zavoj/add-oblikovalni-stroj-parameters-measurements",
    body().notEmpty(),
    ProduktDPPController.AddOblikovalniStrojPhaseParametersMeasurements);