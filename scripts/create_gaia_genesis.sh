#!/bin/bash

set -euo pipefail
IFS=$'\n\t'

SNAPSHOT_INPUT=${SNAPSHOT_INPUT:-"./snapshot.json"}
GENESIS_OUTPUT=${GENESIS_OUTPUT:-"./genesis.json"}

INITIAL_HEIGHT=$(jq -r '.initial_height' "$SNAPSHOT_INPUT")
ENABLE_HEIGHT=$((INITIAL_HEIGHT + 2))

jq --arg enable_height "$ENABLE_HEIGHT" '
  del(.validators)

  | .app_state.provider = {
      "valset_update_id": 1,
      "params": {
        "template_client": {
          "chain_id": "consumer-chain",
          "trust_level": { "numerator": "1", "denominator": "3" },
          "trusting_period": "1209600s",
          "unbonding_period": "1814400s",
          "max_clock_drift": "5s",
          "frozen_height": { "revision_number": "0", "revision_height": "0" },
          "latest_height": { "revision_number": "0", "revision_height": "1" },
          "proof_specs": [],
          "upgrade_path": ["upgrade", "upgradedIBCState"],
          "allow_update_after_expiry": true,
          "allow_update_after_misbehaviour": true
        },
        "trusting_period_fraction": "0.333333333333333333",
        "ccv_timeout_period": "1814400s",
        "slash_meter_replenish_period": "3600s",
        "slash_meter_replenish_fraction": "0.05",
        "consumer_reward_denom_registration_fee": {
          "denom": "uatom", "amount": "10000000"
        },
        "blocks_per_epoch": "1000",
        "number_of_epochs_to_start_receiving_rewards": "3",
        "max_provider_consensus_validators": "1000"
      }
    }

  | .app_state.ccv = {}
  | .app_state.ccvconsumer = {}
  | .app_state.ccv_consumer = {}

  | .app_state.wasm.contracts = []
  | .app_state.wasm.codes = []
  | .app_state.wasm.sequences = []

  | .app_state.bank.denom_metadata |= map(select(.name == "uatom"))

  | .app_state.ibc.client_genesis.params.allowed_clients = ["09-localhost", "07-tendermint"]

  | .app_state.ibc.client_genesis.clients |= map(
      select(.client_state.chain_id == "gaia-4" or .client_state.chain_id == "neutron-1")
    )
  | .app_state.ibc.client_genesis.clients as $filtered_clients
  | ($filtered_clients | map(.client_id)) as $valid_client_ids

  | .app_state.ibc.client_genesis.clients_consensus |=
      map(select(.client_id as $id | $valid_client_ids | index($id)))
  | .app_state.ibc.client_genesis.clients_metadata |=
      map(select(.client_id as $id | $valid_client_ids | index($id)))

  | .app_state.ibc.connection_genesis.client_connection_paths |=
      map(select(.client_id as $id | $valid_client_ids | index($id)))
  | .app_state.ibc.connection_genesis.connections |=
      map(select(.client_id as $id | $valid_client_ids | index($id)))
  | (.app_state.ibc.connection_genesis.connections | map(.id)) as $conn_ids

  | .app_state.ibc.channel_genesis.channels |=
      map(select(.connection_hops | any(. as $c | $conn_ids | index($c))))
  | (.app_state.ibc.channel_genesis.channels | map(.channel_id)) as $chan_ids

  | .app_state.ibc.channel_genesis.send_sequences |=
      map(select(.channel_id as $c | $chan_ids | index($c)))
  | .app_state.ibc.channel_genesis.recv_sequences |=
      map(select(.channel_id as $c | $chan_ids | index($c)))
  | .app_state.ibc.channel_genesis.ack_sequences |=
      map(select(.channel_id as $c | $chan_ids | index($c)))

  | if .app_state.ibc.channel_genesis.commitments then
      .app_state.ibc.channel_genesis.commitments |=
        map(select(.channel_id as $c | $chan_ids | index($c)))
    else . end
  | if .app_state.ibc.channel_genesis.receipts then
      .app_state.ibc.channel_genesis.receipts |=
        map(select(.channel_id as $c | $chan_ids | index($c)))
    else . end
  | if .app_state.ibc.channel_genesis.acknowledgements then
      .app_state.ibc.channel_genesis.acknowledgements |=
        map(select(.channel_id as $c | $chan_ids | index($c)))
    else . end

  | .consensus.params.abci.vote_extensions_enable_height = $enable_height
  | .consensus.validators = []

  | .app_state.revenue.validators = []
  | .app_state.staking.last_validator_powers = []
  | .app_state.staking.last_total_power = "0"
  | .app_state.staking.params.max_validators = 1

  | .app_state.auth.accounts |= map(
      if .["@type"] | test("VestingAccount$") or contains("vesting") then
        {
          "@type": "/cosmos.auth.v1beta1.BaseAccount",
          "address": .base_vesting_account.base_account.address,
          "pub_key": .base_vesting_account.base_account.pub_key,
          "account_number": .base_vesting_account.base_account.account_number,
          "sequence": .base_vesting_account.base_account.sequence
        }
      else
        .
      end
    )

  | .app_state.distribution.validator_accumulated_commissions = []
  | .app_state.distribution.validator_current_rewards = []
  | .app_state.distribution.delegator_starting_infos = []
  | .app_state.distribution.outstanding_rewards = []
  | .app_state.distribution.fee_pool.community_pool = [{denom: "uatom", amount: "1"}]

  | .app_state.bank.balances |=
      map(
        if .address == "cosmos1jv65s3grqf6v6jl3dp4t6c9t9rk99cd88lyufl" then
          {address, coins: [{denom: "uatom", amount: "1"}]}
        else
          .
        end
      )

  | (.app_state.gov.deposits
      | map(.amount[] | select(.denom == "uatom") | (.amount | tonumber))
      | add
    ) as $gov_deposits

  | .app_state.bank.balances |=
    map(
      if .address == "cosmos10d07y265gmmuvt4z0w9aw880jnsr700j6zn9kn" then
        {address, coins: [{denom: "uatom", amount: ($gov_deposits | tostring)}]}
      else
        .
      end
    )

  | .app_state.bank.balances |= map({address, coins: (.coins | map(select(.denom == "uatom")))})
  | .app_state.bank.supply =
      (
        [.app_state.bank.balances[].coins[]
         | {denom: .denom, amount: (.amount | tonumber)}]
        | group_by(.denom)
        | map({denom: .[0].denom, amount: (map(.amount) | add | tostring)})
      )

  | .app_state.gov.params.voting_period = "300s"
  | .app_state.gov.params.quorum = "0.000000000000000001"
  | .app_state.gov.params.threshold = "0.000000000000000001"
  | .app_state.gov.params.max_deposit_period = "300s"
  | .app_state.gov.params.min_deposit[0].amount = "100"
  | .app_state.gov.params.expedited_voting_period = "60s"
  | .app_state.gov.params.expedited_threshold = "0.000000000000000002"
  | .app_state.gov.params.expedited_min_deposit[0].amount = "101"
' "$SNAPSHOT_INPUT" > "$GENESIS_OUTPUT"