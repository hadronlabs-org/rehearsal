DESTINATION=neutron12ds5vg0my4chtexqlwjw4eflt55qp2dxgsywae

# ==================== mainnet fork (PICK)
GAS_PRICES="0.5untrn"
CHAINID="neutron-1"
TEST_WALLET="TODO"
KEYS_HOME="~/.neutrond-mainnet" # TODO
NODE="https://rpc-talzor.neutron-1.neutron.org:443" # TODO

# POB

ENCODED=$(cat "/Users/nhpd/p2p/rehearsal/tx.binary")
RES=$(neutrond tx auction auction-bid ${TEST_WALLET} "1000untrn" $ENCODED --gas-prices ${GAS_PRICES} --chain-id ${CHAINID} --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --broadcast-mode=sync -y --output json --timeout-height 10000)
