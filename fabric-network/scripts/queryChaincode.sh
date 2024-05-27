#! /bin/bash
# Testing query the ledger
#export PWD="/opt/gopath/src/github.com/hyperledger/fabric/peer"
export FABRIC_CFG_PATH=${PWD}/config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="proizvodnja1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/peers/peer0.proizvodnja1.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/users/Admin@proizvodnja1.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer0.proizvodnja1.dpp.podjetje.si:7051
export CC_NAME=produkt-dpp

peer chaincode query -C dppchannel -n ${CC_NAME} -c '{"Args":["GetAllNVDPPS"]}'