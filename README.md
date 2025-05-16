# Celestia Mainnet Fork

**Celestia node version:** v3.8.1

This repository branch provides utilities to automate the creation and execution of a mainnet fork for the Celestia network, facilitating integration tests. With the rapid changes in the blockchain landscape, preliminary testing is crucial. Forking the mainnet allows developers to rigorously test contracts, modules, and other functionalities in an environment that mirrors the current mainnet. 

Note ‼️: The fork is using celestia image with disabled signature verification, so you can send transactions on behalf of any account. This is done to simplify testing process. Please do not use this fork for any other purposes. Testing scripts has a [helper](https://github.com/hadronlabs-org/rehearsal/blob/main/src/libs/wallet.ts#L3) to allow you to send transactions on behalf of any account.

# Hardware Requirements

To ensure smooth operation with this project, the following hardware specifications are recommended:

1. **Central Processing Unit (CPU):** Minimum of 4 cores; 8 cores are recommended.
2. **Random Access Memory (RAM):** A minimum of 16GB, but 32GB or more is recommended for optimal performance.
3. **Storage:** At least 20GB of free space on an SSD. An NVMe SSD is recommended for faster read/write operations.
4. **Network:** A stable internet connection with a minimum download speed of 100 Mbps.

Note: These requirements are based on the standard data volume processed by the Neutron network. More intensive operations or an increase in the blockchain's size may necessitate more robust hardware.

## Software Requirements

Ensure that you have the following installed:

- **Docker**: Required to build and run the project containers.
- **Node.js**: The project is tested with version 16. Please ensure this version is installed.

## Importance of Mainnet Fork

Creating a mainnet fork has various applications and use cases:

1. **Safeguarding Real Assets:** Before deploying a major update, changes can be tested on the fork, ensuring that real assets are not jeopardized.
2. **Prototyping New Features:** New ideas and features can be rapidly prototyped and iterated upon using a fork, without disrupting the main network.
3. **Testing Contracts:** Before deploying, smart contracts can be tested rigorously in an environment that simulates the real world, catching potential vulnerabilities.
4. **Training and Education:** A fork provides an excellent environment for developers to learn and get accustomed to the network's nuances without any real-world consequences.
5. **Debugging and Troubleshooting:** If any issues arise on the mainnet, they can be reproduced on the fork for a deeper analysis.

This approach strengthens trust in the blockchain community and helps in preventing unforeseen problems when changes are made live.

# Directory Structure

- **`./script` Directory:** All scripts related to snapshot creation and fork operations are located in this directory. It contains essential utilities that automate various tasks within the project.

- **`./contract` Directory:** This directory is dedicated to storing the contracts that will undergo testing. When working with specific contracts or deploying new ones, they should be placed here.

- **`./snapshot` Directory:** This directory contains latest snapshot.

By familiarizing yourself with this directory structure, you can navigate and modify the project more effectively.

## Using CLI

In case you need to send transaction using CLI from the name of any account, you need to: 
1. Create transaction using `--offline` flag. Eg. `celetsia-appd tx bank send <account you have private key for> celestia1qksdaex4ws9rdakalcm2yl59uxfcxm5d8fwghz 5000000untrn --offline`;
2. Sign this transaction with `celetsia-appd tx sign tx-ex.json --chain-id celestia --from <account used in previous step>`;
3. Replace `from_address` in the `/cosmos.bank.v1beta1.MsgSend` message to the address from which you actually want to send funds;
4. Broadcast this transaction to the forked network using `celetsia-appd tx broadcast`.

## Integration Tests

This repository is designed to craft integration tests that evaluate the behavior of different parts of the system, especially the execution of network proposals. Tests are written using the `vitest` framework.

### Running and Debugging Tests

- **Running Tests:** To execute the integration tests, run the following command:
  ```bash
  yarn test
  ```

- **Debugging and Writing Tests:** For debugging purposes and to aid in writing new tests, use the following command:
  ```bash
  yarn watch
  ```

[//]: # (## Environment Variables)

[//]: # ()
[//]: # (To customize the behavior of the scripts and tests, the following environment variables can be set:)

[//]: # ()
[//]: # (- **RPC_NODE:** Specifies the RPC node from the Neutron network used for creating snapshots.)

[//]: # (- **INTERVAL:** The block interval for requesting the latest network snapshot.)

[//]: # (- **NEUTROND_P2P_MAX_NUM_OUTBOUND_PEERS:** Sets the maximum number of outbound peers.)

[//]: # (- **NEUTROND_P2P_MAX_NUM_INBOUND_PEERS:** Determines the maximum number of inbound peers.)

[//]: # ()
[//]: # (Make sure to set these variables appropriately in the `docker-compose.yml` before running any operations.)

## Getting Started

1. **Fetching a Mainnet Snapshot**

2. **Starting, Stopping and Managing the Snapshot and Fork**
   - For detailed steps on snapshot management and launching your fork, refer to the commands section below.
   
## Docker container

Instead of building docker container from sources you can use docker container [from docker hub](https://hub.docker.com/r/neutronorg/rehearsal).

## Commands

**Fetching the Mainnet Snapshot**

**Running the mainnet fork**

NOTE: You do not need to build snapshot container if you just run the fork.

1. Build the Mainnet Fork Image**

   Construct the `celestia-mainnet-fork` container. This command sets up the `celestia-appd` node with a genesis block derived from the latest network snapshot, introducing certain parameter modifications. Additionally, it caches the network state for expedited node startup.

   ```bash
   make build-celestia-fork-image
   ```

2. Start the Mainnet Fork

   To initiate the `celestia-mainnet-fork` container:

   ```bash
   make start-celestia-fork
   ```

3. Build and run slinky sidecar container

   Sidecar is needed to for neutron node to fetch oracle prices from.

   To build and run it:
   ```bash
   make build-oracle
   make start-oracle
   ```

**Stopping the Mainnet Fork Container**

   To cease the `celestia-mainnet-fork` container's operation:

   ```bash
   make celestia-mainnet-fork
   ```

**Stopping the Slinky Sidecar**

   To stop Slinky Sidecar container:

   ```bash
   make stop-oracle
   ```

## Contribution

If you wish to contribute to this project or report any issues, please open a pull request or raise an issue in the repository. For further study, we recommend checking out the [repository on GitHub](https://github.com/neutron-org/mainnet-fork-tests).

