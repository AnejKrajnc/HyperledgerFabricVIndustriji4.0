#! /bin/bash
# Join every organization's, department's peer to channel dppchannel
#export PWD="/opt/gopath/src/github.com/hyperledger/fabric/peer"
export CORE_PEER_TLS_ENABLED=true
export FABRIC_CFG_PATH=${PWD}/config/
export BLOCKFILE=${PWD}/channel-artifacts/dppchannel.block

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="proizvodnja2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/peers/peer0.proizvodnja2.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/users/Admin@proizvodnja2.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer0.proizvodnja2.dpp.podjetje.si:7051

echo "Joining Podjetje proizvodnja2 to dppchannel"
peer channel join -b $BLOCKFILE
sleep 1

export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/peers/peer1.proizvodnja2.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/users/Admin@proizvodnja2.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer1.proizvodnja2.dpp.podjetje.si:7051

peer channel join -b $BLOCKFILE

sleep 1

export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/peers/peer2.proizvodnja2.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/users/Admin@proizvodnja2.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer2.proizvodnja2.dpp.podjetje.si:7051

peer channel join -b $BLOCKFILE

sleep 1

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="nadzorMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/nadzor.dpp.podjetje.si/peers/peer0.nadzor.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/nadzor.dpp.podjetje.si/users/Admin@nadzor.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer0.nadzor.dpp.podjetje.si:7051

echo "Joining Podjetje nadzor to dppchannel"
peer channel join -b $BLOCKFILE
sleep 1

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="proizvodnja1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/peers/peer0.proizvodnja1.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/users/Admin@proizvodnja1.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer0.proizvodnja1.dpp.podjetje.si:7051

echo "Joining Podjetje proizvodnja1 to dppchannel"
peer channel join -b $BLOCKFILE
sleep 1