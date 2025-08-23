#!/bin/bash
set -euo pipefail

INPUT_GENESIS_FILE=$1
OUTPUT_GENESIS_FILE=$2

CLIENT_ID="07-tendermint-29"
CHANNEL_ID="channel-57"
PORT_ID="icahost"
RESET_SEQUENCE="1"

echo "Patching Celestia genesis for ICA sync recovery..."

jq \
  --arg client_id "$CLIENT_ID" \
  --arg channel_id "$CHANNEL_ID" \
  --arg port_id "$PORT_ID" \
  --arg sequence "$RESET_SEQUENCE" '
  .app_state.ibc.client_genesis.clients |= map(
    if .client_id == $client_id then
      .client_state.latest_height.revision_height = "0"
    else . end
  )
  | .app_state.ibc.channel_genesis.channels |= map(
      if .channel_id == $channel_id and .counterparty.port_id == $port_id then
        .state = "STATE_OPEN"
      else . end
    )
  | .initial_height = "5515577"
  | .app_state.ibc.channel_genesis.acknowledgements |= map(select(.channel_id != $channel_id or .port_id != $port_id))
  | .app_state.ibc.channel_genesis.recv_sequences   |= map(select(.channel_id != $channel_id or .port_id != $port_id))
  | .app_state.ibc.channel_genesis.send_sequences   |= map(select(.channel_id != $channel_id or .port_id != $port_id))
  | .app_state.ibc.channel_genesis.commitments      |= map(select(.channel_id != $channel_id or .port_id != $port_id))
  | .app_state.ibc.channel_genesis.receipts         |= map(select(.channel_id != $channel_id or .port_id != $port_id))
  | .app_state.ibc.channel_genesis.recv_sequences += [{
      "channel_id": $channel_id,
      "port_id": $port_id,
      "sequence": "1"
    }]
  | .app_state.ibc.channel_genesis.send_sequences += [{
      "channel_id": $channel_id,
      "port_id": $port_id,
      "sequence": "1"
    }]
  | .app_state.ibc.channel_genesis.ack_sequences += [{
      "channel_id": $channel_id,
      "port_id": $port_id,
      "sequence": "1"
    }]
' "$INPUT_GENESIS_FILE" > "$OUTPUT_GENESIS_FILE"

echo "Done. Patched Celestia genesis written to $OUTPUT_GENESIS_FILE"
