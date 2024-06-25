#!/bin/bash

CUSTOM_SCRIPT_PATH=/opt/neutron/custom/config.sh
SNAPSHOT_DOWNLOAD_URL="https://raw-snapshots.neutron.org"

if [ "$FIRST_RUN" = "true" ]; then
    rm -rf /opt/neutron/data/*
    cp -rf /opt/neutron/initial_data/* /opt/neutron/data
    neutrond tendermint unsafe-reset-all --home /opt/neutron/data
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
    neutrond add-consumer-section --home /opt/neutron/data
    neutrond add-genesis-account $MAIN_WALLET 99999000000untrn,99999000000ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9 --home /opt/neutron/data

    if [ -e "$CUSTOM_SCRIPT_PATH" ]; then
        echo "Applying custom configurations..."
        TEMP_GENESIS=$(mktemp genesis_XXXX.json)
        CUSTOM_GENESIS=$(mktemp custom_genesis_XXXX.json)
        cp /opt/neutron/data/config/genesis.json $TEMP_GENESIS
        /bin/sh $CUSTOM_SCRIPT_PATH $TEMP_GENESIS $CUSTOM_GENESIS
        if jq empty "$CUSTOM_GENESIS"; then
            cp $CUSTOM_GENESIS /opt/neutron/data/config/genesis.json
        else
            echo "Custom genesis is not valid, aborting..."
            exit 1
        fi
    fi

    crudini --set /opt/neutron/data/config/app.toml api enable true
    crudini --set /opt/neutron/data/config/app.toml api swagger true
    crudini --set /opt/neutron/data/config/app.toml api address "\"tcp://0.0.0.0:1317\""
    crudini --set /opt/neutron/data/config/app.toml api enabled-unsafe-cors true
    crudini --set /opt/neutron/data/config/app.toml grpc-web enable-unsafe-cors true
    sed -i 's/^pruning =.*/pruning = "nothing"/' /opt/neutron/data/config/app.toml
    sed -i 's/^minimum\-gas\-prices =.*/minimum\-gas\-prices = "0untrn"/' /opt/neutron/data/config/app.toml

    crudini --set /opt/neutron/data/config/config.toml rpc cors_allowed_origins [\"*\"]    

    echo "Starting neutron..."
    neutrond start --home /opt/neutron/data --x-crisis-skip-assert-invariants --iavl-disable-fastnode false --trace
fi

if [ "$FIRST_RUN" = "false" ]; then
    echo "Starting neutron using current data..."
    neutrond start --home /opt/neutron/data --x-crisis-skip-assert-invariants --iavl-disable-fastnode false --trace
fi