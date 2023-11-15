#!/bin/bash

# ========= CONFIG =========

NEUTRON_NODE_REST_ADDR=http://127.0.0.1:1317

WALLET_KEY=demowallet1
WALLET_MNEMONIC='banner spread envelope side kite person disagree path silver will brother under couch edit food venture squirrel civil budget number acquire point work mass'

TOKENFACTORY_EXPECTED_PARAMS='{"params":{"denom_creation_fee":[],"denom_creation_gas_consume":"0","fee_collector_address":"neutron1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrstdxvff"}}'

CREATED_DENOM_SUBDENOM=lolkek
BEFORE_SEND_HOOK_ADDR=neutron1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrstdxvff

# ==========================

# make sure WALLET_KEY exists in keyring
echo "checking $WALLET_KEY existence in keyring..."
wallet_address=$(neutrond keys show -a ${WALLET_KEY} --keyring-backend test 2>/dev/null)
if [[ "$wallet_address" == "" ]]
then
    echo "$WALLET_MNEMONIC" | neutrond keys add ${WALLET_KEY} --keyring-backend test --recover
    wallet_address=$(neutrond keys show -a ${WALLET_KEY} --keyring-backend test)
    if [[ "$wallet_address" == "" ]]
    then
        echo "something went wrong, see error above"
        exit 1
    fi
fi
echo ""

# check tokenfactory module params
echo "checking tokenfactory module parameters..."
params=$(neutrond q tokenfactory params --output json)
if [[ "$params" != "$TOKENFACTORY_EXPECTED_PARAMS" ]]
then
    echo "tokenfactory params are not as expected:"
    echo "\texpected: $TOKENFACTORY_EXPECTED_PARAMS"
    echo "\tgot:      $params"
    exit 1
fi
echo ""

# create denom
echo "creating a denom from addr $wallet_address with subdenom $CREATED_DENOM_SUBDENOM..."
neutrond tx tokenfactory create-denom $CREATED_DENOM_SUBDENOM --from ${WALLET_KEY} --keyring-backend test -y --gas-prices 1untrn --gas 200000
sleep 4
created_denoms=$(neutrond q tokenfactory denoms-from-creator $wallet_address)
echo ""

# check if denom created properly
echo "checking if denom has been created as expected..."
expected_created_denom=factory/$wallet_address/$CREATED_DENOM_SUBDENOM
expected_created_denoms="{\"denoms\":[\"$expected_created_denom\"]}"
if [[ "$created_denoms" != "$expected_created_denoms" ]]
then
    echo "tokenfactory denoms created by $WALLET_KEY are not as expected:"
    echo "\texpected: $expected_created_denoms"
    echo "\tgot:      $created_denoms"
    exit 1
fi
echo ""

# check before-send-hook setting
echo "setting before send hook..."
neutrond tx tokenfactory set-before-send-hook ${expected_created_denom} ${BEFORE_SEND_HOOK_ADDR} --from ${WALLET_KEY} --keyring-backend test -y --gas-prices 1untrn --gas 200000
sleep 4
before_send_hook=$(curl -s ${NEUTRON_NODE_REST_ADDR}/osmosis/tokenfactory/v1beta1/denoms/${expected_created_denom}/before_send_hook)
expected_before_send_hook='{"contract_addr":"'"${BEFORE_SEND_HOOK_ADDR}"'"}'
if [[ "$before_send_hook" != "$expected_before_send_hook" ]]
then
    echo "before send hook set for denom $expected_created_denom is not as expected:"
    echo "\texpected: $expected_before_send_hook"
    echo "\tgot:      $before_send_hook"
    exit 1
fi
echo ""

echo "All good!"
