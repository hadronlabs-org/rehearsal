import { describe, expect, test, beforeAll } from 'vitest';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { V1Beta1DecCoin } from '@neutron-org/client-ts/dist/gaia.globalfee.v1beta1/rest';
import axios from 'axios';
import { GasPrice } from '@cosmjs/stargate';

// ========= CONFIG =========

const NEUTRON_NODE_RPC_ADDR = 'http://37.27.55.151:26657';
const NEUTRON_NODE_REST_ADDR = 'http://37.27.55.151:1317';

const PREPARATION_BOND_AMOUNT = '1_000_000'; // how much will be bonded by the wallet to the Neutron DAO

// ==========================

const UNTRN_DENOM = 'untrn';
const NEUTRON_VAULT_CONTRACT = 'neutron1qeyjez6a9dwlghf9d6cy44fxmsajztw257586akk6xn6k88x0gus5djz4e';
const PROPOSAL_CONTRACT = 'neutron1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgshlt6zh';
const PRE_PROPOSE_CONTRACT = 'neutron1hulx7cgvpfcvg83wk5h96sedqgn72n026w6nl47uht554xhvj9nsgs8v0z';
const ADMIN_MODULE_ADDRESS = 'neutron1hxskfdxpp5hqgtjj6am6nkjefhfzj359x0ar3z';
const WALLET_MNEMONIC =
    'leopard exclude more together bottom face flight elder trash mushroom hidden win demand fog bubble mosquito capital list dress dwarf erosion puzzle lobster clap';

describe('Parameters change via adminmodule bindings', () => {
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
            NEUTRON_NODE_RPC_ADDR,
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
                1.5,
                undefined,
                [{ amount: PREPARATION_BOND_AMOUNT, denom: UNTRN_DENOM }],
            );
        })
    });

    describe('change icq parameters via proposal', () => {
        let paramsBefore: ParamsInterchainqueriesInfo;
        test('get icq module params', async () => {
        const resp = await axios.get(
            NEUTRON_NODE_REST_ADDR + `/neutron/interchainqueries/params`,
            );
            paramsBefore = resp.data.params;
        })
        
        let proposalId: number;
        test('create a proposal', async () => {
            let newParams = { ...paramsBefore};
            newParams.query_submit_timeout += 1;
            const propMsg = updateInterchainqueriesParamsProposal(newParams);

            const proposalTx = await context.client.execute(
                walletAddr,
                PRE_PROPOSE_CONTRACT,
                {
                    propose: {
                        msg: {
                            propose: {
                                title: 'increase ICQ module\'s query_submit_timeout',
                                description: 'increase ICQ module\'s query_submit_timeout in testing purposes',
                                msgs: [propMsg],
                            },
                        },
                    },
                },
                1.5,
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
                1.5,
                undefined,
            );
        });

        test('expect proposal passed', async () => {
            const proposal: SingleChoiceProposal = await context.client.queryContractSmart(
                PROPOSAL_CONTRACT,
                {proposal: {proposal_id: proposalId}},
            );
            expect(proposal.proposal.status).toEqual('passed');
        });

        test('execute proposal', async () => {
            await context.client.execute(
                walletAddr,
                PROPOSAL_CONTRACT,
                { execute: { proposal_id: proposalId } },
                1.5,
                undefined,
            );
        });

        test('compare new parameters to the previous ones', async () => {
            const resp = await axios.get(
                NEUTRON_NODE_REST_ADDR + `/neutron/interchainqueries/params`,
            );
            const paramsAfter: ParamsInterchainqueriesInfo = resp.data.params;
            expect(paramsAfter.query_submit_timeout).toEqual(paramsBefore.query_submit_timeout + 1);
        });
    });
});

type ParamsInterchainqueriesInfo = {
    query_submit_timeout: number;
    query_deposit: V1Beta1DecCoin;
    tx_query_removal_limit: number;
};

const updateInterchainqueriesParamsProposal = (
    info: ParamsInterchainqueriesInfo,
): any => ({
    custom: {
        submit_admin_proposal: {
            admin_proposal: {
                proposal_execute_message: {
                    message: JSON.stringify({
                        '@type': '/neutron.interchainqueries.MsgUpdateParams',
                        authority: ADMIN_MODULE_ADDRESS,
                        params: {
                            query_submit_timeout: info.query_submit_timeout,
                            query_deposit: null,
                            tx_query_removal_limit: info.tx_query_removal_limit,
                        },
                    }),
                },
            },
        },
    },
});

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
