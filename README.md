# Neutron Mainnet Fork with integration tests

**Neutron node version:** v4.2.1

This repository provides utilities to automate the creation and execution of a mainnet fork for the Neutron network, facilitating integration tests. With the rapid changes in the blockchain landscape, preliminary testing is crucial. Forking the mainnet allows developers to rigorously test contracts, modules, and other functionalities in an environment that mirrors the current mainnet. 

Note ‼️: The fork is using neutron image with disabled signature verification, so you can send transactions on behalf of any account. This is done to simplify testing process. Please do not use this fork for any other purposes. Testing scripts has a [helper](https://github.com/hadronlabs-org/rehearsal/blob/main/src/libs/wallet.ts#L3) to allow you to send transactions on behalf of any account.

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

- **`./snapshot` Directory:** This directory contains latest snapshot that was made using `make create-mainnet-snapshot` command, please leave it intact.

By familiarizing yourself with this directory structure, you can navigate and modify the project more effectively.

## Using CLI

In case you need to send transaction using CLI from the name of any account, you need to: 
1. Create transaction using `--offline` flag. Eg. `neutron tx bank send <account you have private key for> neutron1f6s4550dzyu0yzp7q2acn47mp5u25k0xa96pqy 5000000untrn --offline`;
2. Sign this transaction with `neutrond tx sign tx-ex.json --chain-id pion-1 --from <account used in previous step>`;
3. Replace `from_address` in the `/cosmos.bank.v1beta1.MsgSend` message to the address from which you actually want to send funds;
4. Broadcast this transaction to the forked network using `neutrond tx broadcast`.

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

## Environment Variables

To customize the behavior of the scripts and tests, the following environment variables can be set:

- **RPC_NODE:** Specifies the RPC node from the Neutron network used for creating snapshots.
- **INTERVAL:** The block interval for requesting the latest network snapshot.
- **NEUTROND_P2P_MAX_NUM_OUTBOUND_PEERS:** Sets the maximum number of outbound peers.
- **NEUTROND_P2P_MAX_NUM_INBOUND_PEERS:** Determines the maximum number of inbound peers.

Make sure to set these variables appropriately in the `docker-compose.yml` before running any operations.

## Getting Started

1. **Creating a Mainnet Snapshot**
   - Use the provided command:
     ```bash
     make build-mainnet-snapshot-image
     ```
     Which internally runs `neutrond export`. This command will take a while (about an hour) until it will prepare mainnet snapshot and put it into **`./snapshot`** directory.

     > **Please aware that this is long operation and can take at least 20 minutes, dependently on your hardware performance.**
     > **But there is no need to create snapshot by yourself, because there is [special snapshot service](https://snapshot.neutron.org/) which creates raw snapshots every 6 hours, and these snapshots can be downloaded automatically with `make create-mainnet-snapshot` command**
     > **if `./snapshot` directory is empty.**

2. **Starting, Stopping and Managing the Snapshot and Fork**
   - For detailed steps on snapshot management and launching your fork, refer to the commands section below.

## Customizing the Genesis

Users have the flexibility to integrate their own settings into the genesis. This can be easily accomplished by creating a script named `custom.sh`. The script will receive the paths to the current genesis and where to place the modified genesis as inputs. Follow the steps below:

1. **Create a Custom Script:**
   - Write a script named `custom.sh` that contains your specific configurations or logic.
   - The script will receive two arguments: the path to the current genesis and the path where the modified genesis should be placed.

2. **Script Example:**
    Here is an example of how the script might look:
    ```bash
    #!/bin/bash
    
    CURRENT_GENESIS_PATH="$1"
    MODIFIED_GENESIS_PATH="$2"

    # Your custom configurations and modifications here

    cp $CURRENT_GENESIS_PATH $MODIFIED_GENESIS_PATH
    ```

3. **Provide the Path to Docker Container:**
   - Ensure that the Docker container has access to the directory where your `custom.sh` script is stored. In the case of Docker Compose, you can add an entry like the following in the `docker-compose.yml` file:
   
     ```yaml
     volumes:
       - ./custom/:/opt/neutron/custom
     ```
   - This ensures that the custom script is accessible within the Docker container, enabling it to modify the genesis accordingly.

4. **Execution:**
   - The `custom.sh` script will be executed automatically, applying your personalized settings to the genesis during the initialization process.

This approach provides a seamless way to tailor the genesis to specific requirements or configurations while maintaining the integrity of the original setup. Ensure the `custom.sh` script has appropriate permissions to execute and handle the genesis files.

## Docker container

Instead of building docker container from sources you can use docker container [from docker hub](https://hub.docker.com/r/neutronorg/rehearsal).

## Commands

**Building the Mainnet Snapshot Image**

   Create an image of the Neutron mainnet snapshot. This command builds the `neutron-mainnet-snapshot` container. Inside this container, the `neutrond` node utilizes statsync to export the state.

   ```bash
   make build-mainnet-snapshot-image
   ```

**Creating the Mainnet Snapshot**

   Run the `neutron-mainnet-snapshot` container to generate a snapshot. This will be saved in the `./snapshot` directory.

   ```bash
   make create-mainnet-snapshot
   ```

**Stopping the Mainnet Snapshot Container**

   To halt the `neutron-mainnet-snapshot` container's execution:

   ```bash
   make stop-mainnet-snapshot
   ```

**Running the mainnet fork**

NOTE: You do not need to build snapshot container if you just run the fork.
If you do not have snapshot file in `snapshot/snapshot.json`, it will download it from `https://snapshot.neutron.org/`.

1. Build the Mainnet Fork Image**

   Construct the `neutron-mainnet-fork` container. This command sets up the `neuntrond` node with a genesis block derived from the latest network snapshot, introducing certain parameter modifications. Additionally, it caches the network state for expedited node startup.

   ```bash
   make build-mainnet-fork-image
   ```

2. Start the Mainnet Fork

   To initiate the `neutron-mainnet-fork` container:

   ```bash
   make start-mainnet-fork
   ```

3. Build and run slinky sidecar container

   Sidecar is needed to for neutron node to fetch oracle prices from.

   To build and run it:
   ```bash
   make build-oracle
   make start-oracle
   ```

**Stopping the Mainnet Fork Container**

   To cease the `neutron-mainnet-fork` container's operation:

   ```bash
   make stop-mainnet-fork
   ```

**Stopping the Slinky Sidecar**

   To stop Slinky Sidecar container:

   ```bash
   make stop-oracle
   ```

### Running explorer

   To run PingPub explorer, please use the following command:

   ```bash
   docker run --rm -p 5173:5173 -p 1318:1318 -p 26858:26858 --env API_URL=http://dev_server:1317 --env RPC_URL=http://dev_server:26657 neutronorg/pingpub
   ```

## Contribution

If you wish to contribute to this project or report any issues, please open a pull request or raise an issue in the repository. For further study, we recommend checking out the [repository on GitHub](https://github.com/neutron-org/mainnet-fork-tests).

