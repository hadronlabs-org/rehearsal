#!/bin/bash

neutrond tendermint unsafe-reset-all --home /opt/neutron/data

if [ ! -d "/opt/neutron/data_backup" ]; then    
    echo "Previous state backup not found, starting from genesis..."
    mkdir /opt/neutron/logs -p
    echo "Creating genesis..."
    SNAPSHOT_INPUT=/opt/neutron/snapshot/snapshot.json GENESIS_OUTPUT=/opt/neutron/data/config/genesis.json /opt/neutron/create_genesis.sh
    neutrond add-consumer-section --home /opt/neutron/data

    echo "Starting neutron..."
    neutrond start --home /opt/neutron/data --x-crisis-skip-assert-invariants --iavl-disable-fastnode false > /opt/neutron/logs/neutrond.log 2>&1 &
    NEUTRON_PID=$(echo $!)

    echo "Neutron started with PID $NEUTRON_PID"

    while true; do
        tail /opt/neutron/logs/neutrond.log -n 25
        STATUS=$(curl -s http://localhost:26657/status)

        LAST_HEIGHT=$(echo "$STATUS" | jq -r .result.sync_info.latest_block_height)
        EARLIEST_HEIGHT=$(echo "$STATUS" | jq -r .result.sync_info.earliest_block_height)
        echo "Earliest height: $EARLIEST_HEIGHT, last height: $LAST_HEIGHT"

        if [ -n "$LAST_HEIGHT" ] && [ -n "$EARLIEST_HEIGHT" ] && [ "$LAST_HEIGHT" != "$EARLIEST_HEIGHT" ]; then
            kill -9 $NEUTRON_PID
            mkdir /opt/neutron/data_backup -p
            cp -r /opt/neutron/data/* /opt/neutron/data_backup/
            break
        fi

        sleep 15
    done
fi

echo "Starting neutron using state backup..."
cp -r /opt/neutron/data_backup/data/* /opt/neutron/data/data/
cp -r /opt/neutron/data_backup/wasm/* /opt/neutron/data/wasm/
neutrond start --home /opt/neutron/data --x-crisis-skip-assert-invariants --iavl-disable-fastnode false
