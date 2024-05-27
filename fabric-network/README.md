# Basic setup with CLI
This example shows how to setup sample blockchain Fabric network with six departments (organizations) based on imaganed use case of [Podjetje](https://www.dpp.podjetje.si/). Sample shows how to setup folder structure to correctly run basic setup with CLI. All important operations through set up of basic fabric network are divided by parts that have an important roles into specific scripts located in `scripts/` folder.

# How to run this sample?
Move into `basic-cli-setup` folder. You have few choices how you will setup fabric network. You need to specify parameters and flags for specific setups. Most basic setup of fabric network is only setting up components of fabric network. You achive this with following command:
```sh
 ./start.sh up
 ```
 For setting up network components (organizations) and creating main channel `dppchannel`:
```sh
 ./start.sh up createChannel
 ```
 Above commands generates all crypto material (certificates) with `cryptogen` tool used in fabric binaries docker container. </br>
 Below command sets up Fabric CAs containers from `fabric-ca` docker image and which later on creates cyrpto material (certificates) for each organization.
 ```sh
 ./start.sh up createChannel -ca
 ```
 You can also use script's help: `./start.sh help`.</br>
You should see a lot of logs during proccess. At the end chaincode is instantiated through `peer cahincode inovke` CLI command and you should see in Docker running new containers that running deployed chaincodes for peers. This command also populates ledger with some assets - invokes `initLedger` transaction ("function") from chaincode.
 Last step in described proccess is querying the ledger with command: `peer chaincode query` which creates transaction `GetAllAssets`. So the last output from shell should be:
 ```json
Chaincode invoke successful. result: status:200 
[{"AppraisedValue":300,"Color":"blue","ID":"asset1","Owner":"Tomoko","Size":5,"docType":"asset"},{"AppraisedValue":400,"Color":"red","ID":"asset2","Owner":"Brad","Size":5,"docType":"asset"},{"AppraisedValue":500,"Color":"green","ID":"asset3","Owner":"Jin Soo","Size":10,"docType":"asset"},{"AppraisedValue":600,"Color":"yellow","ID":"asset4","Owner":"Max","Size":10,"docType":"asset"},{"AppraisedValue":700,"Color":"black","ID":"asset5","Owner":"Adriana","Size":15,"docType":"asset"},{"AppraisedValue":800,"Color":"white","ID":"asset6","Owner":"Michel","Size":15,"docType":"asset"}]
 ```
 For more informations take a look into scripts and comments in scripts in `scripts` folder.
 > **_NOTE:_** This sample is using only Docker container `cli` based on [fabric-tools](https://hub.docker.com/r/hyperledger/fabric-tools) Docker image which provides CLI with tools for fabric networks. All interactions with sample fabric networks are done inside Docker network `fabric_test` through running `cli` docker container located in docker network. CLI doesn't uses discovery service so all peers in sample fabric network are known.
# What is happening behind the scenes?
## Generating crypto material using cryptogen tool
All certificates are generated using cryptogen tool. It is done with one simple command in fabric binaries running container like this:
```sh
cryptogen generate --config=./organizations/cryptogen/crypto-config-alu-izlake-manufacture.yaml --output="organizations" # Generate crypto material for Podjetje Izlake manufacture
```
Command creates crypto material in mounted folder `organizations/`. Configurations for crypto materials are stored in yaml files in `organizations/cryptogen/` folder. Above command is repeated for each organization. 
## Setting up Fabric Certificate Authorities and generating certs

```sh
cryptogen generate --config=./organizations/cryptogen/crypto-config-alu-izlake-manufacture.yaml --output="organizations" # Generate crypto material for Podjetje Izlake manufacture
```
## Setting up and connecting all network together
1. run script `setUpMyChannel.sh`

    Scripts creates `dppchannel's` genesis, configuration block in `channel-artifacts/dppchannel.block` with:
    ```sh
    configtxgen -profile SixOrgsApplicationGenesis -outputBlock $PWD/channel-artifacts/dppchannel.block -channelID dppchannel
    ```
    Before command run profile for six organizations was created in `config/configtx.yaml`. Have a look into this yaml configuration file for details.
    After creation of genesis configuration block for channel dppchannel we can create and deploy channel `dppchannel` to `orderer peer(s)`. This is done with following command:
    ```sh
    osnadmin channel join --channelID dppchannel --config-block ${PWD}/channel-artifacts/dppchannel.block -o orderer.dpp.podjetje.si:7053 --ca-file "$ORDERER_CA" --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY" # Set up channel dppchannel
    ```
2. run script `joinPeersToMyChannel.sh`

    After creation and deployment of created channel to orderer peer(s) we need to remotely connect to each peer and join it to created channel with help of a created genesis configuration block in `channel-artifacts`. Here are done two steps for each known peer (every organization currently has only one peer named <b>peer0</b>). First step is to set enviroment variables which helps us to remotely connect to peers (Following command shows example of setting enviroment variables for manufacture Izlake, for concrete sample have a look into [joinPeersToMyChannel.sh](scripts/joinPeersToMyChannel.sh)):
    ```sh
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="proizvodnja2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/peers/peer0.proizvodnja2.dpp.podjetje.si/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/users/Admin@proizvodnja2.dpp.podjetje.si/msp
    export CORE_PEER_ADDRESS=peer0.proizvodnja2.dpp.podjetje.si:7051
    ```
    When are enviroment variables set we can connect remotely directly to (each) peer with `peer` command in Docker `cli` container:
    ```sh
    peer channel join -b $BLOCKFILE
    ```
    We need to repeat this proccess for each peer (known organizations).
3. run script `setupAnchorPeers.sh`

    After joining peers to channel we need to setup Anchor peers in `dppchannel` of fabric network. Usually every organization has at least one peer as Anchor peer in each channel. First step is to set enviroment variables to connect remotely to each peer and run following commands to parse configuration of channel and modify conufiguration to include new Anchor peer:
    ```sh
    peer channel fetch config "${PWD}/config_block.pb" -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si -c dppchannel --tls --cafile $ORDERER_CA
    configtxlator proto_decode --input "${PWD}/config_block.pb" --type common.Block --output "${PWD}/config_block.json"
    jq '.data.data[0].payload.data.config' "${PWD}/config_block.json" > "${PWD}/proizvodnja2MSPconfig.json"
    jq '.channel_group.groups.Application.groups.proizvodnja2MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.proizvodnja2.dpp.podjetje.si","port": 7051}]},"version": "0"}}' "${PWD}/proizvodnja2MSPconfig.json" > "${PWD}/proizvodnja2MSPmodified_config.json"
    configtxlator proto_encode --input "${PWD}/proizvodnja2MSPconfig.json" --type common.Config --output "${PWD}/original_config.pb"
    configtxlator proto_encode --input "${PWD}/proizvodnja2MSPmodified_config.json" --type common.Config --output "${PWD}/modified_config.pb"
    configtxlator compute_update --channel_id dppchannel --original "${PWD}/original_config.pb" --updated "${PWD}/modified_config.pb" --output "${PWD}/config_update.pb"
    configtxlator proto_decode --input "${PWD}/config_update.pb" --type common.ConfigUpdate --output "${PWD}/config_update.json"
    echo '{"payload":{"header":{"channel_header":{"channel_id":"dppchannel", "type":2}},"data":{"config_update":'$(cat $PWD/config_update.json)'}}}' | jq . > "${PWD}/config_update_in_envelope.json"
    #cat "${PWD}/config_update.json"
    configtxlator proto_encode --input "${PWD}/config_update_in_envelope.json" --type common.Envelope --output "${PWD}/proizvodnja2MSPanchors.tx"
    # Update channel dppchannel
    peer channel update -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si -c dppchannel -f ${PWD}/${CORE_PEER_LOCALMSPID}anchors.tx --tls --cafile $ORDERER_CA
    ```
    We need to run these commands for each peer which is going to be Anchor peer. For more details have a look into [setupAnchorPeers.sh](scripts/setupAnchorPeers.sh).
4. run script `installChaincodeOnPeers.sh`

    When we joined all known peers (organizations) to channel `dppchannel` we can deploy and install typescript's compiled chaincode in tar.gz format to each peer.  First step is to create chaincode's package in tar.gz format and export `packageid`:
    ```sh
    peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ${CC_SRC_PATH} --lang node --label ${CC_NAME}_${CC_VERSION}
    export CC_PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid ${CC_NAME}.tar.gz)
    ```
    After exporting `packageid` of chaincode we can connect to each peer remotely with <b>help of a settting enviroment variables for each peer</b> and query currently installed chaincode on each peer (every peer should have no chaincodes installed at the moment). This is done with commands:
    ```sh
    peer lifecycle chaincode queryinstalled --output json | jq -r 'try (.installed_chaincodes[].package_id)' | grep ^${PACKAGE_ID} # Check if any chaincode is currently installed on each peer
    peer lifecycle chaincode install ${CC_NAME}.tar.gz # Install packed chaincode on peers
    ```
    After installing chaincode we need to approve chaincode for each organization on each peer, check commit readiness and query committed chaincode with following commands:
    ```sh
    peer lifecycle chaincode approveformyorg -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si --tls --cafile "${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/msp/tlscacerts/tlsca.dpp.podjetje.si-cert.pem" --channelID dppchannel --name $CC_NAME --version $CC_VERSION --package-id $CC_PACKAGE_ID --sequence 1 --init-required
    peer lifecycle chaincode checkcommitreadiness --orderer orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si --tls --cafile "${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/msp/tlscacerts/tlsca.dpp.podjetje.si-cert.pem" --channelID dppchannel --name $CC_NAME --version $CC_VERSION --sequence 1 --init-required
    peer lifecycle chaincode querycommitted --channelID dppchannel --name $CC_NAME
    ```
    For more details have a look into [installChaincodeOnPeers.sh](scripts/installChaincodeOnPeers.sh)
5. run script `commitChaincodeToMyChannel.sh`

    When all organizations approved installed chaincode for itself, we can commit chaincode to channel `dppchannel` beacuse we met endorsement policy. Commit is done with the following command:
    ```sh
    # Commit approved chaincode to channel dppchannel, we need specify all endorsers peers to confirm commit chaincode to channel transaction insured by one of the peers
    peer lifecycle chaincode commit -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si --tls --cafile $ORDERER_CA --channelID dppchannel --peerAddresses "peer0.nv2c.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/nv2c.dpp.podjetje.si/peers/peer0.nv2c.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.proizvodnja1.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/peers/peer0.proizvodnja1.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.warehouses.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/warehouses.dpp.podjetje.si/peers/peer0.warehouses.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.nadzor.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/nadzor.dpp.podjetje.si/peers/peer0.nadzor.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.sellers.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/sellers.dpp.podjetje.si/peers/peer0.sellers.dpp.podjetje.si/tls/ca.crt" --name $CC_NAME --version $CC_VERSION --sequence 1 --init-required
    # Query committed chaincode in channel dppchannel
    peer lifecycle chaincode querycommitted --channelID dppchannel --name $CC_NAME
    ```
    > **_NOTE:_** When committing with CLI we need to specify all endorser peers because CLI doesn't use discovery service.
6. run script `invokeChaincode.sh`

    When chaincode is committed to channel `dppchannel` we can invoke chaincode with init function, transaction defined in chaincode named: `initLedger`. After success command execution we should see new containers running in Docker. We need to use following command:
    ```sh
    peer chaincode invoke -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si --tls --cafile "${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/msp/tlscacerts/tlsca.dpp.podjetje.si-cert.pem" -C dppchannel -n basic --peerAddresses "peer0.nv2c.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/nv2c.dpp.podjetje.si/peers/peer0.nv2c.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.proizvodnja1.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/peers/peer0.proizvodnja1.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.warehouses.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/warehouses.dpp.podjetje.si/peers/peer0.warehouses.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.nadzor.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/nadzor.dpp.podjetje.si/peers/peer0.nadzor.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.sellers.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/sellers.dpp.podjetje.si/peers/peer0.sellers.dpp.podjetje.si/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}' --isInit # ! isInit
    ```
    > **_NOTE:_** When committing with CLI we need to specify all endorser peers because CLI doesn't use discovery service.
7. run script `queryChaincode.sh`

    At the end we can check if sample fabric network works with deployed chaincode with command:
    ```sh
    peer chaincode query -C dppchannel -n basic -c '{"Args":["GetAllAssets"]}'
    ```
    Command behind the scenes invokes transaction named `GetAllAssets`.

# Sample client application with Fabric Gateway to interact with fabric network
In `application-gateway-typescript` folder is located application written in typescript which is using [Hyperledger fabric Node.js SDK](https://github.com/hyperledger/fabric-sdk-node) for using discovery service and interactions with created fabric network explained in the past. First step is to move into `application-gateway-typescript` folder and run following commands to install dependencies and build, compile sample client application:
```npm
npm install
npm run build
```
If compaile proccess succeded you can run sample application with command:
```npm
npm start
```
Application should start in a terminal and you will see some outputs of interaction with fabric network.
Ahoy! And that's it!

# Private data, private transactions
Hyperledger fabric has ability if we have cases where a group of organizations on a channel need to keep data private from other organizations on that channel, they have the option to create a new channel comprising just the organizations who need access to the data. 