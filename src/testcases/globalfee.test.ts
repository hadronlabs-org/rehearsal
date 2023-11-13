import { describe, expect, test, beforeAll } from 'vitest';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import {
  NEUTRON_DENOM,
} from '@neutron-org/neutronjsplus';
import { Client as NeutronClient } from '@neutron-org/client-ts';
import { V1Beta1DecCoin } from '@neutron-org/client-ts/dist/gaia.globalfee.v1beta1/rest';

const IBC_UATOM_DENOM = "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9";
const IBC_USDC_DENOM = "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349";
const WALLET_MNEMONIC =
  'banner spread envelope side kite person disagree path silver will brother under couch edit food venture squirrel civil budget number acquire point work mass';

describe('Globalfee module', () => {
  const context: {
    wallet?: DirectSecp256k1HdWallet;
    client?: SigningCosmWasmClient;
    neutronClient?: InstanceType<typeof NeutronClient>;
  } = {};

  beforeAll(async () => {
    context.wallet = await DirectSecp256k1HdWallet.fromMnemonic(WALLET_MNEMONIC, {
      prefix: 'neutron',
    });
    context.neutronClient = new NeutronClient({
      apiURL: `127.0.0.1:1317`,
      rpcURL: `127.0.0.1:26657`,
      prefix: 'neutron',
    });

    context.client = await SigningCosmWasmClient.connectWithSigner(`127.0.0.1:26657`, context.wallet);
  });

  let minFees: V1Beta1DecCoin[];
  test('get min fee params', async () => {
    minFees = (await context.neutronClient.GaiaGlobalfeeV1Beta1.query.queryMinimumGasPrices()).data.minimum_gas_prices;
    expect(minFees.length).toEqual(3);
    expect(minFees).toEqual(expect.arrayContaining([
      expect.objectContaining({ "amount": "0.9", "denom": NEUTRON_DENOM }),
      expect.objectContaining({ "amount": "0.026", "denom": IBC_UATOM_DENOM }),
      expect.objectContaining({ "amount": "0.25", "denom": IBC_USDC_DENOM })
    ]));
  });

  describe('test minfee', () => {
    describe('a bit less than minfee is rejected', () => {
      minFees.forEach((c) => {
        test(c.denom, async () => {
          await expect(context.client.sendTokens(
            context.wallet.getAccounts[0],
            context.wallet.getAccounts[0],
            [{ denom: c.denom, amount: c.amount }],
            { amount: [{ amount: (+c.amount - 1).toString(), denom: c.denom }], gas: "200000" },
            )).rejects.toThrow(/Subdao isn't in the list./);
        });
      });
    });
    describe('a bit more than minfee is accepted', () => {
      minFees.forEach((c) => {
        test(c.denom, async () => {
          context.client.sendTokens(
            context.wallet.getAccounts[0],
            context.wallet.getAccounts[0],
            [{ denom: c.denom, amount: c.amount }],
            { amount: [{ amount: (+c.amount + 1).toString(), denom: c.denom }], gas: "200000" },
            )
        });
      });
    });
  });
});
