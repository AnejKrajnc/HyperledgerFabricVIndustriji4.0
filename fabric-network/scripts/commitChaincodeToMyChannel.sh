#! /bin/bash
#export PWD="/opt/gopath/src/github.com/hyperledger/fabric/peer"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="proizvodnja2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/peers/peer0.proizvodnja2.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/users/Admin@proizvodnja2.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer0.proizvodnja2.dpp.podjetje.si:7051
export FABRIC_CFG_PATH=${PWD}/config/

export ORDERER_CA="${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/tlsca/tlsca.dpp.podjetje.si-cert.pem"
export ORDERER_ADMIN_TLS_SIGN_CERT="${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/tls/server.crt"
export ORDERER_ADMIN_TLS_PRIVATE_KEY="${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/tls/server.key"
export CC_NAME=produkt-dpp
export CC_VERSION=1.0

# After installing package on peer we need approve installed chaincode to channel
export PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid $CC_NAME.tar.gz)
echo $PACKAGE_ID

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="proizvodnja2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/peers/peer0.proizvodnja2.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/users/Admin@proizvodnja2.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer0.proizvodnja2.dpp.podjetje.si:7051

# Check commit readiness for all joined peers at channel dppchannel
peer lifecycle chaincode checkcommitreadiness --orderer orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si --tls --cafile "${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/msp/tlscacerts/tlsca.dpp.podjetje.si-cert.pem" --channelID dppchannel --name $CC_NAME --version $CC_VERSION --sequence 1
# Commit approved chaincode to channel dppchannel, we need specify all endorsers peers to confirm commit chaincode to channel transaction insured by one of the peers
peer lifecycle chaincode commit -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si --tls --cafile $ORDERER_CA --channelID dppchannel --peerAddresses "peer0.proizvodnja1.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/peers/peer0.proizvodnja1.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.nadzor.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/nadzor.dpp.podjetje.si/peers/peer0.nadzor.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.proizvodnja1.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/peers/peer0.proizvodnja1.dpp.podjetje.si/tls/ca.crt" --name $CC_NAME --version $CC_VERSION --sequence 1
# Query committed chaincode in channel dppchannel
peer lifecycle chaincode querycommitted --channelID dppchannel --name $CC_NAME