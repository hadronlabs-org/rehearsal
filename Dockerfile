# syntax=docker/dockerfile:1

FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y jq curl
EXPOSE 26656 26657 1317 9090
WORKDIR /opt/neutron
ADD --chmod=0755 https://github.com/neutron-org/neutron/releases/download/v1.0.4/neutrond-linux-amd64 /usr/local/bin/neutrond
RUN neutrond init test --chain-id=neutron-1 --home /opt/neutron/data
COPY ./config/config.toml /opt/neutron/data/config/config.toml
COPY --chmod=0755 ./scripts/create_genesis.sh /opt/neutron/create_genesis.sh
COPY --chmod=0755 ./scripts/start_mainnet_fork.sh /opt/neutron/start_mainnet_fork.sh

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD \
    curl -f http://127.0.0.1:1317/blocks/1 >/dev/null 2>&1 || exit 1

CMD /opt/neutron/start_mainnet_fork.sh