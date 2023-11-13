import { describe, expect, test, beforeAll } from 'vitest';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { V1Beta1DecCoin } from '@neutron-org/client-ts/dist/gaia.globalfee.v1beta1/rest';
import axios from 'axios';
import { Coin } from '@neutron-org/client-ts/dist/cosmos.bank.v1beta1/types/cosmos/base/v1beta1/coin';
import { StdFee } from '@cosmjs/amino';

const UNTRN_DENOM = "untrn";
const IBC_UATOM_DENOM = "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9";
const IBC_USDC_DENOM = "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349";
const WALLET_MNEMONIC =
  'banner spread envelope side kite person disagree path silver will brother under couch edit food venture squirrel civil budget number acquire point work mass';

describe('Globalfee module', () => {
  const context: {
    wallet?: DirectSecp256k1HdWallet;
    client?: SigningCosmWasmClient;
  } = {};
  let walletAddr: string;

  beforeAll(async () => {
    context.wallet = await DirectSecp256k1HdWallet.fromMnemonic(WALLET_MNEMONIC, {
      prefix: 'neutron',
    });
    context.client = await SigningCosmWasmClient.connectWithSigner(`http://127.0.0.1:26657`, context.wallet);
    const walletAccounts = await context.wallet.getAccounts();
    walletAddr = walletAccounts[0].address;
  });

  let ntrnMinFee: V1Beta1DecCoin;
  test('get min fee params', async () => {
    const resp = await axios.get(
      `http://127.0.0.1:1317/gaia/globalfee/v1beta1/params`,
    );
    const minFees: V1Beta1DecCoin[] = resp.data.params.minimum_gas_prices;

    expect(minFees.length).toEqual(3);
    expect(minFees).toEqual(expect.arrayContaining([
      expect.objectContaining({ "amount": "0.900000000000000000", "denom": UNTRN_DENOM }),
      expect.objectContaining({ "amount": "0.026000000000000000", "denom": IBC_UATOM_DENOM }),
      expect.objectContaining({ "amount": "0.250000000000000000", "denom": IBC_USDC_DENOM })
    ]));
    ntrnMinFee = minFees.filter((c) => c.denom == UNTRN_DENOM)[0];
  });

  describe('test minfee', () => {
    test('a bit less than minfee is rejected', async () => {
      const sendAmount: Coin = { amount: '1000000', denom: UNTRN_DENOM };

      const fee1 = +ntrnMinFee.amount - 0.000100; // sub 100untrn from min value and upscale to 6 decimals
      const fee2 = Math.floor(fee1 * 200000); // multiply to gas
      const fee: StdFee = { amount: [{ amount: fee2.toString(), denom: UNTRN_DENOM }], gas: '200000' }

      await expect(context.client.sendTokens(
        walletAddr,
        walletAddr,
        [sendAmount],
        fee,
      )).rejects.toThrow(/Insufficient fees/);
    });

    test('a bit more than minfee is accepted', async () => {
      const sendAmount: Coin = { amount: '1000000', denom: UNTRN_DENOM };

      const fee1 = +ntrnMinFee.amount - 0.000100; // add 100untrn to min value and upscale to 6 decimals
      const fee2 = Math.floor(fee1 * 200000); // multiply to gas
      const fee: StdFee = { amount: [{ amount: fee2.toString(), denom: UNTRN_DENOM }], gas: '200000' }

      await context.client.sendTokens(
        walletAddr,
        walletAddr,
        [sendAmount],
        fee,
      );
    });
  });
});
