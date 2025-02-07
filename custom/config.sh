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

function add_coin() {
    local in="$1"
    local out="$2"
    local addr="$3"
    local denom="$4"
    local amount="$5"

    local tmp_file=$(mktemp)

    jq --arg addr "$addr" --arg denom "$denom" --arg amount "$amount" '
        .app_state.bank.balances |= (
            if any(.address == $addr) then
                map(
                    if .address == $addr then
                        if any(.coins[]; .denom == $denom) then
                            .coins |= map(
                                if .denom == $denom then
                                    .amount = (.amount | tonumber + ($amount | tonumber) | tostring)
                                else
                                    .
                                end
                            )
                        else
                            .coins += [{"denom": $denom, "amount": $amount}]
                        end |
                        .coins |= sort_by(.denom)
                    else
                        .
                    end
                )
            else
                . + [{"address": $addr, "coins": [{"denom": $denom, "amount": $amount}]}]
            end
        ) |
        .app_state.bank.supply |= (
            if any(.denom == $denom) then
                map(
                    if .denom == $denom then
                        .amount = (.amount | tonumber + ($amount | tonumber) | tostring)
                    else
                        .
                    end
                )
            else
                . + [{"denom": $denom, "amount": $amount}]
            end |
            sort_by(.denom)
        )
    ' "$in" > "$tmp_file"

    if [ $? -eq 0 ]; then
        mv "$tmp_file" "$out"
    else
        echo "Error: jq command failed"
        rm "$tmp_file"
    fi
}

add_coin $INPUT_GENESIS_FILE $INPUT_GENESIS_FILE $MAIN_WALLET untrn 1000000000000

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
