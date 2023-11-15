import { describe, expect, test, beforeAll } from 'vitest';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { V1Beta1DecCoin } from '@neutron-org/client-ts/dist/gaia.globalfee.v1beta1/rest';
import axios from 'axios';
import { GasPrice } from '@cosmjs/stargate';

const UNTRN_DENOM = 'untrn';
const NEUTRON_VAULT_CONTRACT = 'neutron1qeyjez6a9dwlghf9d6cy44fxmsajztw257586akk6xn6k88x0gus5djz4e';
const PROPOSAL_CONTRACT = 'neutron1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgshlt6zh';
const PRE_PROPOSE_CONTRACT = 'neutron1hulx7cgvpfcvg83wk5h96sedqgn72n026w6nl47uht554xhvj9nsgs8v0z';
export const ADMIN_MODULE_ADDRESS = 'neutron1hxskfdxpp5hqgtjj6am6nkjefhfzj359x0ar3z';
const WALLET_MNEMONIC =
    'banner spread envelope side kite person disagree path silver will brother under couch edit food venture squirrel civil budget number acquire point work mass';

describe('Governance', () => {
    const context: {
        wallet?: DirectSecp256k1HdWallet;
        client?: SigningCosmWasmClient;
    } = {};
    let walletAddr: string;

    beforeAll(async () => {
        context.wallet = await DirectSecp256k1HdWallet.fromMnemonic(WALLET_MNEMONIC, {
            prefix: 'neutron',
        });
        context.client = await SigningCosmWasmClient.connectWithSigner(
            `http://127.0.0.1:26657`,
            context.wallet,
            { gasPrice: GasPrice.fromString('1untrn') },
        );
        const walletAccounts = await context.wallet.getAccounts();
        walletAddr = walletAccounts[0].address;
    });

    describe('prepare', () => {
        test('bond funds to Neutron DAO', async () => {
            await context.client.execute(
                walletAddr,
                NEUTRON_VAULT_CONTRACT,
                { bond: {} },
                'auto',
                undefined,
                [{ amount: '1_000_000', denom: UNTRN_DENOM }],
            );
        })
        test('send funds to Neutron DAO', async () => { // will be later sent via proposal
            const res = await context.client.sendTokens(
                walletAddr,
                'neutron1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrstdxvff',
                [{denom: UNTRN_DENOM, amount: '111'}],
                200000,
                'auto',
            );
        })
    });

    describe('change cron parameters via stargate proposal', () => {
        let paramsBefore: ParamsCronInfo;
        test('get icq module params', async () => {
            const resp = await axios.get(
                `http://127.0.0.1:1317/neutron/cron/params`,
            );
            paramsBefore = resp.data.params;
            expect(paramsBefore.limit).toEqual('5');
        })

        let proposalId: number;
        test('create a proposal', async () => {
            const proposalTx = await context.client.execute(
                walletAddr,
                PRE_PROPOSE_CONTRACT,
                {
                    propose: {
                        msg: {
                            propose: {
                                title: 'increase cron module\'s limit',
                                description: 'increase cron module\'s limit in testing purposes',
                                msgs: [
                                    {
                                        stargate: {
                                            type_url: '/cosmos.adminmodule.adminmodule.MsgSubmitProposal',
                                            value: 'CpkBCh0vbmV1dHJvbi5jcm9uLk1zZ1VwZGF0ZVBhcmFtcxJ4Ci5uZXV0cm9uMWh4c2tmZHhwcDVocWd0amo2YW02bmtqZWZoZnpqMzU5eDBhcjN6EkYKQm5ldXRyb24xZnV5eHd4bHNnamtmam14ZnRocTg0MjdkbTJhbTN5YTNjd2NkcjhnbHMyOWw3amFkdGF6c3V5endjYxAKEkJuZXV0cm9uMXN1aGdmNXN2aHU0dXNydXJ2eHpsZ241NGtzeG1uOGdsamFyanR4cW5hcHY4a2pucDRucnN0ZHh2ZmY='
                                        }
                                    }
                                ]
                            },
                        },
                    },
                },
                'auto',
                undefined,
                [{ amount: '1000', denom: UNTRN_DENOM }],
            );

            const attribute = getEventAttribute(
                (proposalTx as any).events,
                'wasm',
                'proposal_id',
            );

            proposalId = parseInt(attribute);
            expect(proposalId).toBeGreaterThanOrEqual(0);
        });

        test('vote for proposal', async () => {
            await context.client.execute(
                walletAddr,
                PROPOSAL_CONTRACT,
                { vote: { proposal_id: proposalId, vote: 'yes' } },
                'auto',
                undefined,
            );
        });

        test('expect proposal passed', async () => {
            const proposal: SingleChoiceProposal = await context.client.queryContractSmart(
                PROPOSAL_CONTRACT,
                { proposal: { proposal_id: proposalId } },
            );
            expect(proposal.proposal.status).toEqual('passed');
        });

        test('execute proposal', async () => {
            await context.client.execute(
                walletAddr,
                PROPOSAL_CONTRACT,
                { execute: { proposal_id: proposalId } },
                'auto',
                undefined,
            );
        });

        test('compare new parameters to the previous ones', async () => {
            const resp = await axios.get(
                `http://127.0.0.1:1317/neutron/cron/params`,
            );
            const paramsAfter: ParamsCronInfo = resp.data.params;
            expect(paramsBefore.limit).not.toEqual(paramsAfter.limit);
            expect(paramsAfter.limit).toEqual('10');
        });
    });

    describe('fulfill a bank send proposal', () => {
        let balanceBefore: V1Beta1DecCoin;
        test('get balance before', async () => {
            balanceBefore = await context.client.getBalance('neutron1qp8zydhcsed5uvlkqh78lvluw0s6vtjchawky3', UNTRN_DENOM);
        })

        let proposalId: number;
        test('create a proposal', async () => {
            const proposalTx = await context.client.execute(
                walletAddr,
                PRE_PROPOSE_CONTRACT,
                {
                    propose: {
                        msg: {
                            propose: {
                                title: 'send funds to a test address',
                                description: 'send 111 untrn to neutron1qp8zydhcsed5uvlkqh78lvluw0s6vtjchawky3',
                                msgs: [
                                    {
                                        bank: {
                                            send: {
                                                to_address: 'neutron1qp8zydhcsed5uvlkqh78lvluw0s6vtjchawky3',
                                                amount: [
                                                    {
                                                        denom: UNTRN_DENOM,
                                                        amount: '111',
                                                    },
                                                ],
                                            },
                                        },
                                    }
                                ]
                            },
                        },
                    },
                },
                'auto',
                undefined,
                [{ amount: '1000', denom: UNTRN_DENOM }],
            );

            const attribute = getEventAttribute(
                (proposalTx as any).events,
                'wasm',
                'proposal_id',
            );

            proposalId = parseInt(attribute);
            expect(proposalId).toBeGreaterThanOrEqual(0);
        });

        test('vote for proposal', async () => {
            await context.client.execute(
                walletAddr,
                PROPOSAL_CONTRACT,
                { vote: { proposal_id: proposalId, vote: 'yes' } },
                'auto',
                undefined,
            );
        });

        test('expect proposal passed', async () => {
            const proposal: SingleChoiceProposal = await context.client.queryContractSmart(
                PROPOSAL_CONTRACT,
                { proposal: { proposal_id: proposalId } },
            );
            expect(proposal.proposal.status).toEqual('passed');
        });

        test('execute proposal', async () => {
            await context.client.execute(
                walletAddr,
                PROPOSAL_CONTRACT,
                { execute: { proposal_id: proposalId } },
                'auto',
                undefined,
            );
        });

        test('check whether funds have been sent', async () => {
            const balanceAfter: V1Beta1DecCoin = await context.client.getBalance(
                'neutron1qp8zydhcsed5uvlkqh78lvluw0s6vtjchawky3',
                UNTRN_DENOM,
            );
            expect(+balanceAfter.amount).toEqual(+balanceBefore.amount + 111);
        });
    });
});

type ParamsCronInfo = {
    security_address: string;
    limit: number;
};

const getEventAttribute = (
    events: { type: string; attributes: { key: string; value: string }[] }[],
    eventType: string,
    attribute: string,
): string => {
    const attributes = events
        .filter((event) => event.type === eventType)
        .map((event) => event.attributes)
        .flat();

    const attrValue = attributes?.find((attr) => attr.key === attribute)
        ?.value as string;

    expect(attrValue).toBeDefined();

    return attrValue;
};

// SingleChoiceProposal represents a single governance proposal item (partial object).
type SingleChoiceProposal = {
    readonly title: string;
    readonly description: string;
    /// The address that created this proposal.
    readonly proposer: string;
    /// The block height at which this proposal was created. Voting
    /// power queries should query for voting power at this block
    /// height.
    readonly start_height: number;
    /// The threshold at which this proposal will pass.
    /// proposal's creation.
    readonly total_power: string;
    readonly proposal: {
        status:
        | 'open'
        | 'rejected'
        | 'passed'
        | 'executed'
        | 'closed'
        | 'execution_failed';
        readonly votes: {
            yes: string;
            no: string;
            abstain: string;
        };
    };
};
