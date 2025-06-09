#!/bin/bash
set -e

mkdir -p /home/hermes/.hermes/keys/neutron-1
mkdir -p /home/hermes/.hermes/keys/celestia

if [[ -n "$NEUTRON_MNEMONIC" ]]; then
  echo "$NEUTRON_MNEMONIC" | hermes keys add --chain neutron-1 --key-name neutron-key --mnemonic-file /dev/stdin || true
fi

if [[ -n "$CELESTIA_MNEMONIC" ]]; then
  echo "$CELESTIA_MNEMONIC" | hermes keys add --chain celestia --key-name celestia-key --mnemonic-file /dev/stdin || true
fi

echo "Using Hermes config:"
cat /home/hermes/.hermes/config.toml

exec hermes start