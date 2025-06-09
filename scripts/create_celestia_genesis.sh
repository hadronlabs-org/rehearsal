#!/bin/bash

set -euo pipefail
IFS=$'\n\t'

SNAPSHOT_INPUT=${SNAPSHOT_INPUT:-"./snapshot.json"}
GENESIS_OUTPUT=${GENESIS_OUTPUT:-"./genesis.json"}
MAIN_WALLET=${MAIN_WALLET:-"celestia1yourwalletaddresshere"}

INITIAL_HEIGHT=$(jq -r '.initial_height' "$SNAPSHOT_INPUT")
ENABLE_HEIGHT=$((INITIAL_HEIGHT + 2))

jq \
  --arg admin_account "$MAIN_WALLET" \
  --arg enable_height "$ENABLE_HEIGHT" \
  '
    .app_state.bank.denom_metadata |= map(select(.name == "TIA")) |
    del(.validators) |
    .app_state.ibc.client_genesis.params.allowed_clients += ["09-localhost"] |
    .consensus.params.abci.vote_extensions_enable_height = ($enable_height | tonumber) |
    .consensus.validators = [] |
    .app_state.staking.last_validator_powers = [] |
    .app_state.staking.last_total_power = "0" |
    .app_state.staking.params.max_validators = 1 |
    .app_state.qgb = {
      "params": {
        "data_commitment_window": "400"
      }
    } |
    .app_state.gov.voting_params.voting_period = "300s" |
    .app_state.gov.tally_params.quorum = "0.000000000000000001" |
    .app_state.gov.tally_params.threshold = "0.000000000000000001" |
    .app_state.gov.deposit_params.max_deposit_period = "300s" |
    .app_state.gov.deposit_params.min_deposit[0].amount = "100"
  ' "$SNAPSHOT_INPUT" > "$GENESIS_OUTPUT"