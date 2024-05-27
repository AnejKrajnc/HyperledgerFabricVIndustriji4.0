import {Object, Property} from 'fabric-contract-api';
import { ProizvodniProces } from './ProizvodniProces';

@Object()
export class Produkt {
    @Property()
    public ID: string;

    @Property()
    public Sarza: number;

    @Property()
    public Zavoj: number;

    @Property()
    public Nalog?: number;

    @Property()
    public Kvaliteta?: number;

    @Property()
    public Dimenzije: {
        Sirina?: number,
        Debelina?: number,
    };

    @Property()
    public proizvodniProces: ProizvodniProces;
}
