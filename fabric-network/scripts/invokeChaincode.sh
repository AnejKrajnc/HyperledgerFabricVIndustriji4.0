#! /bin/bash
#export PWD="/opt/gopath/src/github.com/hyperledger/fabric/peer"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="proizvodnja2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/peers/peer0.proizvodnja2.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/users/Admin@proizvodnja2.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer0.proizvodnja2.dpp.podjetje.si:7051
export FABRIC_CFG_PATH=${PWD}/config/
export CC_NAME=produkt-dpp

sleep 8 # Need to wait to sync updates on fabric network
# Query committed chaincode on channel dppchannel
peer lifecycle chaincode querycommitted --channelID dppchannel --name ${CC_NAME}
# Invoke chaincode transaction "InitLedger" to initialize ledger with some assets
peer chaincode invoke -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si --tls --cafile "${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/msp/tlscacerts/tlsca.dpp.podjetje.si-cert.pem" -C dppchannel -n ${CC_NAME} --peerAddresses "peer0.proizvodnja1.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/peers/peer0.proizvodnja1.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.nadzor.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/nadzor.dpp.podjetje.si/peers/peer0.nadzor.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.proizvodnja1.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/peers/peer0.proizvodnja1.dpp.podjetje.si/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}' # ! isInit
sleep 3