#!/usr/bin/make -f

COMPOSE ?= docker-compose

build-mainnet-snapshot-image:
	@docker buildx build --load -t neutron-mainnet-snapshot -f Dockerfile.snapshot .

build-mainnet-fork-image:
	@docker buildx build --load -t neutron-mainnet-fork .

create-mainnet-snapshot:
	@chmod 0777 ./snapshot
	@$(COMPOSE) up neutron-snapshot

start-mainnet-fork:
	@chmod 0777 ./snapshot
	@$(COMPOSE) up neutron-fork

stop-mainnet-snapshot:
	@docker stop neutron-mainnet-snapshot

stop-mainnet-fork:
	@docker stop neutron-mainnet-fork
