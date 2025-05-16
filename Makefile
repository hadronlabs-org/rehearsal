#!/usr/bin/make -f

COMPOSE := $(shell command -v docker-compose 2> /dev/null || echo "docker compose")

build-celestia-fork-image:
	@docker buildx build --load --no-cache -t celestia-mainnet-fork .

start-celestia-fork:
	@mkdir -p ./snapshot
	@chmod 0777 ./snapshot
	@$(COMPOSE) up celestia-fork -d

stop-celestia-fork:
	@docker stop celestia-mainnet-fork

build-oracle:
		@docker buildx build --load --build-context app=https://github.com/skip-mev/slinky.git#v1.0.3 -t skip-mev/slinky-e2e-oracle -f ./Dockerfile.slinky .

start-oracle:
	@$(COMPOSE) up oracle -d

stop-oracle:
	@docker stop oracle
