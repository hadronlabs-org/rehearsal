# ===== FUNCTIONS

# wait for tx with timeout
function wait_for_tx() {
  local TX_HASH=$1
  local TIMEOUT=${2:-"60"}
  local SLEEP_TIME=${3:-"1"}
  local END_TIME=$(($(date +%s) + $TIMEOUT))
  while true; do
    local TX=$(neutrond query tx $TX_HASH --node $NODE --output json --chain-id $CHAIN_ID 2>&1)
    # check if tx has "not found" string in it
    local NF=$(echo $TX | grep -c "not found")
    if [[ $NF -eq 0 ]]; then
      local TX_STATUS=$(echo $TX | jq -r '.code')
      echo >&2 "Tx $TX_HASH succeeded"
      echo $TX
      break
    fi
    if [[ $(date +%s) -gt $END_TIME ]]; then
      echo >&2 "Tx $TX_HASH failed"
      exit 1
    fi
    sleep $SLEEP_TIME
  done
}

function execute_contract() {
  echo >&2 ""
  echo >&2 "Executing contract $1 with message" $2
  CONTRACT=$1
  MESSAGE=$2
  SENDER=$3
  AMOUNT=$4
  local RES=$(neutrond tx wasm execute $CONTRACT "${MESSAGE}" --from "$SENDER" --keyring-backend=test  --node $NODE --output json --chain-id $CHAINID --broadcast-mode async -y --gas auto --home=home --gas-prices $GAS_PRICES --gas-adjustment 1.5 --amount $AMOUNT)
  RES=$(wait_for_tx $(echo $RES | jq -r '.txhash'))
  echo "$RES"
}

# node ./bin/ibcheetah.js https://rest-falcron.pion-1.ntrn.tech provider
# cat out.json | fx 'x.filter(y => y.channel.port_id === "transfer" && y.channel.state === "STATE_OPEN" && y.connection.client_status === "Active")'

# ===== VARIABLES

# ==================== mainnet fork (PICK)
GAS_PRICES="1untrn"
CHAINID="neutron-1"
TEST_WALLET="neutrond_mainnet_rehearsal" # neutron1kyn3jx88wvnm3mhnwpuue29alhsatwzrpkwhu6
TEST_WALLET_2="neutron_kek"
GAIA_TEST_WALLET="mainnet_smoke" # cosmos188avtu8sxlstwqcd3mnsse50yuystgqp6such5
KEYS_HOME="~/.neutrond-rehearsal"
GAIA_KEYS_HOME="~/.gaiad-theta/"
NODE="http://37.27.55.151:26657"
ASTROPORT_POOL_CONTRACT_ADDRESS="neutron1e22zh5p8meddxjclevuhjmfj69jxfsa8uu3jvht72rv9d8lkhves6t8veq" # NTRN-ATOM pool
TRANSFER_DESTINATION="cosmos1mwfj5j8v2aafqqnjekeqtupgc6894033nvtgre"
TRANSFER_DESTINATION_NODE="https://rpc.sentry-02.theta-testnet.polypore.xyz:443"

TRANSFER_CHANNEL_ID="channel-37"
CONNECTION_ID="connection-38" # gaia: connection-29
ICA_CONNECTION_ID="connection-38"
ICA_NODE="https://rpc.sentry-02.theta-testnet.polypore.xyz:443"

VALIDATOR_ADDR="cosmosvaloper10v6wvdenee8r9l6wlsphcgur2ltl8ztkfrvj9a"
IBC_TRANSFER_ADDRESS=neutron19lruyp88873vlunjrdfnz3pq4h05f0hdtk7my376v06h5v7zm7eqlsjaf7
NEUTRON_INTERCHAIN_TXS_ADDRESS="neutron14nfxza0puh5rzz7rmrml6ydcckyyasmfwcnf57snyyel5kud49jqya025q"

# ===== ASTROPORT TEST - SWAP

