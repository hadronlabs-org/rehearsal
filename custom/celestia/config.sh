#!/bin/bash

INPUT_GENESIS_FILE=$1
OUTPUT_GENESIS_FILE=$2


echo "Setting IBC state latest height to 0"

jq \
    '.app_state.ibc.client_genesis.clients |= map(
        if .client_id == "07-tendermint-29"
            then .client_state.latest_height.revision_height = "0"
            else .
        end
    )
    ' "$INPUT_GENESIS_FILE" > "$OUTPUT_GENESIS_FILE"