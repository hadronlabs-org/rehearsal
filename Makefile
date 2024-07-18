#!/usr/bin/make -f

COMPOSE := $(shell command -v docker-compose 2> /dev/null || echo "docker compose")


build-mainnet-snapshot-image:
	@docker buildx build --load -t neutron-mainnet-snapshot -f Dockerfile.snapshot .

build-mainnet-fork-image:
	@docker buildx build --load --no-cache -t neutron-mainnet-fork .

create-mainnet-snapshot:
	@mkdir -p ./snapshot
	@chmod 0777 ./snapshot
	@$(COMPOSE) up neutron-snapshot

start-mainnet-fork:
	@mkdir -p ./snapshot
	@chmod 0777 ./snapshot
	@$(COMPOSE) up neutron-fork -d

stop-mainnet-snapshot:
	@docker stop neutron-mainnet-snapshot

stop-mainnet-fork:
	@docker stop neutron-mainnet-fork

build-oracle:
		@docker buildx build --load --build-context app=https://github.com/skip-mev/slinky.git#v1.0.3 -t skip-mev/slinky-e2e-oracle -f ./Dockerfile.slinky .

start-oracle:
	@$(COMPOSE) up oracle -d

stop-oracle:
	@docker stop oracle
