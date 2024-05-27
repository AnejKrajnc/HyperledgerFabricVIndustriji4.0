// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {VlivalniStrojParametersMeasurements} from './VlivalniStrojParametersMeasurements';
import {Produkt} from './Produkt';
import {OblikovalniStrojParametersMeasurements} from './OblikovalniStrojParametersMeasurements';

// https://hyperledger-fabric.readthedocs.io/en/latest/smartcontract/smartcontract.html
@Info({title: 'ProduktDPP', description: 'Pametna pogodba za DPL produktov Podjetja'})
export class ProduktDPPContract extends Contract {
    constructor() {
        super('ProduktDPPContract');
    }
    // CreateProduktDPP issues a new Produkt DPP to the world state with given details
    @Transaction()
    public async CreateProduktDPP(ctx: Context, data: string): Promise<void> {
        const newDPPData = JSON.parse(data);

            const dppID = `${newDPPData.Sarza}/${newDPPData.Zavoj}`;
        const exists = await this.ProduktDPPExists(ctx, dppID);
        if (exists) {
            throw new Error(`Produkt DPP ${dppID} already exists`);
        }

        if (newDPPData.DatumZacetkaIzdelave === undefined) {
            throw new Error('Datum začetka izdelave is required argument!');
        }

        const dpp: Produkt = {
            ID: dppID,
            Sarza: newDPPData.Sarza,
            Zavoj: newDPPData.Kolut,
            Nalog: newDPPData.Nalog ? newDPPData.Nalog : null,
            Kvaliteta: newDPPData.Kvaliteta ? newDPPData.Kvaliteta : null,
            Dimenzije: {
                Debelina: newDPPData.Debelina ? newDPPData.Debelina : null,
                Sirina: newDPPData.Sirina ? newDPPData.Sirina : null,
            },
            proizvodniProces: {
                Linija: newDPPData.Linija,
                DatumZacetkaIzdelave: new Date(newDPPData.DatumZacetkaIzdelave),
                Izmena: newDPPData.Izmena ? newDPPData.Izmena : null,
                VlivalniStroj: [],
                OblikovalniStroj: [],
            },
        };

        const dppJSONBuffer = Buffer.from(stringify(sortKeysRecursive(dpp)));

        await ctx.stub.putState(dppID, dppJSONBuffer);
        await ctx.stub.setEvent('OTKolutDPPCreated', dppJSONBuffer); // testing events
    }

    // DeleteOTKolutDPP deletes OT Kolut DPP from world state with given dppID
    @Transaction()
    public async DeleteOTKolutDPP(ctx: Context, dppID: string): Promise<void> {
        const exists = await this.ProduktDPPExists(ctx, dppID);
        if (!exists) {
            throw new Error(`OT Kolut DPP ${dppID} does not exist`);
        }
    }

    // OTKolutDPPExists checks if OT Kolut DPP with given dppID exists in current world state
    @Transaction(false)
    @Returns('boolean')
    public async ProduktDPPExists(ctx: Context, dppID: string): Promise<boolean> {
        const dppJSON = await ctx.stub.getState(dppID);
        return dppJSON && dppJSON.length > 0;
    }

    // ReadOTKolutDPP returns OT Kolut DPP with given dppID in  current world state
    @Transaction(false)
    @Returns('string')
    public async ReadOTKolutDPP(ctx: Context, dppID: string): Promise<string> {
        const otKolutDPPJSON = await ctx.stub.getState(dppID); // get NV DPP from chaincode state
        if (!otKolutDPPJSON || otKolutDPPJSON.length === 0) {
            throw new Error(`The OT Kolut DPP ${dppID} you are trying to get does not exist!`);
        }

        return otKolutDPPJSON.toString();
    }

    // GetAllOTKolutDPPS returns all OT Kolut DPPS in current world state - It's for only dev and testing purposes, in production it's not reccommended
    @Transaction(false)
    @Returns('string')
    public async GetAllOTKolutDPPS(ctx: Context): Promise<string> {
        const allResults = [];

        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // UpdateOTKolutDPP updates SlugSeries DPP with given dppId in current world state
    @Transaction()
    public async UpdateOTKolutDPP(ctx: Context, dppID: string, updatedOTKolutDPP: string): Promise<void> {
        const exists = await this.ProduktDPPExists(ctx, dppID);
        if (!exists) {
            throw new Error(`The OT Kolut DPP ${dppID} you are trying to update does not exist!`);
        }

        const updatedproizvodnja2SeriesDPPJSON: Produkt = JSON.parse(updatedOTKolutDPP) as Produkt;

        await ctx.stub.putState(dppID, Buffer.from(stringify(sortKeysRecursive(updatedproizvodnja2SeriesDPPJSON))));
    }

    // AddLivniStrojParametersMeasurements adds new livni stroj parameters and measurements timestep to ALU OT Kolut DPP
    @Transaction()
    public async AddLivniStrojParametersMeasurements(ctx: Context, dppID: string, livniStrojParametersMeasurements: string): Promise<void> {
        const otKolutDPPJSON = await ctx.stub.getState(dppID);
        if (!otKolutDPPJSON || otKolutDPPJSON.length === 0) {
            throw new Error(`The OT Kolut DPP ${dppID} you are trying add livni stroj parameters and measurements does not exist!`);
        }

        const otKolutDPP: Produkt = JSON.parse(otKolutDPPJSON.toString());

        const livniStrojParametersMeasurementsParsed: VlivalniStrojParametersMeasurements = JSON.parse(livniStrojParametersMeasurements);

        otKolutDPP.proizvodniProces.VlivalniStroj.push(livniStrojParametersMeasurementsParsed);

        const otKolutDPPJSONBuffer = Buffer.from(stringify(sortKeysRecursive(otKolutDPP)));

        await ctx.stub.putState(dppID, otKolutDPPJSONBuffer);
        await ctx.stub.setEvent('LivniStrojParametersMeasurementsAddedToOTKolutDPP', otKolutDPPJSONBuffer); // testing events
    }

    // AddToplaValjarnaParametersMeasurements adds new topla valjarna manufacture parameters and measurements to ALU OT Kolut DPP
    @Transaction()
    public async AddToplaValjarnaParametersMeasurements(ctx: Context, dppID: string, toplaValjarnaParametersMeasurements: string): Promise<void> {
        const otKolutDPPJSON = await ctx.stub.getState(dppID);
        if (!otKolutDPPJSON || otKolutDPPJSON.length === 0) {
            throw new Error(`The OT Kolut DPP ${dppID} you are trying add topla valjarna parameters and measurements does not exist!`);
        }

        const otKolutDPP: Produkt = JSON.parse(otKolutDPPJSON.toString());

        const toplaValjarnaParametersMeasurementsParsed: OblikovalniStrojParametersMeasurements = JSON.parse(toplaValjarnaParametersMeasurements);

        otKolutDPP.proizvodniProces.OblikovalniStroj.push(toplaValjarnaParametersMeasurementsParsed);

        const otKolutDPPJSONBuffer = Buffer.from(stringify(sortKeysRecursive(otKolutDPP)));

        await ctx.stub.putState(dppID, otKolutDPPJSONBuffer);
        await ctx.stub.setEvent('ToplaValjarnaParametersMeasurementsAddedToOTKolutDPP', otKolutDPPJSONBuffer); // testing events
    }
}