## ==== execute swap
execute_contract $ASTROPORT_POOL_CONTRACT_ADDRESS  '{"swap": {"offer_asset": {"info": {"native_token": {"denom": "untrn"}}, "amount": "100000"}}}' $TEST_WALLET
RES_1=$(neutrond tx wasm execute ${ASTROPORT_POOL_CONTRACT_ADDRESS} '{"swap": {"offer_asset": {"info": {"native_token": {"denom": "untrn"}}, "amount": "100000"}}}' --from ${TEST_WALLET} --gas 50000000 --chain-id ${CHAINID} --broadcast-mode=block --gas-prices ${GAS_PRICES}  -y --output json --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --amount "100000untrn")
RES=$(neutrond q tx $(echo $RES_1 | jq -r '.txhash') --output json)
echo $RES | jq -r '.raw_log'

## ==== Check balance on test wallet (should include swapped asset)
TEST_WALLET_ADDRESS=$(neutrond keys show $TEST_WALLET --keyring-backend test --output json | jq -r '.address')
RES=$(neutrond q bank balances $TEST_WALLET_ADDRESS --node $NODE --output json)
echo "Test wallet balances: $RES"

# ===== IBC transfer (requires ibc_setup.sh to be complete)

## ==== Make IBC transfer from CLI
RES_1=$(neutrond tx ibc-transfer transfer "transfer" $TRANSFER_CHANNEL_ID $TRANSFER_DESTINATION "55untrn"  --from ${TEST_WALLET} --gas 5000000 --chain-id ${CHAINID} --broadcast-mode=block --gas-prices ${GAS_PRICES}  -y --output json --keyring-backend test --home ${KEYS_HOME} --node ${NODE})
RES=$(neutrond q tx $(echo $RES_1 | jq -r '.txhash') --output json --node $NODE)
gaiad q bank balances $TRANSFER_DESTINATION --node $TRANSFER_DESTINATION_NODE
neutrond q bank balances neutron1kyn3jx88wvnm3mhnwpuue29alhsatwzrpkwhu6 --node $NODE

## ==== Make IBC transfer from contract (requires ibc_transfer contract)

### Send money to ibc transfer contract
SEND_RES_1=$(neutrond tx bank send $TEST_WALLET ${IBC_TRANSFER_ADDRESS} 5000000untrn  --gas-prices ${GAS_PRICES} --chain-id ${CHAINID} --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --broadcast-mode=block -y --output json)
echo $SEND_RES_1
SEND_RES=$(neutrond q tx $(echo $SEND_RES_1 | jq -r '.txhash') --output json --node $NODE)
CONTRACT_BALANCES=$(neutrond q bank balances $IBC_TRANSFER_ADDRESS --node $NODE --output json)
echo "IBC transfer contract balance: ${CONTRACT_BALANCES}"

### Set ibc fee
SET_IBC_FEE_MSG='{"set_fees": {"recv_fee": "0", "ack_fee": "200000", "timeout_fee": "200000", "denom": "untrn"}}'
SET_IBC_FEE_RES_1=$(neutrond tx wasm execute $IBC_TRANSFER_ADDRESS $SET_IBC_FEE_MSG --from ${TEST_WALLET_2} --gas 700000 --chain-id ${CHAINID} --broadcast-mode=block --gas-prices ${GAS_PRICES}  -y --output json --keyring-backend test --home ${KEYS_HOME} --node ${NODE})
SET_IBC_FEE_RES=$(neutrond q tx $(echo $SET_IBC_FEE_RES_1 | jq -r '.txhash') --output json --node $NODE)
echo $SET_IBC_FEE_RES | jq -r '.raw_log'

### Executing ibc transfer
IBC_TRANSFER_MSG='{"send": {"channel": "'"$TRANSFER_CHANNEL_ID"'", "to": "'"$TRANSFER_DESTINATION"'", "denom": "untrn", "amount": "100007"}}'
IBC_TRANSFER_RES_1=$(neutrond tx wasm execute $IBC_TRANSFER_ADDRESS $IBC_TRANSFER_MSG --from ${TEST_WALLET} --gas 700000 --chain-id ${CHAINID} --broadcast-mode=block --gas-prices ${GAS_PRICES}  -y --output json --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --amount "100000untrn")
IBC_TRANSFER_RES=$(neutrond q tx $(echo $IBC_TRANSFER_RES_1 | jq -r '.txhash') --output json --node $NODE)
echo $IBC_TRANSFER_RES_1 | jq -r '.raw_log'
gaiad q bank balances $TRANSFER_DESTINATION --node $TRANSFER_DESTINATION_NODE
gaiad q ibc-transfer denom-trace TODO_IBC_DENOM --node $TRANSFER_DESTINATION_NODE

