export interface ConfigTopic {
    topic: string
    //event: string
}

export type ProduktDPP = {
    Linija: string
    Sarza: number
    Kolut: number
    DatumZacetkaIzdelave?: Date
    Nalog?: number
    Sirina?: number
    Debelina?: number
    Izmena?: number
    Kvaliteta?: number
    SifraKolo?: number
}

export type VlivniStrojParametersMeasurements = {
NIVO_BIZETA: number
TEM_TALINE: number
TEMP_VODE: number
TLAK_VODE_ZHS: number
LIVNA_HIT: number
HITROST_HV: number
DISKI: number
JK_CONA1: number
JK_CONA2: number
JK_CONA3: number
JK_CONA4: number
JK_CONA5: number
JK_CONA6: number
JK_CONA7: number
JK_CONA8: number
JK_CONA9: number
JT_SKUP: number
LK_CONA1: number
LK_CONA2: number
LK_CONA3: number
LK_CONA4: number
LK_CONA5: number
LK_SKUP: number
NIVO_LASER: number
TempTrakPirometerPovpr: number
TempTrakPiromPovprKolut: number
TempTrakPiromKolutKonec: number
PRET_VODE_VORTEX: number
LIVNO_KOLO: number
PRETOK_ZHS_LIV_STROJ: number
timestamp: Date
}