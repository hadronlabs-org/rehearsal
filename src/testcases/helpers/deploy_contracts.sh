# TODO: use variables

## Deploy interchain txs contract
NEUTRON_INTERCHAIN_TXS_STORE_RES_1=$(neutrond tx wasm store ./src/artifacts/neutron_interchain_txs.wasm --from $TEST_WALLET --gas 3000000 --gas-prices ${GAS_PRICES} --chain-id ${CHAINID} --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --broadcast-mode=sync -y --output json)
NEUTRON_INTERCHAIN_TXS_STORE_RES=$(neutrond q tx $(echo $NEUTRON_INTERCHAIN_TXS_STORE_RES_1 | jq -r '.txhash') --output json --node $NODE)
NEUTRON_INTERCHAIN_TXS_CODE_ID=$(echo $NEUTRON_INTERCHAIN_TXS_STORE_RES | jq -r '.logs[0].events[1].attributes[1].value')
echo "NEUTRON_INTERCHAIN_TXS_CODE_ID: ${NEUTRON_INTERCHAIN_TXS_CODE_ID}"

NEUTRON_INTERCHAIN_TXS_INSTANTIATE_RES_1=$(neutrond tx wasm instantiate ${NEUTRON_INTERCHAIN_TXS_CODE_ID} '{}' --from $TEST_WALLET --gas 500000 --gas-prices ${GAS_PRICES} --chain-id ${CHAINID} --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --broadcast-mode=sync -y --output json --label "ibc_transfer" --admin ${TEST_WALLET})
NEUTRON_INTERCHAIN_TXS_INSTANTIATE_RES=$(neutrond q tx $(echo $NEUTRON_INTERCHAIN_TXS_INSTANTIATE_RES_1 | jq -r '.txhash') --output json --node $NODE)
NEUTRON_INTERCHAIN_TXS_ADDRESS=$(echo $NEUTRON_INTERCHAIN_TXS_INSTANTIATE_RES | jq -r '.logs[0].events[0].attributes[0].value')
echo $NEUTRON_INTERCHAIN_TXS_ADDRESS

### Deploy IBC transfer contracct
IBC_TRANSFER_STORE_RES_1=$(neutrond tx wasm store ./src/artifacts/ibc_transfer.wasm --from $TEST_WALLET --gas 3000000 --gas-prices ${GAS_PRICES} --chain-id ${CHAINID} --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --broadcast-mode=sync -y --output json)
echo $IBC_TRANSFER_STORE_RES_1
IBC_TRANSFER_STORE_RES=$(neutrond q tx $(echo $IBC_TRANSFER_STORE_RES_1 | jq -r '.txhash') --output json --node $NODE)
IBC_TRANSFER_CODE_ID=$(echo $IBC_TRANSFER_STORE_RES | jq -r '.logs[0].events[1].attributes[1].value')
echo "IBC_TRANSFER_CODE_ID: ${IBC_TRANSFER_CODE_ID}"

IBC_TRANSFER_INSTANTIATE_RES_1=$(neutrond tx wasm instantiate ${IBC_TRANSFER_CODE_ID} '{}' --from $TEST_WALLET --gas 1000000 --gas-prices ${GAS_PRICES} --chain-id ${CHAINID} --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --broadcast-mode=sync -y --output json --label "ibc_transfer" --admin ${TEST_WALLET})
echo $IBC_TRANSFER_INSTANTIATE_RES_1
IBC_TRANSFER_INSTANTIATE_RES=$(neutrond q tx $(echo $IBC_TRANSFER_INSTANTIATE_RES_1 | jq -r '.txhash') --output json --node $NODE)
IBC_TRANSFER_ADDRESS=$(echo $IBC_TRANSFER_INSTANTIATE_RES | jq -r '.logs[0].events[0].attributes[0].value')
echo "IBC_TRANSFER_ADDRESS: $IBC_TRANSFER_ADDRESS"
