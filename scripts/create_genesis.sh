#!/bin/bash

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

SNAPSHOT_INPUT=${SNAPSHOT_INPUT:-"./snapshot.json"}
GENESIS_OUTPUT=${GENESIS_OUTPUT:-"./genesis.json"}

WASM_SEQUENCES=$(jq '.app_state.wasm.contracts | length' $SNAPSHOT_INPUT)
WASM_SEQUENCES=$((WASM_SEQUENCES + 1))

UTC_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

jq \
    --arg utc_date "$UTC_DATE" \
    --arg sequence "$WASM_SEQUENCES" \
    --arg admin_account "$MAIN_WALLET" \
    'del(.validators) | 
    .genesis_time = $utc_date | 
    .app_state.adminmodule.admins += [$admin_account] |
    .app_state.wasm.sequences[1].value = $sequence
    ' $SNAPSHOT_INPUT > $GENESIS_OUTPUT

