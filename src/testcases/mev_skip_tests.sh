DESTINATION=neutron12ds5vg0my4chtexqlwjw4eflt55qp2dxgsywae

# ================= CONFIG =========
GAS_PRICES="1untrn"
CHAINID="neutron-1"
TEST_WALLET="neutrond_mainnet_rehearsal" # neutron1kyn3jx88wvnm3mhnwpuue29alhsatwzrpkwhu6
KEYS_HOME="~/.neutrond-rehearsal"
NODE="http://37.27.55.151:26657"
RECIPIENT="neutron19wv4pq0qzpgthyzh43mlkr0tcz6gpeta7587zq"

# ==================================

# ================= TEST ===========

ENCODED=$(cat "/Users/nhpd/p2p/rehearsal/tx.binary")
RES=$(neutrond tx auction auction-bid ${TEST_WALLET} "1000untrn" $ENCODED --gas-prices ${GAS_PRICES} --chain-id ${CHAINID} --keyring-backend test --home ${KEYS_HOME} --node ${NODE} --broadcast-mode=sync -y --output json --timeout-height 4501950)

neutrond q bank balances $RECIPIENT --node $NODE --output json

# ==================================
