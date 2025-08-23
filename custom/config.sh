#!/bin/bash
set -euo pipefail

INPUT_GENESIS_FILE=$1
OUTPUT_GENESIS_FILE=$2

CELESTIA_CONTRACT_ADDRESS="neutron1vqtnu54addf87qp73fnjvqafruzkr2zjgswkhsmsg45t08wla2nqqan0hc"
COSMOSHUB_CONTRACT_ADDRESS="neutron15v5acjfttf3umzatmj7rqfjy6yzcgekh266ehjsxclvaem0hpd7q9qpscr"

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

echo "Encoding WASM config..."
ENCODED_CONFIG=$(echo "$SINGLE_PROPOSAL_CONFIG" | jq -c '.' | base64 | tr -d '\n')

CELESTIA_CLIENT_ID="07-tendermint-48"
CELESTIA_CHANNEL_ID="channel-6028"
CELESTIA_PORT_ID="icacontroller-$CELESTIA_CONTRACT_ADDRESS.DROP"

COSMOSHUB_CLIENT_ID="07-tendermint-0"
COSMOSHUB_CHANNEL_ID="channel-4773"
COSMOSHUB_PORT_ID="icacontroller-$COSMOSHUB_CONTRACT_ADDRESS.DROP"

echo "Patching Neutron genesis..."

jq \
  --arg celestia_addr "$CELESTIA_CONTRACT_ADDRESS" \
  --arg cosmoshub_addr "$COSMOSHUB_CONTRACT_ADDRESS" \
  --arg key "$CONFIG_KEY_HEX" \
  --arg val "$ENCODED_CONFIG" \
  --arg celestia_client_id "$CELESTIA_CLIENT_ID" \
  --arg cosmoshub_client_id "$COSMOSHUB_CLIENT_ID" \
  --arg celestia_channel_id "$CELESTIA_CHANNEL_ID" \
  --arg cosmoshub_channel_id "$COSMOSHUB_CHANNEL_ID" \
  --arg celestia_port_id "$CELESTIA_PORT_ID" \
  --arg cosmoshub_port_id "$COSMOSHUB_PORT_ID" '
  .initial_height = 25137915

  | .app_state.ibc.client_genesis.clients |= map(
    if .client_id == $celestia_client_id then
      .client_state.latest_height.revision_height = "0"
    else . end
  )
  | .app_state.wasm.contracts |= map(
    if .contract_address == $celestia_addr then
      .contract_state |= map(
        if .key == $key then .value = $val else . end
      )
    else . end
  )
  | .app_state.ibc.channel_genesis.acknowledgements |= map(select(.channel_id != $celestia_channel_id or .port_id != $celestia_port_id))
  | .app_state.ibc.channel_genesis.recv_sequences   |= map(select(.channel_id != $celestia_channel_id or .port_id != $celestia_port_id))
  | .app_state.ibc.channel_genesis.send_sequences   |= map(select(.channel_id != $celestia_channel_id or .port_id != $celestia_port_id))
  | .app_state.ibc.channel_genesis.commitments      |= map(select(.channel_id != $celestia_channel_id or .port_id != $celestia_port_id))
  | .app_state.ibc.channel_genesis.receipts         |= map(select(.channel_id != $celestia_channel_id or .port_id != $celestia_port_id))
  | .app_state.ibc.channel_genesis.recv_sequences += [{
      "channel_id": $celestia_channel_id,
      "port_id": $celestia_port_id,
      "sequence": "1"
    }]
  | .app_state.ibc.channel_genesis.send_sequences += [{
      "channel_id": $celestia_channel_id,
      "port_id": $celestia_port_id,
      "sequence": "1"
    }]
  | .app_state.ibc.channel_genesis.ack_sequences += [{
      "channel_id": $celestia_channel_id,
      "port_id": $celestia_port_id,
      "sequence": "1"
    }]

  | .app_state.ibc.client_genesis.clients |= map(
    if .client_id == $cosmoshub_client_id then
      .client_state.latest_height.revision_height = "0"
    else . end
  )
  | .app_state.wasm.contracts |= map(
    if .contract_address == $cosmoshub_addr then
      .contract_state |= map(
        if .key == $key then .value = $val else . end
      )
    else . end
  )
  | .app_state.ibc.channel_genesis.acknowledgements |= map(select(.channel_id != $cosmoshub_channel_id or .port_id != $cosmoshub_port_id))
  | .app_state.ibc.channel_genesis.recv_sequences   |= map(select(.channel_id != $cosmoshub_channel_id or .port_id != $cosmoshub_port_id))
  | .app_state.ibc.channel_genesis.send_sequences   |= map(select(.channel_id != $cosmoshub_channel_id or .port_id != $cosmoshub_port_id))
  | .app_state.ibc.channel_genesis.commitments      |= map(select(.channel_id != $cosmoshub_channel_id or .port_id != $cosmoshub_port_id))
  | .app_state.ibc.channel_genesis.receipts         |= map(select(.channel_id != $cosmoshub_channel_id or .port_id != $cosmoshub_port_id))
  | .app_state.ibc.channel_genesis.recv_sequences += [{
      "channel_id": $cosmoshub_channel_id,
      "port_id": $cosmoshub_port_id,
      "sequence": "1"
    }]
  | .app_state.ibc.channel_genesis.send_sequences += [{
      "channel_id": $cosmoshub_channel_id,
      "port_id": $cosmoshub_port_id,
      "sequence": "1"
    }]
  | .app_state.ibc.channel_genesis.ack_sequences += [{
      "channel_id": $cosmoshub_channel_id,
      "port_id": $cosmoshub_port_id,
      "sequence": "1"
    }]
' "$INPUT_GENESIS_FILE" > "$OUTPUT_GENESIS_FILE"

echo "Done. Patched genesis written to $OUTPUT_GENESIS_FILE"