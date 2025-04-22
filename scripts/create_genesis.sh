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
  --arg enable_height "$ENABLE_HEIGHT" '
  .app_state.wasm.contracts |= map(
    if .contract_info.label | test("^[ \\t\\r\\n]+|[ \\t\\r\\n]+$") then
      .contract_info.label |= gsub("^[ \\t\\r\\n]+|[ \\t\\r\\n]+$"; "")
    else
      .
    end
  )
  | .app_state.bank.denom_metadata |= map(select(.name == "Neutron"))
  | del(.validators)
  | .app_state.adminmodule.admins += [$admin_account]
  | .app_state.ibc.client_genesis.params.allowed_clients += ["09-localhost"]
  | .consensus.params.abci.vote_extensions_enable_height = $enable_height
  | .consensus.validators = []
  | .app_state.wasm.sequences[1].value = $sequence
  | .app_state.revenue.validators = []
  | .app_state.staking.last_validator_powers = []
  | .app_state.staking.last_total_power = "0"
  | .app_state.staking.params.max_validators = 1
' "$SNAPSHOT_INPUT" > "$GENESIS_OUTPUT"
