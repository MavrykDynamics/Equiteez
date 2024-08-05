/* eslint-disable no-useless-catch */
import { TezosToolkit } from '@mavrykdynamics/taquito';
import { DodoContractType, stablecoinContract } from '~/consts/contracts';

import { RWAToken, Stablecoin } from '~/lib/utils/formaters';

// Exchange market (market from dropdown & admin actions - [deposit, withdraw, transfer])

type DefaultContractProps = {
  tezos: TezosToolkit;
  dodoContractAddress: DodoContractType;
};

type BuySellBaseToken = {
  mockQuoteLpToken: string;
  tokensAmount: number;
  minMaxQuote: number;
} & DefaultContractProps;

export async function buyBaseToken({
  tezos,
  dodoContractAddress, // only dodo
  mockQuoteLpToken, // for buying base tokens, you need to update operators for the Quote Tokens
  tokensAmount,
  minMaxQuote,
}: BuySellBaseToken) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);
    const stableCoinInstance = await tezos.wallet.at(stablecoinContract);

    const open_ops = stableCoinInstance.methodsObject['update_operators']([
      {
        add_operator: {
          owner: sender,
          operator: mockQuoteLpToken,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const buy_order = marketContract.methodsObject['buyBaseToken']({
      amount: RWAToken(tokensAmount),
      minMaxQuote: RWAToken(minMaxQuote),
    }).toTransferParams();

    const close_ops = stableCoinInstance.methodsObject['update_operators']([
      {
        remove_operator: {
          owner: sender,
          operator: mockQuoteLpToken,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(buy_order);
    batch = batch.withTransfer(close_ops);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

// MARS1 example
export async function sellBaseToken({
  tezos,
  dodoContractAddress, // KT1HPoRZkqnboMVyEyiNVk1M7W6dMUS4rANg
  mockBaseLpToken, // KT1PF3ZRoxz8aYcrUccLi7txzG1YoKwK91jZ
  tokensAmount,
  minMaxQuote,
}: Omit<BuySellBaseToken, 'mockQuoteLpToken'> & { mockBaseLpToken: string }) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);
    const quoteLpInstance = await tezos.wallet.at(mockBaseLpToken);

    const open_ops = quoteLpInstance.methodsObject['update_operators']([
      {
        add_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const sell_order = marketContract.methodsObject['sellBaseToken']({
      amount: RWAToken(tokensAmount),
      minMaxQuote: RWAToken(minMaxQuote),
    }).toTransferParams();

    const close_ops = quoteLpInstance.methodsObject['update_operators']([
      {
        remove_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(sell_order);
    batch = batch.withTransfer(close_ops);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

type DepositActionProps = {
  rwaTokenAddress: string;
  tokensAmount: number;
} & DefaultContractProps;

export async function depositBaseToken({
  tezos,
  dodoContractAddress, // only dodo
  rwaTokenAddress,
  tokensAmount,
}: DepositActionProps) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);
    const rwaTokenInstance = await tezos.wallet.at(rwaTokenAddress);

    const open_ops = rwaTokenInstance.methodsObject['update_operators']([
      {
        add_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const sell_order = marketContract.methodsObject['depositBaseToken'](
      RWAToken(tokensAmount)
    ).toTransferParams();

    const close_ops = rwaTokenInstance.methodsObject['update_operators']([
      {
        remove_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(sell_order);
    batch = batch.withTransfer(close_ops);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

export async function depositQuoteToken({
  tezos,
  dodoContractAddress, // only dodo
  tokensAmount,
}: DepositActionProps) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);
    const rwaTokenInstance = await tezos.wallet.at(stablecoinContract);

    const open_ops = rwaTokenInstance.methodsObject['update_operators']([
      {
        add_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const sell_order = marketContract.methodsObject['depositQuoteToken'](
      Stablecoin(tokensAmount)
    ).toTransferParams();

    const close_ops = rwaTokenInstance.methodsObject['update_operators']([
      {
        remove_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(sell_order);
    batch = batch.withTransfer(close_ops);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

type WithdrawActionProps = {
  tokensAmount: number;
} & DefaultContractProps;

export async function withdrawBaseToken({
  tezos,
  dodoContractAddress, // only dodo
  tokensAmount,
}: WithdrawActionProps) {
  try {
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);

    const sell_order = marketContract.methodsObject['withdrawBaseToken'](
      RWAToken(tokensAmount)
    ).toTransferParams();

    batch = batch.withTransfer(sell_order);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

export async function withdrawQuoteToken({
  tezos,
  dodoContractAddress, // only dodo
  tokensAmount,
}: WithdrawActionProps) {
  try {
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);

    const sell_order = marketContract.methodsObject['withdrawQuoteToken'](
      RWAToken(tokensAmount)
    ).toTransferParams();

    batch = batch.withTransfer(sell_order);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

export async function withdrawAllBaseTokens({
  tezos,
  dodoContractAddress, // only dodo
}: BuySellBaseToken) {
  try {
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);

    const sell_order =
      marketContract.methodsObject[
        'withdrawAllBaseTokens'
      ]().toTransferParams();

    batch = batch.withTransfer(sell_order);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

export async function withdrawAllQuoteTokens({
  tezos,
  dodoContractAddress, // only dodo
}: BuySellBaseToken) {
  try {
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);

    const sell_order =
      marketContract.methodsObject[
        'withdrawAllQuoteTokens'
      ]().toTransferParams();

    batch = batch.withTransfer(sell_order);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

// NOTE DO NOT USE THIS ACTION IN CODE ! ONLY FOR TESTS
export const transferLPTokens = async ({
  tezos,
  address = 'KT1PF3ZRoxz8aYcrUccLi7txzG1YoKwK91jZ',
}: Pick<DefaultContractProps, 'tezos'> & { address?: string }) => {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(address); // MARS base token

    const sell_order = marketContract.methodsObject['transfer']([
      {
        from_: sender,
        txs: [
          {
            to_: 'mv1TMgthRwT69X8WMqRyeMYLPEcoEfCKqX2w',
            token_id: 0,
            amount: RWAToken(3),
          },
        ],
      },
    ]).toTransferParams();

    batch = batch.withTransfer(sell_order);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    console.log(e);
  }
};
