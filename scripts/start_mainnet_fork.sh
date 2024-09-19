#!/bin/bash

neutrond tendermint unsafe-reset-all --home /opt/neutron/data

CUSTOM_SCRIPT_PATH=/opt/neutron/custom/config.sh
SNAPSHOT_DOWNLOAD_URL="https://raw-snapshots.neutron.org"

if [ ! -d "/opt/neutron/data_backup" ]; then    
    echo "Previous state backup not found, starting from genesis..."
    export SNAPSHOT_INPUT=/opt/neutron/snapshot/snapshot.json
    if [ ! -e "$SNAPSHOT_INPUT" ]; then
        echo "Snapshot not found, downloading it from snapshot service..."

        METADATA=$(curl -s $SNAPSHOT_DOWNLOAD_URL/.metadata.json)
        if [ -z "$METADATA" ]; then
            echo "Snapshot metadata not found, aborting..."
            exit 1
        fi

        if ! echo $METADATA | jq empty 2>/dev/null; then
            echo "Metadata file is not valid json."
            exit 1
        fi

        if ! echo $METADATA | jq -e 'has("snapshot_path")' > /dev/null; then
            echo "Wrong metadata file type, aborting..."
            exit 1
        fi        

        SNAPSHOT_ARCHIVE=$(echo "$METADATA" | jq -r .snapshot_path)
        SNAPSHOT_NAME=$(echo "$METADATA" | jq -r .snapshot_name)
        echo "Downloading $SNAPSHOT_ARCHIVE..."
        echo "Snapshot name: $SNAPSHOT_NAME"
        wget ${SNAPSHOT_DOWNLOAD_URL}/$SNAPSHOT_ARCHIVE -O /opt/neutron/snapshot/$SNAPSHOT_ARCHIVE
        gunzip -f /opt/neutron/snapshot/$SNAPSHOT_ARCHIVE 
        mv -f /opt/neutron/snapshot/$SNAPSHOT_NAME /opt/neutron/snapshot/snapshot.json
    fi

    echo "Creating genesis..."
    GENESIS_OUTPUT=/opt/neutron/data/config/genesis.json /opt/neutron/create_genesis.sh
    echo "Adding consumer section..."
    neutrond add-consumer-section --home /opt/neutron/data
    echo "Add main wallet to genesis account"
    neutrond add-genesis-account $MAIN_WALLET 99999999000000untrn,99999000000ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9 --home /opt/neutron/data

    if [ -e "$CUSTOM_SCRIPT_PATH" ]; then
        echo "Applying custom configurations..."
        TEMP_GENESIS=$(mktemp genesis_XXXX.json)
        CUSTOM_GENESIS=$(mktemp custom_genesis_XXXX.json)
        cp /opt/neutron/data/config/genesis.json $TEMP_GENESIS
        /bin/bash $CUSTOM_SCRIPT_PATH $TEMP_GENESIS $CUSTOM_GENESIS
        if jq empty "$CUSTOM_GENESIS"; then
            cp $CUSTOM_GENESIS /opt/neutron/data/config/genesis.json
        else
            echo "Custom genesis is not valid, aborting..."
            exit 1
        fi
    fi

    crudini --set /opt/neutron/data/config/app.toml oracle enabled true
    crudini --set /opt/neutron/data/config/app.toml oracle oracle_address "\"oracle:8080\""
    crudini --set /opt/neutron/data/config/app.toml oracle client_timeout "\"500ms\""
    crudini --set /opt/neutron/data/config/app.toml oracle metrics_enabled true

    crudini --set /opt/neutron/data/config/app.toml api enable true
    crudini --set /opt/neutron/data/config/app.toml api swagger true
    crudini --set /opt/neutron/data/config/app.toml api address "\"tcp://0.0.0.0:1317\""
    crudini --set /opt/neutron/data/config/app.toml api enabled-unsafe-cors true
    crudini --set /opt/neutron/data/config/app.toml grpc-web enable-unsafe-cors true
    sed -i 's/^pruning =.*/pruning = "nothing"/' /opt/neutron/data/config/app.toml
    sed -i 's/^minimum\-gas\-prices =.*/minimum\-gas\-prices = "0untrn"/' /opt/neutron/data/config/app.toml

    crudini --set /opt/neutron/data/config/config.toml rpc cors_allowed_origins "[\"*\"]"
    crudini --set /opt/neutron/data/config/config.toml rpc laddr "\"tcp://0.0.0.0:26657\""
    crudini --set /opt/neutron/data/config/app.toml grpc address "\"0.0.0.0:9090\""

    echo "Starting neutron..."
    neutrond start --home /opt/neutron/data --x-crisis-skip-assert-invariants --iavl-disable-fastnode false &
    NEUTRON_PID=$(echo $!)

    echo "Neutron started with PID $NEUTRON_PID"

    while true; do
        STATUS=$(curl -s http://localhost:26657/status)

        LAST_HEIGHT=$(echo "$STATUS" | jq -r .result.sync_info.latest_block_height)
        EARLIEST_HEIGHT=$(echo "$STATUS" | jq -r .result.sync_info.earliest_block_height)
        echo "Earliest height: $EARLIEST_HEIGHT, last height: $LAST_HEIGHT"

        # check if new blocks has been generated
        # if so, create backup and start anew
        if [ -n "$LAST_HEIGHT" ] && [ -n "$EARLIEST_HEIGHT" ] && [ "$LAST_HEIGHT" != "$EARLIEST_HEIGHT" ]; then
            echo "Killing neutrond to create backup"
            kill -9 $NEUTRON_PID
            echo "Creating backup..."
            mkdir /opt/neutron/data_backup -p
            cp -r /opt/neutron/data/* /opt/neutron/data_backup/
            mkdir "Backup copied"
            break
        fi

        # check if process exited abnormally
        # this can happen if we don't have enough RAM
        kill -0 $NEUTRON_PID
        EXIT_STATUS=$(echo $?)
        if [ $EXIT_STATUS -ne 0 ]; then
            echo "Process has been terminated. Exit code: $EXIT_STATUS"
            break
        fi

        sleep 15
    done
fi

echo "Starting neutron using state backup..."
cp -r /opt/neutron/data_backup/data/* /opt/neutron/data/data/
cp -r /opt/neutron/data_backup/wasm/* /opt/neutron/data/wasm/
neutrond start --home /opt/neutron/data --x-crisis-skip-assert-invariants --iavl-disable-fastnode false --trace
