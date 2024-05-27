#! /bin/bash
#export PWD="/opt/gopath/src/github.com/hyperledger/fabric/peer"
export ORDERER_CA="${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/tlsca/tlsca.dpp.podjetje.si-cert.pem"
export ORDERER_ADMIN_TLS_SIGN_CERT="${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/tls/server.crt"
export ORDERER_ADMIN_TLS_PRIVATE_KEY="${PWD}/organizations/ordererOrganizations/dpp.podjetje.si/orderers/orderer.dpp.podjetje.si/tls/server.key"
export FABRIC_CFG_PATH=${PWD}/config/

configtxgen -profile ThreeOrgsApplicationGenesis -outputBlock ${PWD}/channel-artifacts/dppchannel.block -channelID dppchannel
sleep 1

# Create, set up channel for main communication in blockchain network
osnadmin channel join --channelID dppchannel --config-block ${PWD}/channel-artifacts/dppchannel.block -o orderer.dpp.podjetje.si:7053 --ca-file "$ORDERER_CA" --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY" # Set up channel dppchannel
