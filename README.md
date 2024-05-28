# Podjetje Produkt DPP 
Vzpostavitev digitalnega potnega lista s tehnologijo Hyperledger Fabric v okviru projekta Podjetje Produkt
## Vzpostavitev celotne infrastrukture
Zagon skripte v korenskem direktoriju (Kratek opis postopka opisan v SH datoteki):
```sh
 ./start.sh
 ```
## Infrastruktura Fabric omrežja
Celotna predstavitev arhitekture in infrastrukture omrežja Fabric za potrebe vzpostavitve DPL na proizvodni liniji Proizvodnja2 v proizvodnem obratu Produkt je opisana v obliki Docker Compose datoteke v `fabric-network/compose`.
## Certifikati organizacij za delovanje omrežja Fabric
Vsi potrebni certifikati in njihovo generiranje je združeno v direktorij `fabric-network/organizations`.
## Pametna pogodba za DPL na proizvodni liniji produktov v obratu Proizvodnja2
Vsa izvorna koda pametne pogodbe v okviru DPL za produkte izdelane v obratu proizvodnja 2 je združena v `fabric-network/chaincode/produkt-dpp`.