#!/bin/bash

free -h
cat /sys/fs/cgroup/memory.max

celestia-appd tendermint unsafe-reset-all --home /opt/celestia/data

CHAINID=${CHAINID:-"celestia"}
VAL_MNEMONIC=${VAL_MNEMONIC:-"power derive atom text blind zoo sting ripple beyond have october nest rack certain lizard slim april light village faculty bundle trophy vote direct"}
CUSTOM_SCRIPT_PATH=/opt/celestia/custom/config.sh

if [ ! -d "/opt/celestia/data_backup" ]; then
    echo "Previous state backup not found, starting from genesis..."
    export SNAPSHOT_INPUT=/opt/celestia/snapshot/snapshot.json

    echo "Creating genesis..."
    GENESIS_OUTPUT=/opt/celestia/data/config/genesis.json /opt/celestia/create_genesis.sh

    echo "$VAL_MNEMONIC" | celestia-appd keys add val --home /opt/celestia/data --recover --keyring-backend=test

    celestia-appd add-genesis-account "$(celestia-appd --home "/opt/celestia/data" keys show val -a --keyring-backend=test)" "51000000000000utia"  --home "/opt/celestia/data"

    celestia-appd add-genesis-account $MAIN_WALLET 1000000000000utia --home /opt/celestia/data

    celestia-appd gentx val "50000000000000utia" --home /opt/celestia/data --chain-id "$CHAINID" --gas 1000000 --gas-prices 0.0053utia --keyring-backend=test

    celestia-appd collect-gentxs --home /opt/celestia/data --log_level=error --log-to-file="/opt/celestia/data/collect-gentxs.log" --trace > /dev/null 2>&1

    if [ -e "$CUSTOM_SCRIPT_PATH" ]; then
        echo "Applying custom configurations..."
        TEMP_GENESIS=$(mktemp genesis_XXXX.json)
        CUSTOM_GENESIS=$(mktemp custom_genesis_XXXX.json)
        cp /opt/celestia/data/config/genesis.json $TEMP_GENESIS
        /bin/bash $CUSTOM_SCRIPT_PATH $TEMP_GENESIS $CUSTOM_GENESIS
        if jq empty "$CUSTOM_GENESIS"; then
            cp $CUSTOM_GENESIS /opt/celestia/data/config/genesis.json
        else
            echo "Custom genesis is not valid, aborting..."
            exit 1
        fi
    fi

    crudini --set /opt/celestia/data/config/app.toml api enable true
    crudini --set /opt/celestia/data/config/app.toml api swagger true
    crudini --set /opt/celestia/data/config/app.toml api address "\"tcp://0.0.0.0:1317\""
    crudini --set /opt/celestia/data/config/app.toml api enabled-unsafe-cors true
    crudini --set /opt/celestia/data/config/app.toml grpc enable true
    crudini --set /opt/celestia/data/config/app.toml grpc-web enable true
    crudini --set /opt/celestia/data/config/app.toml grpc-web enable-unsafe-cors true
    sed -i 's/^pruning =.*/pruning = "nothing"/' /opt/celestia/data/config/app.toml
    sed -i 's/^minimum\-gas\-prices =.*/minimum\-gas\-prices = "0utia"/' /opt/celestia/data/config/app.toml

    crudini --set /opt/celestia/data/config/config.toml rpc cors_allowed_origins "[\"*\"]"
    crudini --set /opt/celestia/data/config/config.toml rpc laddr "\"tcp://0.0.0.0:26657\""
    crudini --set /opt/celestia/data/config/app.toml grpc address "\"0.0.0.0:9090\""

    echo "Starting celestia..."
    celestia-appd start --home /opt/celestia/data --x-crisis-skip-assert-invariants --iavl-disable-fastnode false &
    CELESTIA_PID=$(echo $!)

    echo "Celestia started with PID $CELESTIA_PID"

    while true; do
        STATUS=$(curl -s http://localhost:26657/status)

        LAST_HEIGHT=$(echo "$STATUS" | jq -r .result.sync_info.latest_block_height)
        EARLIEST_HEIGHT=$(echo "$STATUS" | jq -r .result.sync_info.earliest_block_height)
        echo "Earliest height: $EARLIEST_HEIGHT, last height: $LAST_HEIGHT"

        # check if new blocks has been generated
        # if so, create backup and start anew
        if [ -n "$LAST_HEIGHT" ] && [ -n "$EARLIEST_HEIGHT" ] && [ "$LAST_HEIGHT" != "$EARLIEST_HEIGHT" ]; then
            echo "Killing celestia-appd to create backup"
            kill -9 $CELESTIA_PID
            echo "Creating backup..."
            mkdir /opt/celestia/data_backup -p
            cp -r /opt/celestia/data/* /opt/celestia/data_backup/
            echo "Backup copied"
            break
        fi

        # check if process exited abnormally
        # this can happen if we don't have enough RAM
        kill -0 $CELESTIA_PID
        EXIT_STATUS=$(echo $?)
        if [ $EXIT_STATUS -ne 0 ]; then
            echo "Process has been terminated. Exit code: $EXIT_STATUS"
            exit -1
        fi
        sleep 60
    done
fi

sed -i 's|^log_file = .*|log_file = ""|' /opt/celestia/data/config/config.toml
sed -i 's/^log_level *= *.*/log_level = "debug"/' /opt/celestia/data/config/config.toml

echo "Starting celestia using state backup..."
cp -r /opt/celestia/data_backup/data/* /opt/celestia/data/data/
exec celestia-appd start --home /opt/celestia/data \
  --x-crisis-skip-assert-invariants --iavl-disable-fastnode false --trace
