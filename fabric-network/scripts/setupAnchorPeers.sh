#! /bin/bash

# Doing this as proizvodnja2
#export PWD="/opt/gopath/src/github.com/hyperledger/fabric/peer"
export ORDERER_CA="${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/tlsca/tlsca.dpp.podjetje.si-cert.pem"
export ORDERER_ADMIN_TLS_SIGN_CERT="${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/tls/server.crt"
export ORDERER_ADMIN_TLS_PRIVATE_KEY="${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/tls/server.key"

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="proizvodnja2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/peers/peer0.proizvodnja2.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/users/Admin@proizvodnja2.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer0.proizvodnja2.dpp.podjetje.si:7051
export FABRIC_CFG_PATH=${PWD}/config/

export CC_SRC_PATH=${PWD}/chaincode/chaincode-typescript
export CC_NAME=basic
export CC_VERSION=1.0

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="proizvodnja2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/peers/peer0.proizvodnja2.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/users/Admin@proizvodnja2.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer0.proizvodnja2.dpp.podjetje.si:7051

echo "Setting Anchor peer peer0.proizvodnja2.dpp.podjetje.si for proizvodnja2 assembly line..."
peer channel fetch config "${PWD}/config_block.pb" -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si -c dppchannel --tls --cafile $ORDERER_CA
configtxlator proto_decode --input "${PWD}/config_block.pb" --type common.Block --output "${PWD}/config_block.json"
echo "Decoding config block to JSON and isolating config to proizvodnja2MSPconfig.json"
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
sleep 1

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="nadzorMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/nadzor.dpp.podjetje.si/peers/peer0.nadzor.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/nadzor.dpp.podjetje.si/users/Admin@nadzor.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer0.nadzor.dpp.podjetje.si:7051

echo "Setting Anchor peer peer0.nadzor.dpp.podjetje.si for nadzor..."
peer channel fetch config ${PWD}/config_block.pb -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si -c dppchannel --tls --cafile $ORDERER_CA
configtxlator proto_decode --input ${PWD}/config_block.pb --type common.Block --output ${PWD}/config_block.json
echo "Decoding config block to JSON and isolating config to nadzorMSPconfig.json"
jq '.data.data[0].payload.data.config' ${PWD}/config_block.json > "${PWD}/nadzorMSPconfig.json"
jq '.channel_group.groups.Application.groups.nadzorMSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.nadzor.dpp.podjetje.si","port": 7051}]},"version": "0"}}' ${PWD}/nadzorMSPconfig.json > "${PWD}/nadzorMSPmodified_config.json"
configtxlator proto_encode --input ${PWD}/nadzorMSPconfig.json --type common.Config --output ${PWD}/original_config.pb
configtxlator proto_encode --input ${PWD}/nadzorMSPmodified_config.json --type common.Config --output ${PWD}/modified_config.pb
configtxlator compute_update --channel_id dppchannel --original ${PWD}/original_config.pb --updated ${PWD}/modified_config.pb --output ${PWD}/config_update.pb
configtxlator proto_decode --input ${PWD}/config_update.pb --type common.ConfigUpdate --output ${PWD}/config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"dppchannel", "type":2}},"data":{"config_update":'$(cat $PWD/config_update.json)'}}}' | jq . > "${PWD}/config_update_in_envelope.json"
#cat ${PWD}/config_update.json
configtxlator proto_encode --input ${PWD}/config_update_in_envelope.json --type common.Envelope --output ${PWD}/nadzorMSPanchors.tx
# Update channel dppchannel
peer channel update -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si -c dppchannel -f ${PWD}/${CORE_PEER_LOCALMSPID}anchors.tx --tls --cafile $ORDERER_CA
sleep 1

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="proizvodnja1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/peers/peer0.proizvodnja1.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/users/Admin@proizvodnja1.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer0.proizvodnja1.dpp.podjetje.si:7051

echo "Setting Anchor peer peer0.proizvodnja1.dpp.podjetje.si for proizvodnja1..."
peer channel fetch config ${PWD}/config_block.pb -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si -c dppchannel --tls --cafile $ORDERER_CA
configtxlator proto_decode --input ${PWD}/config_block.pb --type common.Block --output ${PWD}/config_block.json
echo "Decoding config block to JSON and isolating config to proizvodnja1MSPconfig.json"
jq '.data.data[0].payload.data.config' ${PWD}/config_block.json > "${PWD}/proizvodnja1MSPconfig.json"
jq '.channel_group.groups.Application.groups.proizvodnja1MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.proizvodnja1.dpp.podjetje.si","port": 7051}]},"version": "0"}}' ${PWD}/proizvodnja1MSPconfig.json > "${PWD}/proizvodnja1MSPmodified_config.json"
configtxlator proto_encode --input ${PWD}/proizvodnja1MSPconfig.json --type common.Config --output ${PWD}/original_config.pb
configtxlator proto_encode --input ${PWD}/proizvodnja1MSPmodified_config.json --type common.Config --output ${PWD}/modified_config.pb
configtxlator compute_update --channel_id dppchannel --original ${PWD}/original_config.pb --updated ${PWD}/modified_config.pb --output ${PWD}/config_update.pb
configtxlator proto_decode --input ${PWD}/config_update.pb --type common.ConfigUpdate --output ${PWD}/config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"dppchannel", "type":2}},"data":{"config_update":'$(cat $PWD/config_update.json)'}}}' | jq . > "${PWD}/config_update_in_envelope.json"
#cat ${PWD}/config_update.json
configtxlator proto_encode --input ${PWD}/config_update_in_envelope.json --type common.Envelope --output ${PWD}/proizvodnja1MSPanchors.tx
# Update channel dppchannel
peer channel update -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si -c dppchannel -f ${PWD}/${CORE_PEER_LOCALMSPID}anchors.tx --tls --cafile $ORDERER_CA