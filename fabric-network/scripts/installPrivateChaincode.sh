#! /bin/bash
# Package compiled private chaincode
# Doing this as proizvodnja2
export PWD="/opt/gopath/src/github.com/hyperledger/fabric/peer"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="proizvodnja2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/peers/peer0.proizvodnja2.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/users/Admin@proizvodnja2.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer0.proizvodnja2.dpp.podjetje.si:7051
export FABRIC_CFG_PATH=/etc/hyperledger/fabric/

export CC_SRC_PATH=/opt/gopath/src/github.com/hyperledger/fabric/chaincode/chaincode-private
export CC_NAME=private
export CC_VERSION=1.0

# Package typescript's compiled chaincode into tar.gz
peer lifecycle chaincode package "${PWD}/${CC_NAME}.tar.gz" --path ${CC_SRC_PATH} --lang node --label ${CC_NAME}_${CC_VERSION}
export CC_PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid "${PWD}/${CC_NAME}.tar.gz")
sleep 1

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="proizvodnja2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/peers/peer0.proizvodnja2.dpp.podjetje.si/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/proizvodnja2.dpp.podjetje.si/users/Admin@proizvodnja2.dpp.podjetje.si/msp
export CORE_PEER_ADDRESS=peer0.proizvodnja2.dpp.podjetje.si:7051

echo "Installing private chaincode on peer0.proizvodnja2.dpp.podjetje.si..."
peer lifecycle chaincode queryinstalled --output json | jq -r 'try (.installed_chaincodes[].package_id)' | grep ^${PACKAGE_ID} # Check if any chaincode is currently installed on each peer
peer lifecycle chaincode install "${PWD}/${CC_NAME}.tar.gz" # Install packed chaincode on peers
sleep 3
# After installing package on peer we need approve installed chaincode by organization, department to channel: dppchannel
peer lifecycle chaincode approveformyorg -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si --tls --cafile "${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/msp/tlscacerts/tlsca.dpp.podjetje.si-cert.pem" --channelID dppchannel --name $CC_NAME --version $CC_VERSION --package-id $CC_PACKAGE_ID --sequence 1 --init-required
peer lifecycle chaincode checkcommitreadiness --orderer orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si --tls --cafile "${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/msp/tlscacerts/tlsca.dpp.podjetje.si-cert.pem" --channelID dppchannel --name $CC_NAME --version $CC_VERSION --sequence 1 --init-required
peer lifecycle chaincode querycommitted --channelID dppchannel --name $CC_NAME
sleep 1

# Check commit readiness for all joined peers at channel dppchannel
peer lifecycle chaincode checkcommitreadiness --orderer orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si --tls --cafile "${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/msp/tlscacerts/tlsca.dpp.podjetje.si-cert.pem" --channelID dppchannel --name $CC_NAME --version $CC_VERSION --sequence 1 --init-required
# Commit approved chaincode to channel dppchannel, we need specify all endorsers peers to confirm commit chaincode to channel transaction insured by one of the peers
peer lifecycle chaincode commit -o orderer.dpp.podjetje.si:7050 --ordererTLSHostnameOverride orderer.dpp.podjetje.si --tls --cafile $ORDERER_CA --channelID dppchannel --peerAddresses "peer0.proizvodnja1.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/peers/peer0.proizvodnja1.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.warehouses.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/warehouses.dpp.podjetje.si/peers/peer0.warehouses.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.nadzor.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/nadzor.dpp.podjetje.si/peers/peer0.nadzor.dpp.podjetje.si/tls/ca.crt" --peerAddresses "peer0.proizvodnja1.dpp.podjetje.si:7051" --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/proizvodnja1.dpp.podjetje.si/peers/peer0.proizvodnja1.dpp.podjetje.si/tls/ca.crt" --name $CC_NAME --version $CC_VERSION --sequence 1 --init-required
# Query committed chaincode in channel dppchannel
peer lifecycle chaincode querycommitted --channelID dppchannel --name $CC_NAME