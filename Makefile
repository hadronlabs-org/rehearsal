#!/usr/bin/make -f

COMPOSE ?= docker-compose

build-mainnet-snapshot-image:
	@docker buildx build -t neutron-mainnet-snapshot -f Dockerfile.snapshot .

build-mainnet-fork-image:
	@docker buildx build -t neutron-mainnet-fork .

create-mainnet-snapshot:
	@$(COMPOSE) up -d neutron-snapshot

start-mainnet-fork:
	@$(COMPOSE) up -d neutron-fork

stop-mainnet-snapshot:
	@docker stop neutron-mainnet-snapshot

stop-mainnet-fork:
	@docker stop neutron-mainnet-fork
