import { describe, expect, it, beforeAll } from 'vitest';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { GasPrice } from '@cosmjs/stargate';
import { instrumentWallet } from '../libs/wallet';
import Decimal from 'decimal.js';

const WALLET_MNEMONIC =
  'leopard exclude more together bottom face flight elder trash mushroom hidden win demand fog bubble mosquito capital list dress dwarf erosion puzzle lobster clap';
const NTRN_AXL_POOL = 'neutron18aud0kjwzdjj3m2cqm7gqyyw556ctgp3h4metpe0kxad0ewx6s8sp3zknv';
const NTRN_AXL_PAIR = 'neutron19p7fqw2njtf90y5atdv8367ehrzspjla6wu73z70ey9hk5pvtlqqx7gvzc';
const CONFIG = {
  appolo: {
    address: 'neutron1xx00a4ap5z6hltg8wt7ave7pdhqfqj84a99djwx0ldnuywef9u2qwtc3na',
    members: [
      "neutron1pymharqxfutl5ncpxe8hghpsz4y39jxl8wlfd0",
      "neutron1tkavhfqt8358vl74z7r5kdkdy05s98yka0gl0t",
      "neutron1y6d3ul0xlaewwqzy8nqkzaqzus9v0zfj5u26d6",
      "neutron1yycmdn4t5gmzfddtsle2xurd3x30h4crz02j9x"
    ]
  },
  groupDaodao: {
    address: 'neutron17dlcsyl2e9fecwvur2n26fyks660ltdjprf6f0g0gusdljx8ua7qdnw2s9',
    members: [
      'neutron1cpy2gpwc8lphzyczderwma2rt5nqdmvtyyl26f',
      'neutron1pymharqxfutl5ncpxe8hghpsz4y39jxl8wlfd0',
      'neutron1tkavhfqt8358vl74z7r5kdkdy05s98yka0gl0t',
      'neutron1y6d3ul0xlaewwqzy8nqkzaqzus9v0zfj5u26d6'
    ]
  },
  daodao: {
    address: 'neutron1tthvu9rswd95a5hjryx9e2k39npnqffmkf6wlxr8qg8586rjvxhsrhvmk3',
    pre_propose_module: 'neutron17a2mpef263a224zfrx7rngja63egtknt9gvn87jmq4tp74k9294q4arzse',
    propose_module: 'neutron1np6u4aj9rxzfzstcdw8wvufhdly5833r6n07n423yjrj234lw2vsdeazzn',
    members: [
      "neutron1cpy2gpwc8lphzyczderwma2rt5nqdmvtyyl26f",
      "neutron1tkavhfqt8358vl74z7r5kdkdy05s98yka0gl0t",
      "neutron1pymharqxfutl5ncpxe8hghpsz4y39jxl8wlfd0",
      "neutron1y6d3ul0xlaewwqzy8nqkzaqzus9v0zfj5u26d6",
    ]
  },
  foundation: {
    address: 'neutron13zwlfzwqtegmuguczf3mvefupyfcvhp0df2u0wrk5ek0tr5zer4suj0g0u',
    members: []
  }
};

const NTRN_DENOM = 'untrn';
const WST_ETH_DENOM = 'factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH';
const AXL_DENOM = 'ibc/C0E66D1C81D8AAF0E6896E05190FDFBC222367148F86AC3EA679C28327A763CD';

