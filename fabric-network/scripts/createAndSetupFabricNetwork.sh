#! /bin/bash
# create, prepare and set up local test network
pushd scripts/
./setUpMyChannel.sh
./joinPeersToMyChannel.sh
./setupAnchorPeers.sh
./installChaincodeOnPeers.sh
./commitChaincodeToMyChannel.sh
popd