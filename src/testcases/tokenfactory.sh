#!/bin/bash

# make sure demowallet1 exists in keyring
echo "checking demowallet1 existence in keyring..."
demowallet_address=$(neutrond keys show -a demowallet1 --keyring-backend test 2>/dev/null)
if [[ "$demowallet_address" == "" ]]
then
    DEMO_MNEMONIC_1="banner spread envelope side kite person disagree path silver will brother under couch edit food venture squirrel civil budget number acquire point work mass"
    echo "$DEMO_MNEMONIC_1" | neutrond keys add demowallet1 --keyring-backend test --recover
    demowallet_address=$(neutrond keys show -a demowallet1 --keyring-backend test)
    if [[ "$demowallet_address" == "" ]]
    then
        echo "something went wrong, see error above"
        exit 1
    fi
fi
echo ""

# check tokenfactory module params
echo "checking tokenfactory module parameters..."
params=$(neutrond q tokenfactory params --output json)
expected_params='{"params":{"denom_creation_fee":[],"denom_creation_gas_consume":"0","fee_collector_address":"neutron1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrstdxvff"}}'
if [[ "$params" != "$expected_params" ]]
then
    echo "tokenfactory params are not as expected:"
    echo "\texpected: $expected_params"
    echo "\tgot:      $params"
    exit 1
fi
echo ""

# create denom
subdenom="lolkek"
echo "creating a denom from addr $demowallet_address with subdenom $subdenom..."
neutrond tx tokenfactory create-denom $subdenom --from demowallet1 --keyring-backend test -y --gas-prices 1untrn --gas 200000
sleep 3
created_denoms=$(neutrond q tokenfactory denoms-from-creator $demowallet_address)
echo ""

# check if denom created properly
echo "checking if denom has been created as expected..."
expected_created_denom=factory/$demowallet_address/$subdenom
expected_created_denoms="{\"denoms\":[\"$expected_created_denom\"]}"
if [[ "$created_denoms" != "$expected_created_denoms" ]]
then
    echo "tokenfactory denoms created by demowallet1 are not as expected:"
    echo "\texpected: $expected_created_denoms"
    echo "\tgot:      $created_denoms"
    exit 1
fi
echo ""

# check before-send-hook setting
echo "setting before send hook..."
neutrond tx tokenfactory set-before-send-hook ${expected_created_denom} neutron1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrstdxvff --from demowallet1 --keyring-backend test -y --gas-prices 1untrn --gas 200000
sleep 3
before_send_hook=$(curl -s http://localhost:1317/osmosis/tokenfactory/v1beta1/denoms/${expected_created_denom}/before_send_hook)
expected_before_send_hook='{"contract_addr":"neutron1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrstdxvff"}'
if [[ "$before_send_hook" != "$expected_before_send_hook" ]]
then
    echo "before send hook set for denom $expected_created_denom is not as expected:"
    echo "\texpected: $expected_before_send_hook"
    echo "\tgot:      $before_send_hook"
    exit 1
fi
echo ""

echo "All good!"
