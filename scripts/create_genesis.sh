#!/bin/bash

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

SNAPSHOT_INPUT=${SNAPSHOT_INPUT:-"./snapshot.json"}
GENESIS_OUTPUT=${GENESIS_OUTPUT:-"./genesis.json"}

WASM_SEQUENCES=$(jq '.app_state.wasm.contracts | length' $SNAPSHOT_INPUT)
WASM_SEQUENCES=$((WASM_SEQUENCES + 1))

UTC_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

ADMIN_ACCOUNT=neutron1m9l358xunhhwds0568za49mzhvuxx9ux8xafx2

SINGLE_PROPOSAL_CONFIG='{
  "threshold": {
    "absolute_count": {
      "threshold": "1"
    }
  },
  "max_voting_period": {
    "time": 1209600
  },
  "min_voting_period": null,
  "allow_revoting": false,
  "dao": "neutron1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrstdxvff",
  "close_proposal_on_execution_failure": true
}'

jq \
    --arg utc_date "$UTC_DATE" \
    --arg sequence "$WASM_SEQUENCES" \
    --arg admin_account "$ADMIN_ACCOUNT" \
    --arg proposal_config "$(echo "$SINGLE_PROPOSAL_CONFIG" | jq -c '.' | base64 -w 0)" \
    'del(.validators) | 
    .genesis_time = $utc_date | 
    .app_state.adminmodule.admins += [$admin_account] |
    .app_state.wasm.sequences[1].value = $sequence |
    .app_state.wasm.contracts |= map(
        if .contract_address == "neutron1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgshlt6zh" and (.contract_state | type == "array") 
        then .contract_state |= map(
            if .key == "636F6E6669675F7632" 
            then .value = $proposal_config
            else . 
            end) 
        else . 
        end)
    ' $SNAPSHOT_INPUT > $GENESIS_OUTPUT

