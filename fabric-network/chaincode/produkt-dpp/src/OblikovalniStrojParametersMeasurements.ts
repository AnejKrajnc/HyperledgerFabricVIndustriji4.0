import {Object, Property} from 'fabric-contract-api';

@Object()
export class OblikovalniStrojParametersMeasurements {
    @Property()
    public HITROST_HV?: number;
    @Property()
    public TLAK_EMULZIJE: number;
    @Property()
    public TEMP_VODE_KORITO: number;
    @Property()
    public TEMP_EMULZIJE: number;
    @Property()
    public Scetke_primez: number;
    @Property()
    public PRETOK_VODE_KORITO: number;
    @Property()
    public OBREMENITEV_TV: number;
    @Property()
    public HITROST_TV: number;
    @Property()
    public CONA1: number;
    @Property()
    public CONA2: number;
    @Property()
    public CONA3: number;
    @Property()
    public CONA4: number;
    @Property()
    public CONA5: number;
    @Property()
    public CONA6: number;
    @Property()
    public CONA7: number;
    @Property()
    public CONA8: number;
    @Property()
    public timestamp: Date;
}
