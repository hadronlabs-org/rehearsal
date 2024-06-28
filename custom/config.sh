#!/bin/bash

INPUT_GENESIS_FILE=$1
OUTPUT_GENESIS_FILE=$2

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

echo "Applying single proposal contract custom config: $SINGLE_PROPOSAL_CONFIG"

jq \
    --arg proposal_config "$(echo "$SINGLE_PROPOSAL_CONFIG" | jq -c '.' | base64 -w 0)" \
    '.app_state.wasm.contracts |= map(
        if .contract_address == "neutron1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgshlt6zh" and (.contract_state | type == "array") 
        then .contract_state |= map(
            if .key == "636F6E6669675F7632" 
            then .value = $proposal_config
            else . 
            end) 
        else . 
        end)
    ' $INPUT_GENESIS_FILE > $OUTPUT_GENESIS_FILE