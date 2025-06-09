#!/bin/bash
set -euo pipefail

INPUT_GENESIS_FILE=$1
OUTPUT_GENESIS_FILE=$2

# Configuration for WASM contract patch
CONTRACT_ADDRESS="neutron1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgshlt6zh"
CONFIG_KEY_HEX="636F6E6669675F7632"

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

echo "Applying WASM contract config patch..."
ENCODED_CONFIG=$(echo "$SINGLE_PROPOSAL_CONFIG" | jq -c '.' | base64 | tr -d '\n')

echo "Patching IBC client state height to 0..."

jq \
  --arg addr "$CONTRACT_ADDRESS" \
  --arg key "$CONFIG_KEY_HEX" \
  --arg val "$ENCODED_CONFIG" \
  '
  # Patch IBC client
  .app_state.ibc.client_genesis.clients |= map(
    if .client_id == "07-tendermint-48" then
      .client_state.latest_height.revision_height = "0"
    else .
    end
  )

  # Patch wasm contract state
  | .app_state.wasm.contracts |= map(
    if .contract_address == $addr and (.contract_state | type == "array") then
      .contract_state |= map(
        if .key == $key then
          .value = $val
        else .
        end
      )
    else .
    end
  )
  ' "$INPUT_GENESIS_FILE" > "$OUTPUT_GENESIS_FILE"