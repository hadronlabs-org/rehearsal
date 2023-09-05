#!/bin/bash

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

SNAPSHOT_INPUT=${SNAPSHOT_INPUT:-"./snapshot.json"}
GENESIS_OUTPUT=${GENESIS_OUTPUT:-"./genesis.json"}

WASM_SEQUENCES=$(jq '.app_state.wasm.contracts | length' $SNAPSHOT_INPUT)
WASM_SEQUENCES=$((WASM_SEQUENCES + 1))

UTC_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

ACCOUNT_ADDRESS=neutron1m9l358xunhhwds0568za49mzhvuxx9ux8xafx2
ACCOUNT_TO_REPLACE=neutron1qqqz7yq2aq4ua2fsv4u7vpz50u6cnq7x00ax0f
ACCOUNT_PUBKEY='{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"A/MdHVpitzHNSdD1Zw3kY+L5PEIPyd9l6sD5i4aIfXp9"}'


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

# SINGLE_PROPOSAL_CONFIG=$(echo "$SINGLE_PROPOSAL_CONFIG" | jq -c '.' | base64 -w 0)

# echo "$SINGLE_PROPOSAL_CONFIG" | jq -c '.' | base64 -w 0

jq \
    --arg utc_date "$UTC_DATE" \
    --arg sequence "$WASM_SEQUENCES" \
    --argjson account_pub_key "$ACCOUNT_PUBKEY" \
    --arg account_address "$ACCOUNT_ADDRESS" \
    --arg account_to_replace "$ACCOUNT_TO_REPLACE" \
    --arg proposal_config "$(echo "$SINGLE_PROPOSAL_CONFIG" | jq -c '.' | base64 -w 0)" \
    'del(.validators) | 
    .genesis_time = $utc_date | 
    .app_state.wasm.sequences[1].value = $sequence |
    .app_state.wasm.contracts |= map(
        if .contract_address == "neutron1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgshlt6zh" and (.contract_state | type == "array") 
        then .contract_state |= map(
            if .key == "636F6E6669675F7632" 
            then .value = $proposal_config
            else . 
            end) 
        else . 
        end) |
    .app_state.auth.accounts |= map(
        if .address == $account_to_replace 
        then .address = $account_address |
            .pub_key = $account_pub_key
        else . 
        end) |
    .app_state.bank.balances |= map(
        if .address == $account_to_replace 
        then .address = $account_address
        else . 
        end)
    ' $SNAPSHOT_INPUT > $GENESIS_OUTPUT

