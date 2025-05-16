# syntax=docker/dockerfile:1

FROM golang:1.23-bullseye
RUN apt-get update && apt-get install -y jq curl git crudini gzip wget
RUN git clone --branch rehearsals/no-verify-signature https://github.com/deniszagumennov/celestia-fork.git /opt/celestia
WORKDIR /opt/celestia

RUN make install

EXPOSE 26656 26657 1317 9090
RUN celestia-appd init test --chain-id=celestia --home /opt/celestia/data
COPY ./config/config.toml /opt/celestia/data/config/config.toml
COPY --chmod=0755 ./scripts/create_genesis.sh /opt/celestia/create_genesis.sh
COPY --chmod=0755 ./scripts/start_celestia_fork.sh /opt/celestia/start_celestia_fork.sh

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD \
    curl -f http://127.0.0.1:1317/blocks/1 >/dev/null 2>&1 || exit 1

CMD ["bash", "/opt/celestia/start_celestia_fork.sh"]
