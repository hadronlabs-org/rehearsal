#!/bin/sh

RPC_NODE=${RPC_NODE:-"https://rpc-kralum.neutron-1.neutron.org:443"}
INTERVAL=${INTERVAL:-"1000"}

LATEST_HEIGHT=$(curl -s $RPC_NODE/block | jq -r .result.block.header.height)
BLOCK_HEIGHT=$((LATEST_HEIGHT - INTERVAL))
TRUST_HASH=$(curl -s "$RPC_NODE/block?height=$BLOCK_HEIGHT" | jq -r .result.block_id.hash)

echo "Latest height: $LATEST_HEIGHT"
echo "Block height: $BLOCK_HEIGHT"
echo "Trust hash: $TRUST_HASH"

export NEUTROND_STATESYNC_ENABLE=true
export NEUTROND_STATESYNC_RPC_SERVERS="$RPC_NODE,$RPC_NODE"
export NEUTROND_STATESYNC_TRUST_HEIGHT=$BLOCK_HEIGHT
export NEUTROND_STATESYNC_TRUST_HASH=$TRUST_HASH

NEUTROND_P2P_SEEDS=$(curl -s https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/chain.json | jq -r '[foreach .peers.seeds[] as $item (""; "\($item.id)@\($item.address)")] | join(",")')
export NEUTROND_P2P_SEEDS

mkdir /opt/neutron/logs -p

sed -i 's/^pruning =.*/pruning = "nothing"/' /opt/neutron/data/config/app.toml
sed -i 's/^minimum\-gas\-prices =.*/minimum\-gas\-prices = "0untrn"/' /opt/neutron/data/config/app.toml

neutrond start --home /opt/neutron/data &

NEUTRON_PID=$(echo $!)

echo "Neutron started with PID $NEUTRON_PID"

while true; do
    #tail /opt/neutron/logs/neutrond.log -n 100 | grep -iE "Applied|Fetching|Header" || true
    STATUS=$(curl -s http://localhost:26657/status)
    CATCHING_UP=$(echo "$STATUS" | jq -r .result.sync_info.catching_up)
    LAST_HEIGHT=$(echo "$STATUS" | jq -r .result.sync_info.latest_block_height)
    echo "Catching up: $CATCHING_UP, last height: $LAST_HEIGHT"
    if [ "$CATCHING_UP" = "false" ]; then
        break
    fi
    sleep 15
done

echo "Last height: $LAST_HEIGHT"

kill -9 $NEUTRON_PID
echo "Neutron stopped"

echo "Exporting state, please wait..."
sleep 10
neutrond export --home /opt/neutron/data > /opt/neutron/snapshot/snapshot.json
sed -i '1,2d' /opt/neutron/snapshot/snapshot.json
echo "State exported to /opt/neutron/snapshot/snapshot.json. Exiting..."