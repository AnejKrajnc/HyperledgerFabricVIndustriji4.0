#! /bin/bash
# Set up fabric network with organiyations of ALU and their peers and orderers
function createCertificateAuthoritiesInContainers() {
    # Delete all existing crypto material if exists in shared organizations folder
    if [[ -d "organizations/peerOrganizations" ]]; then
        rm -rf organizations/peerOrganizations
    fi

    if [[ -d "organizations/ordererOrganizations" ]]; then
        rm -rf organizations/ordererOrganizations
    fi

    echo "Creating Fabric Certificate Authorities for departments of Podjetje (organizations) in Docker..."
    docker compose -f compose/compose-ca.yaml -f compose/docker/docker-compose-ca.yaml up -d

    sleep 6

    while :
    do
      if [ ! -f "organizations/fabric-ca/proizvodnja2/tls-cert.pem" ]; then
        sleep 1
      else
        break
      fi
    done

    echo "Creating Podjetje ALU 4.0 DPP proizvodnja2 fuses assembly line Identities"
    docker exec cli bash -c "source organizations/fabric-ca/registerEnroll.sh && createproizvodnja2"
    
    echo "Creating Podjetje ALU 4.0 DPP proizvodnja1 Identities"
    docker exec cli bash -c "source organizations/fabric-ca/registerEnroll.sh && createproizvodnja1"

    echo "Creating Podjetje nadzor Identities"
    docker exec cli bash -c "source organizations/fabric-ca/registerEnroll.sh && createnadzor"

    echo "Creating Podjetje Orderer Identities"
    docker exec cli bash -c "source organizations/fabric-ca/registerEnroll.sh && createOrderer"
}

function generateCertsWithCryptogen() {
    # Delete all existing crypto material if exists
    if [[ -d "organizations/peerOrganizations" ]]; then
        rm -rf organizations/peerOrganizations
    fi

    if [[ -d "organizations/ordererOrganizations" ]]; then
        rm -rf organizations/ordererOrganizations
    fi

    echo "Generating certificates using cryptogen tool..."
    echo "Creating Podjetje ALU 4.0 DPP proizvodnja2 assembly line Identities"
    docker exec cli cryptogen -c "generate --config=./organizations/cryptogen/crypto-config-podjetje-proizvodnja2.yaml --output="organizations" " # Generate crypto material for Podjetje Alu 4.0 proizvodnja2 production line
    echo "Creating Podjetje ALU 4.0 DPP proizvodnja1 Identities"
    docker exec cli cryptogen -c "generate --config=./organizations/cryptogen/crypto-config-podjetje-proizvodnja1.yaml --output="organizations" " # Generate crypto material for Podjetje proizvodnja1
    echo "Creating Podjetje ALU 4.0 DPP nadzor Identities"
    docker exec cli cryptogen -c "generate --config=./organizations/cryptogen/crypto-config-podjetje-nadzor.yaml --output="organizations" " # Generate crypto material for Podjetje nadzor
    echo "Creating Podjetje ALU 4.0 DPP Orderer Identities"
    docker exec cli cryptogen -c "generate --config=./organizations/cryptogen/crypto-config-orderer.yaml --output="organizations" " # Generate crypto material for Podjetje Orderer
}

function createOrdererAndNodesInDockerWithCompose() {
    echo "Creating orderer and nodes with docker and docker compose" : ${CONTAINER_CLI:="docker"} # Set container cli
    export SOCK="${DOCKER_HOST:-/var/run/docker.sock}" # Set docker socket variable from enviroment variable DOCKER_HOST
    export DOCKER_SOCK="${SOCK##unix://}"
    docker compose -f compose/compose-industry-test-network.yaml -f compose/docker/docker-compose-industry-test-network.yaml up -d
}

function createOrdererAndNodesInDockerWithComposeCouch() {
    echo "Creating orderer, peers and CouchDBs with docker and docker compose" : ${CONTAINER_CLI:="docker"} # Set container cli
    export SOCK="${DOCKER_HOST:-/var/run/docker.sock}" # Set docker socket variable from enviroment variable DOCKER_HOST
    export DOCKER_SOCK="${SOCK##unix://}"
    docker compose -f compose/compose-industry-test-network.yaml -f compose/compose-industry-test-network-couch.yaml -f compose/docker/docker-compose-industry-test-network.yaml -f compose/docker/docker-compose-industry-test-network-couch.yaml up -d
}

function helpMe() {
    echo -e "Usage:"
    echo -e "\t start.sh <Mode> [Flags]"
    echo -e "\t Modes:"
    echo -e "\t up - Bring our fabric network to alive"
    echo -e "\t Flags:"
    echo -e "\t -ca - Use Certificate Authorities to generate network crypto material"
    echo -e "\t -couchdb - Use CouchDB as State database"
}

# Get parameters
MODE=$1
shift


if [[ $MODE == "help" ]]; then
    helpMe
    exit
fi

if [[ $1 == "-ca" ]]; then
    createCertificateAuthoritiesInContainers
else
    generateCertsWithCryptogen
fi


# 2. Create and bring up nodes of network - using docker folder to bring up peer nodes and orderer node
if [[ $MODE == "up" ]]; then

    if [[ $2 == "-couchdb" ]]; then
        createOrdererAndNodesInDockerWithComposeCouch
        shift
    else
        createOrdererAndNodesInDockerWithCompose
    fi
fi

sleep 8

# 3. Create main channel dppchannel and connect all peers
if [[ $2 == "createChannel" ]]; then
    docker exec cli bash -c "source scripts/setUpMyChannel.sh"
    docker exec cli bash -c "source scripts/joinPeersToMyChannel.sh"
    docker exec cli bash -c "source scripts/setupAnchorPeers.sh"
    docker exec cli bash -c "source scripts/installChaincodeOnPeers.sh"
    docker exec cli bash -c "source scripts/commitChaincodeToMyChannel.sh"
    docker exec cli bash -c "source scripts/invokeChaincode.sh"
    # docker exec cli bash -c "source scripts/queryChaincode.sh"
fi