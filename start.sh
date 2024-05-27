# Podjetje Produkt
# Skripta za vzpostavitev celotne infrastrukture v (lokalnem) Docker okolju
cd fabric-network/docker-fabric-binaries
# docker build -t fabric-binaries . # Build CLI orodja za izvajanje ukazov v izoliranem okolju omrežja - generiranje crypto materiala
cd ../
bash start.sh up -ca createChannel # Vzpostavitev celotne infrastrukture z ustvarjanje vseh potrebnih certifikatov za delovanje Fabric omrežja
cd ../api/
docker build -t dpp-api . # Build API Docker slike za ustvarjanje Produkt DPL-jev, dodajanje korakov livnega stroja in tople valjarne in branje
# docker run --name api.proizvodnja2.dpp.podjetje.si -p 5000:8000 --network fabric_test dpp-api
