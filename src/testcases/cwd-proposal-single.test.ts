import { describe, expect, it, beforeAll } from 'vitest';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { AccountData, DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { awaitBlocks, setupPark } from '../testSuite';
import fs from 'fs';
import Long from 'long';

import { Client as ProposalSingleClient } from '../generated/neutron-dao/cwdProposalSingle';

const WALLET_MNEMONIC =
  'leopard exclude more together bottom face flight elder trash mushroom hidden win demand fog bubble mosquito capital list dress dwarf erosion puzzle lobster clap';

describe('DAO Proposal single', () => {
  let clientCW: SigningCosmWasmClient;
  let clientCWSecond: SigningCosmWasmClient;
  let mainAccounts: readonly AccountData[] = [];
  let mainWallet: DirectSecp256k1HdWallet;
  let contractAddress: string;

  beforeAll(async () => {
    mainWallet = await DirectSecp256k1HdWallet.fromMnemonic(WALLET_MNEMONIC, {
      prefix: 'neutron',
    });
    mainAccounts = await mainWallet.getAccounts();

    clientCW = await SigningCosmWasmClient.connectWithSigner(`http://127.0.0.1:26657`, mainWallet, {
      gasPrice: GasPrice.fromString('0.025untrn'),
    });
  });

  it('upload and instantiate contract', async () => {
    const { codeId } = await clientCW.upload(
      mainAccounts[0].address,
      fs.readFileSync('./contracts/cwd_proposal_single.wasm'),
      1.5,
    );

    expect(codeId).toBeGreaterThan(0);

    ({ contractAddress } = await ProposalSingleClient.instantiate(
      clientCW,
      mainAccounts[0].address,
      codeId,
      {
        threshold: {
          absolute_count: {
            threshold: '1',
          },
        },
        max_voting_period: {
          time: 1209600,
        },
        min_voting_period: null,
        allow_revoting: false,
        close_proposal_on_execution_failure: true,
        pre_propose_info: {
          anyone_may_propose: {},
        },
      },
      'cwd_proposal_single',
      [],
      'auto',
    ));

    expect(contractAddress).toContain('neutron1');
    expect(contractAddress).toHaveLength(66);
  });
});