# ======= ICA tests (Create ICA, execute ICA delegate) (requires neutron_interchain_txs contract)

## Test ICA transaction (delegate) (requires neutron_interchain_txs contract)
### Executing register ICA
INFO='{"connection_id": "'"$ICA_CONNECTION_ID"'", "interchain_account_id": "test2"}'
REGISTER_ICA_MSG='{"register": '"$INFO"'}'
REGISTER_ICA_RES_1=$(neutrond tx wasm execute $NEUTRON_INTERCHAIN_TXS_ADDRESS $REGISTER_ICA_MSG --from ${TEST_WALLET} --gas 700000 --chain-id ${CHAINID} --broadcast-mode=block --gas-prices ${GAS_PRICES}  -y --output json --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --amount "100000untrn")
REGISTER_ICA_RES=$(neutrond q tx $(echo $REGISTER_ICA_RES_1 | jq -r '.txhash') --output json --node $NODE)
echo "Register ICA RES: $REGISTER_ICA_RES"

ICA_QUERY='{"interchain_account_address": '"$INFO"'}'
ICA_ADDRESS=$(neutrond q wasm contract-state smart $NEUTRON_INTERCHAIN_TXS_ADDRESS $ICA_QUERY -o json | jq --raw-output ".data.interchain_account_address" --node $NODE)
echo "ICA ADDRESS: $ICA_ADDRESS"

ICA_QUERY_2='{"interchain_account_address_from_contract": {"interchain_account_id": "test2"}}'
ICA_ADDRESS=$(neutrond q wasm contract-state smart $NEUTRON_INTERCHAIN_TXS_ADDRESS $ICA_QUERY_2  --node $NODE -o json | jq --raw-output ".data[0]")
echo "ICA ADDRESS: $ICA_ADDRESS"

### Send money to delegate to the contract
gaiad tx bank send $GAIA_TEST_WALLET $ICA_ADDRESS 300000uatom --keyring-backend test  --home $GAIA_KEYS_HOME --node $ICA_NODE --chain-id theta-testnet-001 --gas 100000 --gas-prices 0.01uatom
gaiad q bank balances $ICA_ADDRESS --node $ICA_NODE

### Set ibc fees for interchaintxs contract
SET_IBC_FEE_MSG='{"set_fees": {"recv_fee": "0", "ack_fee": "200000", "timeout_fee": "200000", "denom": "untrn"}}'
SET_IBC_FEE_RES_1=$(neutrond tx wasm execute $NEUTRON_INTERCHAIN_TXS_ADDRESS $SET_IBC_FEE_MSG --from ${TEST_WALLET} --gas 700000 --chain-id ${CHAINID} --broadcast-mode=block --gas-prices ${GAS_PRICES}  -y --output json --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --amount "100000untrn")
SET_IBC_FEE_RES=$(neutrond q tx $(echo $SET_IBC_FEE_RES_1 | jq -r '.txhash') --output json --node $NODE)
echo $SET_IBC_FEE_RES | jq -r '.raw_log'

### Executing delegate
INFO='{"interchain_account_id": "test2", "validator": "'"$VALIDATOR_ADDR"'", "amount": "50000", "denom": "uatom"}'
DELEGATE_ICA_MSG='{"delegate": '"$INFO"'}'
DELEGATE_ICA_RES_1=$(neutrond tx wasm execute $NEUTRON_INTERCHAIN_TXS_ADDRESS $DELEGATE_ICA_MSG --from ${TEST_WALLET} --gas 700000 --chain-id ${CHAINID} --broadcast-mode=block --gas-prices ${GAS_PRICES}  -y --output json --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --amount "400000untrn")
DELEGATE_ICA_RES=$(neutrond q tx $(echo $DELEGATE_ICA_RES_1 | jq -r '.txhash') --output json --node $NODE)
echo "DELEGATE_ICA_RES: $DELEGATE_ICA_RES"

### Check delegations (should contain newly added delegation)
gaiad q staking delegations $ICA_ADDRESS --node $ICA_NODE --output json
