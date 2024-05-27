# syntax=docker/dockerfile:1

# ==== old neutron ====
FROM golang:1.21-bullseye as old_neutron
RUN apt-get update && apt-get install -y jq curl git crudini gzip wget
RUN git clone --branch feat/v4-upgrade-devnet https://github.com/neutron-org/neutron.git /opt/neutron
WORKDIR /opt/neutron

RUN make install-test-binary

# ==== new neutron ====
FROM golang:1.22-bullseye as new_neutron
RUN apt-get update && apt-get install -y jq curl git crudini gzip wget
RUN git clone --branch feat/sdk-50 https://github.com/neutron-org/neutron.git /opt/neutron

RUN make install-test-binary

EXPOSE 26656 26657 1317 9090
# RUN neutrond init test --chain-id=neutron-1 --home /opt/neutron/data

COPY --from=new_neutron /go/bin/neutrond /go/bin/neutrond_new
COPY --from=old_neutron ./config/config.toml /opt/neutron/data/config/config.toml
COPY --from=old_neutron --chmod=0755 ./scripts/create_genesis.sh /opt/neutron/create_genesis.sh
COPY --from=old_neutron --chmod=0755 ./scripts/start_mainnet_fork.sh /opt/neutron/start_mainnet_fork.sh
COPY --from=old_neutron --chmod=0755 ./scripts/start_upgrade_neutron.sh /opt/neutron/start_upgrade_neutron.sh
COPY --from=old_neutron /go/bin/neutrond /go/bin/neutrond

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD \
    curl -f http://127.0.0.1:1317/blocks/1 >/dev/null 2>&1 || exit 1

CMD /opt/neutron/start_mainnet_fork.sh
