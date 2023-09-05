# Neutron mainnet integration tests

This repo contains all utilities required to create and run fork of the mainnet.

## Prerequisities

- Docker engine
- Node.js version 16


## Commands

* `make build-mainnet-snapshot-image` - builds `neutron-mainnet-snapshot` container which will run `neutrond` node using statsync and export state from it.
* `make create-mainnet-snapshot` - runs `neutron-mainnet-snapshot` container to create snapshot into `./snapshot` directory
* `make stop-mainnet-snapshot` - stops `neutron-mainnet-snapshot` container.
  
* `make build-mainnet-fork-image` - builds `neutron-mainnet-fork` container to run `neuntrond` node with genesis created from latests network snapshot with modified parameters. Also it creates cached version of network state for fast node startup.
* `make start-mainnet-fork` - runs `neutron-mainnet-fork` container.
* `make stop-mainnet-fork` - stops `neutron-mainnet-fork` container.