describe('DAO Proposal single', () => {
  let clientCW: SigningCosmWasmClient;
  let mainWallet: DirectSecp256k1HdWallet;
  let proposalId: number;
  let preBalances: Record<"daodao" | "appolo" | "foundation", {
    [NTRN_DENOM]: Decimal,
    [AXL_DENOM]: Decimal,
    [WST_ETH_DENOM]: Decimal
  }>;
  let lpAmount: string;

  beforeAll(async () => {
    mainWallet = await DirectSecp256k1HdWallet.fromMnemonic(WALLET_MNEMONIC, {
      prefix: 'neutron',
    });
    await instrumentWallet(mainWallet, Object.values(CONFIG).map(v => v.members).flat());
    await instrumentWallet(mainWallet, ['neutron1tthvu9rswd95a5hjryx9e2k39npnqffmkf6wlxr8qg8586rjvxhsrhvmk3']);
    clientCW = await SigningCosmWasmClient.connectWithSigner(`http://127.0.0.1:26657`, mainWallet, {
      gasPrice: GasPrice.fromString('0.025untrn'),
    });
  });

  it('validate current state', async () => {
    const appoloNTRNBalance = (await clientCW.getBalance(CONFIG.appolo.address, NTRN_DENOM)).amount;
    expect(appoloNTRNBalance).eq('1925001000000');
    const appoloWstETHBalance = (await clientCW.getBalance(CONFIG.appolo.address, WST_ETH_DENOM)).amount;
    expect(appoloWstETHBalance).eq('12943939254000000000');
    const daodaoAXLBalance = (await clientCW.getBalance(CONFIG.daodao.address, AXL_DENOM)).amount;
    expect(daodaoAXLBalance).eq('3000000000000');
    preBalances = {
      'daodao': {
        [NTRN_DENOM]: new Decimal((await clientCW.getBalance(CONFIG.daodao.address, NTRN_DENOM)).amount),
        [WST_ETH_DENOM]: new Decimal((await clientCW.getBalance(CONFIG.daodao.address, WST_ETH_DENOM)).amount),
        [AXL_DENOM]: new Decimal(daodaoAXLBalance)
      },
      'appolo': {
        [NTRN_DENOM]: new Decimal(appoloNTRNBalance),
        [WST_ETH_DENOM]: new Decimal(appoloWstETHBalance),
        [AXL_DENOM]: new Decimal((await clientCW.getBalance(CONFIG.appolo.address, AXL_DENOM)).amount)
      },
      'foundation': {
        [NTRN_DENOM]: new Decimal((await clientCW.getBalance(CONFIG.foundation.address, NTRN_DENOM)).amount),
        [WST_ETH_DENOM]: new Decimal(0),
        [AXL_DENOM]: new Decimal(0),
      }
    }
  });
  it('create transfer proposal', async () => {
    const transferToDaoDao = {
      bank: {
        send: {
          to_address: CONFIG.daodao.address,
          amount: [
            {
              amount: '1625001000000',
              denom: NTRN_DENOM
            },
            {
              amount: '12943939254000000000',
              denom: WST_ETH_DENOM
            }]
        }
      }
    };
    const transferToFoundation = {
      bank: {
        send: {
          to_address: CONFIG.foundation.address,
          amount: [
            {
              amount: '300000000000',
              denom: NTRN_DENOM
            },
          ]
        }
      }
    };
    const proposalTx = {
      propose: {
        title: 'transfer',
        description: "transfer funds to dao and unused ntrn back to foundation",
        msgs: [
          transferToDaoDao,
          transferToFoundation
        ],
        latest: { never: {} }
      }
    };
    console.log('proposal', JSON.stringify(proposalTx, null, 2));
    const proposal = await clientCW.execute(CONFIG.appolo.members[0], CONFIG.appolo.address, proposalTx, 1.6);
    proposalId = parseInt(proposal.events.find(e => e.type === 'wasm').attributes.find(a => a.key === 'proposal_id').value);
    expect(proposalId).toBeGreaterThan(0);
  });
  it('verify proposal', async () => {
    const proposal = await clientCW.queryContractSmart(CONFIG.appolo.address, {
      proposal: {
        proposal_id: proposalId
      }
    });
    expect(proposal.status).toEqual("open")
  })
  it('vote for proposal status', async () => {
    for (const member of CONFIG.appolo.members.slice(1, 3)) {
      await clientCW.execute(
        member, CONFIG.appolo.address, {
        vote: {
          proposal_id: proposalId,
          vote: 'yes'
        }
      }, 1.6
      )
    }
  });
  it('verify proposal', async () => {
    const proposal = await clientCW.queryContractSmart(CONFIG.appolo.address, {
      proposal: {
        proposal_id: proposalId
      }
    });
    expect(proposal.status).toEqual("passed")
  })
  it('execute proposal', async () => {
    await clientCW.execute(
      CONFIG.appolo.members[0],
      CONFIG.appolo.address,
      {
        execute: {
          proposal_id: proposalId
        }
      }, 1.6);
  });
  it('verify balances after', async () => {
    const appoloNTRNbalance = (await clientCW.getBalance(CONFIG.appolo.address, NTRN_DENOM)).amount;
    expect(appoloNTRNbalance).toEqual('0');
    const appoloWstETHBalance = (await clientCW.getBalance(CONFIG.appolo.address, WST_ETH_DENOM)).amount;
    expect(appoloWstETHBalance).toEqual('0');
    const daodaoNTRNBalance = new Decimal((await clientCW.getBalance(CONFIG.daodao.address, NTRN_DENOM)).amount);
    expect(daodaoNTRNBalance.eq(preBalances.daodao[NTRN_DENOM].add('1625001000000')));
    const foundationNTRNBalance = new Decimal((await clientCW.getBalance(CONFIG.foundation.address, NTRN_DENOM)).amount);
    expect(foundationNTRNBalance.eq(preBalances.daodao[NTRN_DENOM].add('300000000000')));
  });

  // it('native message for provide liquidity', async () => {
  //   await clientCW.execute('neutron1tthvu9rswd95a5hjryx9e2k39npnqffmkf6wlxr8qg8586rjvxhsrhvmk3', NTRN_AXL_POOL, {
  //     provide_liquidity: {
  //       slippage_tolerance: '0.5',
  //       assets: [
  //         {
  //           amount: '3000000000000',
  //           info: {
  //             native_token: {
  //               denom: AXL_DENOM
  //             }
  //           }
  //         },
  //         {
  //           amount: '1625001000000',
  //           info: {
  //             native_token: {
  //               denom: NTRN_DENOM
  //             }
  //           }
  //         },
  //       ],
  //     }
  //   }, 1.5, undefined, [
  //     { amount: '3000000000000', denom: AXL_DENOM },
  //     { amount: '1625001000000', denom: NTRN_DENOM },
  //   ])
  // });
  it('create proposal for provide liqidity to NTRN-AXL pool', async () => {
    const propTx = {
      wasm: {
        execute: {
          contract_addr: NTRN_AXL_POOL,
          msg: Buffer.from(JSON.stringify({
            provide_liquidity: {
              slippage_tolerance: '0.5',
              assets: [
                {
                  amount: '3000000000000',
                  info: {
                    native_token: {
                      denom: AXL_DENOM
                    }
                  }
                },
                {
                  amount: '1625001000000',
                  info: {
                    native_token: {
                      denom: NTRN_DENOM
                    }
                  }
                },
              ],
            }
          })).toString('base64'),
          funds: [
            { amount: '3000000000000', denom: AXL_DENOM },
            { amount: '1625001000000', denom: NTRN_DENOM },
          ],
        }
      }
    }
    const proposalTx = {
      propose: {
        msg: {
          propose: {
            title: "provide_liquidity",
            description: "provide liquidity to NTRN-AXL pool",
            msgs: [propTx]
          }
        }
      }
    };
    console.log('proposal', JSON.stringify(proposalTx, null, 2));
    const res = await clientCW.execute(CONFIG.daodao.members[0], CONFIG.daodao.pre_propose_module, proposalTx, 1.6);
    proposalId = parseInt(
      res.events.filter(e => e.type === 'wasm')
        .map(e => e.attributes.find(a => a.key === 'proposal_id')?.value)
        .flat()
        .flat()
        .filter(Boolean)[0]
    );//sorry
    expect(proposalId).toBeGreaterThan(0);
  });
  it('vote for this proposal', async () => {
    for (const member of CONFIG.daodao.members) {
      await clientCW.execute(member, CONFIG.daodao.propose_module, {
        vote: {
          proposal_id: proposalId, vote: 'yes'
        }
      }, 1.6);
    }
  });
  it('execute proposal', async () => {
    const res = await clientCW.execute(CONFIG.daodao.members[0], CONFIG.daodao.propose_module, {
      execute: {
        proposal_id:
          proposalId
      }
    }, 1.6);
    console.log('txhash', res.transactionHash);
    expect(res.transactionHash).toBeTruthy();
  });
  it('verify proposal', async () => {
    const proposal = await clientCW.queryContractSmart(CONFIG.daodao.propose_module, {
      proposal: {
        proposal_id: proposalId
      }
    });
    expect(proposal.proposal.status).toEqual('executed');
  })
  it('verify liquidity in pool', async () => {
    const res = await clientCW.queryContractSmart(NTRN_AXL_PAIR, {
      balance: {
        address: CONFIG.daodao.address
      }
    });
    expect(new Decimal(res.balance).greaterThan('0')).toBeTruthy();
    lpAmount = res.balance;
  });
  it('withdraw liquidity from pool', async () => {
    const res = await clientCW.execute(CONFIG.daodao.address, NTRN_AXL_PAIR, {
      send: {
        contract: NTRN_AXL_POOL,
        amount: lpAmount,
        msg: Buffer.from(JSON.stringify({
          withdraw_liquidity: { assets: [] }
        })).toString('base64')
      }
    }, 1.6);
  });
  it('verify outcome', async () => {
    const ntrnAmount = (await clientCW.getBalance(CONFIG.daodao.address, NTRN_DENOM)).amount;
    const axl = (await clientCW.getBalance(CONFIG.daodao.address, AXL_DENOM)).amount;
    expect(new Decimal(ntrnAmount).div('1625001000000').toNumber()).toBeCloseTo(1, 5);
    expect(new Decimal(axl).div('3000000000000').toNumber()).toBeCloseTo(1, 5);
  });
});
