#!/usr/bin/make -f

COMPOSE := $(shell command -v docker-compose 2> /dev/null || echo "docker compose")

build-mainnet-snapshot-image:
	@docker buildx build --load -t neutron-mainnet-snapshot -f Dockerfile.snapshot .

build-mainnet-fork-image:
	@docker buildx build --load --no-cache -t neutron-mainnet-fork -f Dockerfile.neutron .

create-mainnet-snapshot:
	@mkdir -p ./neutron-snapshot
	@chmod 0777 ./neutron-snapshot
	@$(COMPOSE) up neutron-snapshot

start-mainnet-fork:
	@mkdir -p ./neutron-snapshot
	@chmod 0777 ./neutron-snapshot
	@$(COMPOSE) up neutron-fork -d

stop-mainnet-snapshot:
	@docker stop neutron-mainnet-snapshot

stop-mainnet-fork:
	@docker stop neutron-mainnet-fork

build-celestia-fork-image:
	@docker buildx build --load --no-cache -t celestia-mainnet-fork -f Dockerfile.celestia .

start-celestia-fork:
	@mkdir -p ./celestia-snapshot
	@chmod 0777 ./celestia-snapshot
	@$(COMPOSE) up celestia-fork -d

stop-celestia-fork:
	@docker stop celestia-mainnet-fork

build-oracle:
	@docker buildx build --load --build-context app=https://github.com/skip-mev/slinky.git#v1.0.3 -t skip-mev/slinky-e2e-oracle -f ./Dockerfile.slinky .

start-oracle:
	@$(COMPOSE) up oracle -d

stop-oracle:
	@docker stop oracle

build-hermes-image:
	@docker buildx build --load --no-cache -t hermes -f Dockerfile.hermes .

start-hermes:
	@$(COMPOSE) up hermes -d

stop-hermes:
	@docker stop hermes
