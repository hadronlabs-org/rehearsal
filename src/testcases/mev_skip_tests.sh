DESTINATION=neutron12ds5vg0my4chtexqlwjw4eflt55qp2dxgsywae

# ==================== mainnet fork (PICK)
GAS_PRICES="0.5untrn"
CHAINID="neutron-1"
TEST_WALLET="TODO"
KEYS_HOME="~/.neutrond-mainnet" # TODO
NODE="https://rpc-talzor.neutron-1.neutron.org:443" # TODO

# 37.27.55.151

# ==================== testnet (PICK)
GAS_PRICES="0.05untrn"
CHAINID="pion-1"
TEST_WALLET="pion1_testnet_wallet" # neutron1mwfj5j8v2aafqqnjekeqtupgc6894033hnz2e7
KEYS_HOME="~/.neutrond"
NODE="https://rpc-falcron.pion-1.ntrn.tech:443"


# POB

# neutrond tx auction auction-bid [bidder] [bid] [bundled_tx1,bundled_tx2,...,bundled_txN] [flags]

neutrond tx bank send $TEST_WALLET $DESTINATION 500000untrn  --gas-prices ${GAS_PRICES} --chain-id ${CHAINID} --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --broadcast-mode=sync -y --output json --generate-only > tx_body.json
# TRANSACTIONS=$(echo $TX_BODY | base64)

neutrond tx sign ./tx_body.json  --from $TEST_WALLET --chain-id $CHAINID --output-document signedTx.json
ENCODED=$(neutrond tx encode ./signedTx.json)


# bid transaction
construct bytes for transaction, encode into base64

RES=$(neutrond tx auction auction-bid ${TEST_WALLET} "1000untrn" $ENCODED --gas-prices ${GAS_PRICES} --chain-id ${CHAINID} --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --broadcast-mode=sync -y --output json --timeout-height 10000)
