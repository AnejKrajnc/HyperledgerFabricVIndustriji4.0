/*
* Podjetje digital passport for proizvodnja2 on platform
*/
import {Object, Property} from 'fabric-contract-api';

@Object()
export class VlivalniStrojParametersMeasurements {
    @Property()
    public NIVO_BIZETA: number;
    @Property()
    public TEM_TALINE: number;
    @Property()
    public TEMP_VODE: number;
    @Property()
    public TLAK_VODE_ZHS: number;
    @Property()
    public LIVNA_HIT: number;
    @Property()
    public HITROST_HV: number;
    @Property()
    public DISKI: number;
    @Property()
    public JK_CONA1: number;
    @Property()
    public JK_CONA2: number;
    @Property()
    public JK_CONA3: number;
    @Property()
    public JK_CONA4: number;
    @Property()
    public JK_CONA5: number;
    @Property()
    public JK_CONA6: number;
    @Property()
    public JK_CONA7: number;
    @Property()
    public JK_CONA8: number;
    @Property()
    public JK_CONA9: number;
    @Property()
    public JT_SKUP: number;
    @Property()
    public LK_CONA1: number;
    @Property()
    public LK_CONA2: number;
    @Property()
    public LK_CONA3: number;
    @Property()
    public LK_CONA4: number;
    @Property()
    public LK_CONA5: number;
    @Property()
    public LK_SKUP: number;
    @Property()
    public NIVO_LASER: number;
    @Property()
    public TempTrakPirometerPovpr: number;
    @Property()
    public TempTrakPiromPovprKolut: number;
    @Property()
    public TempTrakPiromKolutKonec: number;
    @Property()
    public PRET_VODE_VORTEX: number;
    @Property()
    public LIVNO_KOLO: number;
    @Property()
    public PRETOK_ZHS_LIV_STROJ: number;
    @Property()
    public timestamp: Date;
}
