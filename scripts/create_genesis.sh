#!/bin/bash

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

SNAPSHOT_INPUT=${SNAPSHOT_INPUT:-"./snapshot.json"}
GENESIS_OUTPUT=${GENESIS_OUTPUT:-"./genesis.json"}

WASM_SEQUENCES=$(jq '.app_state.wasm.contracts | length' $SNAPSHOT_INPUT)
WASM_SEQUENCES=$((WASM_SEQUENCES + 1))

INITIAL_HEIGHT=$(jq '.initial_height' $SNAPSHOT_INPUT)
ENABLE_HEIGHT=$((INITIAL_HEIGHT + 2))

jq \
    --arg sequence "$WASM_SEQUENCES" \
    --arg admin_account "$MAIN_WALLET" \
    --arg enable_height "$ENABLE_HEIGHT" \
    'del(.validators) |
    .app_state.adminmodule.admins += [$admin_account] |
    .app_state.ibc.client_genesis.params.allowed_clients += ["09-localhost"] |
    .consensus.params.abci.vote_extensions_enable_height = $enable_height |
    .app_state.wasm.sequences[1].value = $sequence
    ' $SNAPSHOT_INPUT > $GENESIS_OUTPUT
