FROM ubuntu:latest

WORKDIR /usr/local/bin
RUN apt-get update
RUN apt-get install -y curl ca-certificates openssl jq
RUN curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh | bash -s -- 2.4.9 1.5.5 -d -s
RUN rm -rf /var/cache/apk/*

ENV PATH="/usr/local/bin:${PATH}"