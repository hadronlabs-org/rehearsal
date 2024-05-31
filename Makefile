#!/usr/bin/make -f

COMPOSE := $(shell command -v docker-compose 2> /dev/null || echo "docker compose")

build-mainnet-fork-image:
	@docker buildx build  --build-arg validator=val_a --no-cache --load -t neutron-mainnet-fork .

start-mainnet-fork:
	@mkdir -p ./snapshot
	@chmod 0777 ./snapshot
	@$(COMPOSE) up neutron-fork -d

start-mainnet-fork-from-genesis:
	@mkdir -p ./snapshot
	@chmod 0777 ./snapshot
	@$(COMPOSE) up neutron-fork-genesis -d

continue-mainnet-fork:
	@$(COMPOSE) up neutron-fork-continue -d

upgrade-mainnet-fork:
	@$(COMPOSE) up neutron-fork-upgrade -d

stop-mainnet-fork:
	@docker stop neutron-mainnet-fork
	@docker stop neutron-mainnet-fork-2
