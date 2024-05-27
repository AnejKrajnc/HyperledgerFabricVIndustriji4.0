/*
* Podjetje digital passport for proizvodnja2 on platform
*/
import {Object, Property} from 'fabric-contract-api';
import {VlivalniStrojParametersMeasurements} from './VlivalniStrojParametersMeasurements';
import {OblikovalniStrojParametersMeasurements} from './OblikovalniStrojParametersMeasurements';

@Object()
export class ProizvodniProces {
    @Property()
    public DatumZacetkaIzdelave: Date;
    @Property()
    public Linija?: string;
    @Property()
    public Izmena?: number;
    @Property()
    public SifraStroja?: number;
    @Property()
    public VlivalniStroj: VlivalniStrojParametersMeasurements[];
    @Property()
    public OblikovalniStroj: OblikovalniStrojParametersMeasurements[];
}
