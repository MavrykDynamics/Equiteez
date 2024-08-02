import { TezosToolkit } from '@mavrykdynamics/taquito';
import { DodoContractType, stablecoinContract } from '~/consts/contracts';

import {
  StatusDispatchType,
  STATUS_CONFIRMING,
  STATUS_ERROR,
  STATUS_IDLE,
  STATUS_SUCCESS,
} from '~/hooks/use-status-flag';
import {
  BaseToken,
  QuoteToken,
  RWAToken,
  Stablecoin,
} from '~/lib/utils/formaters';

import { sleep } from '~/lib/utils/sleep';

// TODO extract similar logic in one function after logic revision

// Exchange market (market from dropdown)

type DefaultContractProps = {
  tezos: TezosToolkit;
  dodoContractAddress: DodoContractType;
  dispatch: StatusDispatchType;
};

type BuySellBaseToken = {
  mockQuoteLpToken: string;
  tokensAmount: number;
  minMaxQuote: number;
} & DefaultContractProps;

export async function buyBaseToken({
  tezos,
  dodoContractAddress, // only dodo
  dispatch,
  mockQuoteLpToken, // mockQuoteLpTokenMars
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
      amount: BaseToken(tokensAmount),
      minMaxQuote: BaseToken(minMaxQuote),
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

    dispatch(STATUS_CONFIRMING);

    await batchOp.confirmation();

    dispatch(STATUS_SUCCESS);

    await sleep(3000);
    dispatch(STATUS_IDLE);
  } catch (e: unknown) {
    dispatch(STATUS_ERROR);
    await sleep(3000);
    dispatch(STATUS_IDLE);
    throw e;
  }
}

export async function sellBaseToken({
  tezos,
  dodoContractAddress, // only dodo
  dispatch,
  mockQuoteLpToken, // mockQuoteLpTokenMars
  tokensAmount,
  minMaxQuote,
}: BuySellBaseToken) {
  try {
    // MARS1 example
    const sender = await tezos.wallet.pkh(); // mv1TMgthRwT69X8WMqRyeMYLPEcoEfCKqX2w
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress); // KT1HPoRZkqnboMVyEyiNVk1M7W6dMUS4rANg
    const stableCoinInstance = await tezos.wallet.at(stablecoinContract); // KT1PF3ZRoxz8aYcrUccLi7txzG1YoKwK91jZ

    const open_ops = stableCoinInstance.methodsObject['update_operators']([
      {
        add_operator: {
          owner: sender,
          operator: mockQuoteLpToken,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const sell_order = marketContract.methodsObject['sellBaseToken']({
      amount: BaseToken(tokensAmount), // 2 * 10 ** 6;
      minMaxQuote: BaseToken(minMaxQuote), // 1000 * 10 ** 6;
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
    batch = batch.withTransfer(sell_order);
    batch = batch.withTransfer(close_ops);

    const batchOp = await batch.send();

    dispatch(STATUS_CONFIRMING);

    await batchOp.confirmation();

    dispatch(STATUS_SUCCESS);

    await sleep(3000);
    dispatch(STATUS_IDLE);
  } catch (e: unknown) {
    dispatch(STATUS_ERROR);
    await sleep(3000);
    dispatch(STATUS_IDLE);
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
  dispatch,
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

    dispatch(STATUS_CONFIRMING);

    await batchOp.confirmation();

    dispatch(STATUS_SUCCESS);

    await sleep(3000);
    dispatch(STATUS_IDLE);
  } catch (e: unknown) {
    dispatch(STATUS_ERROR);
    await sleep(3000);
    dispatch(STATUS_IDLE);
    throw e;
  }
}

export async function depositQuoteToken({
  tezos,
  dodoContractAddress, // only dodo
  dispatch,
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

    dispatch(STATUS_CONFIRMING);

    await batchOp.confirmation();

    dispatch(STATUS_SUCCESS);

    await sleep(3000);
    dispatch(STATUS_IDLE);
  } catch (e: unknown) {
    dispatch(STATUS_ERROR);
    await sleep(3000);
    dispatch(STATUS_IDLE);
    throw e;
  }
}

type WithdrawActionProps = {
  tokensAmount: number;
} & DefaultContractProps;

export async function withdrawBaseToken({
  tezos,
  dodoContractAddress, // only dodo
  dispatch,
  tokensAmount,
}: WithdrawActionProps) {
  try {
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);

    const sell_order = marketContract.methodsObject['withdrawBaseToken'](
      BaseToken(tokensAmount)
    ).toTransferParams();

    batch = batch.withTransfer(sell_order);

    const batchOp = await batch.send();

    dispatch(STATUS_CONFIRMING);

    await batchOp.confirmation();

    dispatch(STATUS_SUCCESS);

    await sleep(3000);
    dispatch(STATUS_IDLE);
  } catch (e: unknown) {
    dispatch(STATUS_ERROR);
    await sleep(3000);
    dispatch(STATUS_IDLE);
    throw e;
  }
}

export async function withdrawQuoteToken({
  tezos,
  dodoContractAddress, // only dodo
  dispatch,
  tokensAmount,
}: WithdrawActionProps) {
  try {
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);

    const sell_order = marketContract.methodsObject['withdrawQuoteToken'](
      QuoteToken(tokensAmount)
    ).toTransferParams();

    batch = batch.withTransfer(sell_order);

    const batchOp = await batch.send();

    dispatch(STATUS_CONFIRMING);

    await batchOp.confirmation();

    dispatch(STATUS_SUCCESS);

    await sleep(3000);
    dispatch(STATUS_IDLE);
  } catch (e: unknown) {
    dispatch(STATUS_ERROR);
    await sleep(3000);
    dispatch(STATUS_IDLE);
    throw e;
  }
}

export async function withdrawAllBaseTokens({
  tezos,
  dodoContractAddress, // only dodo
  dispatch,
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

    dispatch(STATUS_CONFIRMING);

    await batchOp.confirmation();

    dispatch(STATUS_SUCCESS);

    await sleep(3000);
    dispatch(STATUS_IDLE);
  } catch (e: unknown) {
    dispatch(STATUS_ERROR);
    await sleep(3000);
    dispatch(STATUS_IDLE);
    throw e;
  }
}

export async function withdrawAllQuoteTokens({
  tezos,
  dodoContractAddress, // only dodo
  dispatch,
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

    dispatch(STATUS_CONFIRMING);

    await batchOp.confirmation();

    dispatch(STATUS_SUCCESS);

    await sleep(3000);
    dispatch(STATUS_IDLE);
  } catch (e: unknown) {
    dispatch(STATUS_ERROR);
    await sleep(3000);
    dispatch(STATUS_IDLE);
    throw e;
  }
}
