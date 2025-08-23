#!/bin/bash

free -h
cat /sys/fs/cgroup/memory.max

gaiad tendermint unsafe-reset-all --home /opt/gaia/data

echo "Start..."

CHAINID=${CHAINID:-"cosmoshub-4"}
VAL_MNEMONIC=${VAL_MNEMONIC:-"input bench trouble room broom afraid print way hood property curve purse water monkey time aware connect neglect web opinion glass puzzle become gadget"}
CUSTOM_SCRIPT_PATH=/opt/gaia/custom/config.sh

if [ ! -d "/opt/gaia/data_backup" ]; then
    echo "Previous state backup not found, starting from genesis..."
    export SNAPSHOT_INPUT=/opt/gaia/snapshot/snapshot.json

    echo "Creating genesis..."
    GENESIS_OUTPUT=/opt/gaia/data/config/genesis.json /opt/gaia/create_genesis.sh

    echo "1..."
    echo "$VAL_MNEMONIC" | gaiad keys add val --home /opt/gaia/data --recover --keyring-backend=test

    echo "2..."
    gaiad genesis add-genesis-account "$(gaiad --home "/opt/gaia/data" keys show val -a --keyring-backend=test)" "51000000000000uatom"  --home "/opt/gaia/data"

    echo "3..."
    gaiad genesis add-genesis-account $MAIN_WALLET 1000000000000uatom --home /opt/gaia/data

    echo "4..."
    gaiad genesis gentx val "50000000000000uatom" --home /opt/gaia/data --chain-id "$CHAINID" --gas 1000000 --gas-prices 0.0053uatom --keyring-backend=test

    echo "5..."
    gaiad genesis collect-gentxs --home /opt/gaia/data --log_level=debug > /dev/null 2>&1

    if [ -e "$CUSTOM_SCRIPT_PATH" ]; then
        echo "Applying custom configurations..."
        TEMP_GENESIS=$(mktemp genesis_XXXX.json)
        CUSTOM_GENESIS=$(mktemp custom_genesis_XXXX.json)
        cp /opt/gaia/data/config/genesis.json $TEMP_GENESIS
        /bin/bash $CUSTOM_SCRIPT_PATH $TEMP_GENESIS $CUSTOM_GENESIS
        if jq empty "$CUSTOM_GENESIS"; then
            cp $CUSTOM_GENESIS /opt/gaia/data/config/genesis.json
        else
            echo "Custom genesis is not valid, aborting..."
            exit 1
        fi
    fi

    echo "6..."

    crudini --set /opt/gaia/data/config/app.toml api enable true
    crudini --set /opt/gaia/data/config/app.toml api swagger true
    crudini --set /opt/gaia/data/config/app.toml api address "\"tcp://0.0.0.0:1317\""
    crudini --set /opt/gaia/data/config/app.toml api enabled-unsafe-cors true
    crudini --set /opt/gaia/data/config/app.toml grpc enable true
    crudini --set /opt/gaia/data/config/app.toml grpc-web enable true
    crudini --set /opt/gaia/data/config/app.toml grpc-web enable-unsafe-cors true
    sed -i 's/^pruning =.*/pruning = "nothing"/' /opt/gaia/data/config/app.toml
    sed -i 's/^minimum\-gas\-prices =.*/minimum\-gas\-prices = "0uatom"/' /opt/gaia/data/config/app.toml
    sed -i 's/^log_level *= *.*/log_level = "info"/' /opt/gaia/data/config/config.toml

    crudini --set /opt/gaia/data/config/config.toml rpc cors_allowed_origins "[\"*\"]"
    crudini --set /opt/gaia/data/config/config.toml rpc laddr "\"tcp://0.0.0.0:26657\""
    crudini --set /opt/gaia/data/config/app.toml grpc address "\"0.0.0.0:9090\""

    echo "Starting cosmoshub..."
    gaiad start --home /opt/gaia/data --x-crisis-skip-assert-invariants --iavl-disable-fastnode false --log_level info &
    COSMOSHUB_PID=$(echo $!)

    echo "Cosmoshub started with PID $COSMOSHUB_PID"

    while true; do
        STATUS=$(curl -s http://localhost:26657/status)

        LAST_HEIGHT=$(echo "$STATUS" | jq -r .result.sync_info.latest_block_height)
        EARLIEST_HEIGHT=$(echo "$STATUS" | jq -r .result.sync_info.earliest_block_height)
        echo "Earliest height: $EARLIEST_HEIGHT, last height: $LAST_HEIGHT"

        # check if new blocks has been generated
        # if so, create backup and start anew
        if [ -n "$LAST_HEIGHT" ] && [ -n "$EARLIEST_HEIGHT" ] && [ "$LAST_HEIGHT" != "$EARLIEST_HEIGHT" ]; then
            echo "Killing gaiad to create backup"
            kill -9 $COSMOSHUB_PID
            echo "Creating backup..."
            mkdir /opt/gaia/data_backup -p
            cp -r /opt/gaia/data/* /opt/gaia/data_backup/
            echo "Backup copied"
            break
        fi

        # check if process exited abnormally
        # this can happen if we don't have enough RAM
        kill -0 $COSMOSHUB_PID
        EXIT_STATUS=$(echo $?)
        if [ $EXIT_STATUS -ne 0 ]; then
            echo "Process has been terminated. Exit code: $EXIT_STATUS"
            exit -1
        fi
        sleep 60
    done
fi

#sed -i 's|^log_file = .*|log_file = ""|' /opt/gaia/data/config/config.toml
#sed -i 's/^log_level *= *.*/log_level = "debug"/' /opt/gaia/data/config/config.toml
sed -i 's/^log_level *= *.*/log_level = "info"/' /opt/gaia/data/config/config.toml

echo "Starting cosmoshub using state backup..."
cp -r /opt/gaia/data_backup/data/* /opt/gaia/data/data/
gaiad start --home /opt/gaia/data --x-crisis-skip-assert-invariants --iavl-disable-fastnode false