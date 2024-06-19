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

continue-upgraded-fork:
	@$(COMPOSE) up neutron-fork-upgrade -d

stop-mainnet-fork:
	@docker stop neutron-mainnet-fork
	@docker stop neutron-mainnet-fork-2

build-slinky:
		@docker buildx build --load --build-context app=https://github.com/skip-mev/slinky.git#v1.0.0 -t skip-mev/slinky-e2e-oracle -f ./Dockerfile.slinky .

start-slinky:
	@$(COMPOSE) up oracle -d

clean_data:
	sudo rm -rf ./current_data

build-3-0-5-image:
	@docker buildx build  --build-arg validator=val_a --build-arg "FROM_BRANCH=v3.0.5" --no-cache --load -t neutron-mainnet-fork .

build-3-0-6-image:
	@docker buildx build  --build-arg validator=val_a --build-arg "FROM_BRANCH=v3.0.6" --no-cache --load -t neutron-mainnet-fork .
