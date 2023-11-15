import { describe, expect, test, beforeAll } from 'vitest';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { promises as fsPromise } from 'fs';
import path from 'path';

// ========= CONFIG =========

const NEUTRON_NODE_RPC_ADDR = 'http://127.0.0.1:26657';
const GAIA_NODE_RPC_ADDR = 'http://127.0.0.1:16657';

const IBC_UATOM_DENOM = 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2';
const IBC_TRANSFER_AMOUNT = '1000';

const GAIA_SIDE_PORT_ID = 'transfer';
const GAIA_SIDE_CHANNEL_ID = 'channel-0';

// ==========================

const UNTRN_DENOM = 'untrn';
const UATOM_DENOM = 'uatom';
const NEUTRON_WALLET_MNEMONIC =
    'banner spread envelope side kite person disagree path silver will brother under couch edit food venture squirrel civil budget number acquire point work mass';
const GAIA_WALLET_MNEMONIC =
    'veteran try aware erosion drink dance decade comic dawn museum release episode original list ability owner size tuition surface ceiling depth seminar capable only';

describe('Tokenfactory module', () => {
    let neutronClient: SigningCosmWasmClient;
    let neutronWalletAddr: string;
    let gaiaClient: SigningCosmWasmClient;
    let gaiaWalletAddr: string;

    beforeAll(async () => {
        const neutronWallet = await DirectSecp256k1HdWallet.fromMnemonic(NEUTRON_WALLET_MNEMONIC, {
            prefix: 'neutron',
        });
        neutronClient = await SigningCosmWasmClient.connectWithSigner(
            NEUTRON_NODE_RPC_ADDR,
            neutronWallet,
            { gasPrice: GasPrice.fromString('1'+UNTRN_DENOM) },
        );
        const neutronWallets = await neutronWallet.getAccounts();
        neutronWalletAddr = neutronWallets[0].address;

        const gaiaWallet = await DirectSecp256k1HdWallet.fromMnemonic(GAIA_WALLET_MNEMONIC, {
            prefix: 'cosmos',
        });
        gaiaClient = await SigningCosmWasmClient.connectWithSigner(
            GAIA_NODE_RPC_ADDR,
            gaiaWallet,
            { gasPrice: GasPrice.fromString('1'+UATOM_DENOM) },
        );
        const gaiaWallets = await gaiaWallet.getAccounts();
        gaiaWalletAddr = gaiaWallets[0].address;
    });

    let contractAddr: string;
    describe('prepare contract for hook', () => {
        let codeId: number;
        test('store contract', async () => {
            const res = await neutronClient.upload(
                neutronWalletAddr,
                await fsPromise.readFile(path.resolve('./contracts/msg_receiver.wasm')),
                'auto',
            );
            codeId = res.codeId;
        });
        test('instantiate contract', async () => {
            const res = await neutronClient.instantiate(
                neutronWalletAddr,
                codeId,
                {},
                'test_msg_receiver',
                'auto',
            );
            contractAddr = res.contractAddress;
        });
    });

    describe('', () => {
        test('IBC transfer of NTRN from remote chain with hook', async () => {
            const msg = '{"test_msg": {"return_err": false, "arg": "test"}}';
            const msgSend = {
                sourcePort: GAIA_SIDE_PORT_ID,
                sourceChannel: GAIA_SIDE_CHANNEL_ID,
                token: {
                    denom: UATOM_DENOM,
                    amount: IBC_TRANSFER_AMOUNT,
                },
                sender: gaiaWalletAddr,
                receiver: contractAddr,
                timeoutHeight: {
                    revisionNumber: 2,
                    revisionHeight: 100000000,
                },
                timeoutTimestamp: 0,
                memo: `{"wasm": {"contract": "${contractAddr}", "msg": ${msg}}}`,
            };
            const extMsgSend = {
                typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
                value: msgSend,
            };
            gaiaClient.signAndBroadcast(gaiaWalletAddr, [extMsgSend], 'auto');
        });

        test('wait 30sec for IBC msgs to be handled', async () => {
            await waitSeconds(30);
        });

        test('check hook was executed successfully', async () => {
            const queryResult = await neutronClient.queryContractSmart(contractAddr, {test_msg: { arg: 'test' }});
            expect(queryResult.funds).toEqual([
              { denom: IBC_UATOM_DENOM, amount: IBC_TRANSFER_AMOUNT },
            ]);
            expect(queryResult.count).toEqual(1);
          });
    });
});

export const waitSeconds = async (seconds: number) =>
  new Promise((r) => {
    setTimeout(() => r(true), 1000 * seconds);
  });
