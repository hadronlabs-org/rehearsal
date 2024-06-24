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

function is_wallet_exists() {
    wallet=$(echo $1 |
            jq '.app_state.bank.balances | map (
                    select (
                        .address | contains ("'$2'")
                    )
                ) | .[]'
            )
    if [ -z "$wallet" ] ; then
        echo false
    else
        echo true
    fi
}

function add_wallet_if_not_exists() {
    local new_config="$1"
    if ! $(is_wallet_exists "$1" $2) ; then
        new_config=$(echo $1 | jq '.app_state.bank.balances += [
            {
                "address": "'$2'",
                "coins": []
            }
        ]')
    fi
    echo $new_config
}

function is_coin_exists() {
    if ! $(is_wallet_exists "$1" $2) ; then
        echo false
        exit
    fi

    local amount=$(echo $1 |
        jq '.app_state.bank.balances | map(
                select(
                    .address | contains ("'$2'")
                )
            ) | .[].coins | map(
                select(
                    .denom | contains ("'$3'")
                )
            ) | .[]'
        )

    if ! [ -z "$amount" ] ; then
        echo true
    else
        echo false
    fi
}

function add_coin() {
    local genesis_with_wallet=$(add_wallet_if_not_exists "$1" $2)
    local current_balance=$(echo $genesis_with_wallet |
        jq '.app_state.bank.balances | map(
                select(
                    .address | contains("'$2'")
                )
            ) | .[].coins | map(
                select(
                    .denom | contains ("'$3'")
                )
            )'
        )
    if [[ $(echo $current_balance | jq 'length') == 0 ]]; then
        genesis_with_wallet=$(echo $genesis_with_wallet |
            jq '.app_state.bank.balances = (.app_state.bank.balances |
                    map (
                        (
                            select(
                                .address | contains ("'$2'")
                            ) | .coins
                        ) += [
                            {
                                "denom": "'$3'",
                                "amount": "'$4'"
                            }
                        ]
                    )
                )'
        )
    else
        genesis_with_wallet=$(echo $genesis_with_wallet |
            jq '.app_state.bank.balances = (.app_state.bank.balances | map (
                        select (
                            .address | contains ("'$2'")
                        ).coins = (
                            .coins | map (
                                del (
                                    select (
                                        .denom | contains ("'$3'")
                                    )
                                )
                            ) | map (
                                select (
                                    . != null
                                )
                            ) | . += [
                                {
                                    "denom": "'$3'",
                                    "amount": "'$(echo $current_balance | jq '(.[0].amount | tonumber) + '$4'')'"
                                }
                            ]
                        )
                    )
                )'
            )
    fi

    current_supply=$(echo $genesis_with_wallet |
        jq '.app_state.bank.supply | map (
                select (
                    .denom | contains ("'$3'")
                )
            )'
    )

    if [[ $(echo $current_supply | jq 'length') == 0 ]]; then
        genesis_with_wallet=$(echo $genesis_with_wallet |
            jq '.app_state.bank.supply += [
                {
                    "denom": "'$3'",
                    "amount": "'$4'"
                }
            ]'
        )
    else
        genesis_with_wallet=$(echo $genesis_with_wallet |
            jq '.app_state.bank.supply = (.app_state.bank.supply | map (
                        select (
                            .denom | contains ("'$3'")
                        ).amount = (((.amount | tonumber) + '$4') | tostring)
                    )
                )'
        )
    fi
    echo $genesis_with_wallet
}

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

