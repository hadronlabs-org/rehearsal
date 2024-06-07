# syntax=docker/dockerfile:1

# ==== neutron 3.0.5 ====
FROM golang:1.21-bullseye as old_neutron
RUN apt-get update && apt-get install -y jq curl git crudini gzip wget
RUN git clone --branch feat/v4-upgrade-devnet https://github.com/neutron-org/neutron.git /opt/neutron
WORKDIR /opt/neutron

RUN make install-test-binary

# ==== neutron 4.0.0 ====
FROM golang:1.22-bullseye as new_neutron
RUN apt-get update && apt-get install -y jq curl git crudini gzip wget
RUN git clone --branch release_v1/nv/slinky-v1 https://github.com/neutron-org/neutron.git /opt/neutron
WORKDIR /opt/neutron

RUN make install-test-binary

EXPOSE 26656 26657 1317 9090

ARG validator
ENV VALIDATOR=$validator

COPY ./vals/ /opt/neutron/vals/
COPY ./vals/${VALIDATOR} /opt/neutron/initial_data

ENV LD_LIBRARY_PATH "/opt/neutron"
ADD ["https://github.com/CosmWasm/wasmvm/releases/download/v1.5.2/libwasmvm.x86_64.so","https://github.com/CosmWasm/wasmvm/releases/download/v1.5.2/libwasmvm.aarch64.so","/lib/"]

RUN cp /go/bin/neutrond /go/bin/neutrond_new
COPY ./config/config.toml /opt/neutron/data/config/config.toml
COPY --chmod=0755 ./scripts/create_genesis.sh /opt/neutron/create_genesis.sh
COPY --chmod=0755 ./scripts/start_mainnet_fork.sh /opt/neutron/start_mainnet_fork.sh
COPY --chmod=0755 ./scripts/start_upgraded_neutron.sh /opt/neutron/start_upgraded_neutron.sh
COPY --chmod=0755 ./peers.json /opt/neutron/peers.json
COPY --from=old_neutron /go/bin/neutrond /go/bin/neutrond

# TODO curl -f http://127.0.0.1:26657/block
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD \
    curl -f http://127.0.0.1:1317/blocks/1 >/dev/null 2>&1 || exit 1

CMD /opt/neutron/start_mainnet_fork.sh
