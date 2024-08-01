import { TezosToolkit } from '@mavrykdynamics/taquito';

// TODO check all actions after contract deployment
// for now all of them are a mocked versions and they don't work with contract

import {
  StatusDispatchType,
  STATUS_CONFIRMING,
  STATUS_ERROR,
  STATUS_IDLE,
  STATUS_SUCCESS,
} from '~/hooks/use-status-flag';

import { sleep } from '~/lib/utils/sleep';

// TODO extract similar logic in one function after logic revision

type BuyBaseToken = {
  tezos: TezosToolkit;
  dodoContractAddress: string;
  mockQuoteLpToken: string;
  dispatch: StatusDispatchType;
  tokensAmount: number;
  minMaxQuote: number;
};

export async function buyBaseToken({
  tezos,
  dodoContractAddress, // only dodo
  dispatch,
  mockQuoteLpToken, // mockQuoteLpTokenMars
  tokensAmount,
  minMaxQuote,
}: BuyBaseToken) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);
    const mockQuoteLpTokenInstance = await tezos.wallet.at(mockQuoteLpToken);

    const open_ops = mockQuoteLpTokenInstance.methodsObject['update_operators'](
      [
        {
          add_operator: {
            owner: sender,
            operator: dodoContractAddress,
            token_id: 0,
          },
        },
      ]
    ).toTransferParams();

    const buy_order = marketContract.methodsObject['buyBaseToken']([
      {
        amount: tokensAmount,
        minMaxQuote,
      },
    ]).toTransferParams();

    const close_ops = mockQuoteLpTokenInstance.methodsObject[
      'update_operators'
    ]([
      {
        remove_operator: {
          owner: sender,
          operator: dodoContractAddress,
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
}: BuyBaseToken) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);
    const mockQuoteLpTokenInstance = await tezos.wallet.at(mockQuoteLpToken);

    const open_ops = mockQuoteLpTokenInstance.methodsObject['update_operators'](
      [
        {
          add_operator: {
            owner: sender,
            operator: dodoContractAddress,
            token_id: 0,
          },
        },
      ]
    ).toTransferParams();

    const sell_order = marketContract.methodsObject['sellBaseToken']([
      {
        amount: tokensAmount,
        minMaxQuote,
      },
    ]).toTransferParams();

    const close_ops = mockQuoteLpTokenInstance.methodsObject[
      'update_operators'
    ]([
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

export async function depositBaseToken({
  tezos,
  dodoContractAddress, // only dodo
  dispatch,
  mockQuoteLpToken,
  tokensAmount,
}: BuyBaseToken) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);
    const mockQuoteLpTokenInstance = await tezos.wallet.at(mockQuoteLpToken);

    const open_ops = mockQuoteLpTokenInstance.methodsObject['update_operators'](
      [
        {
          add_operator: {
            owner: sender,
            operator: dodoContractAddress,
            token_id: 0,
          },
        },
      ]
    ).toTransferParams();

    const sell_order = marketContract.methodsObject['depositBaseToken']([
      {
        amount: tokensAmount,
      },
    ]).toTransferParams();

    const close_ops = mockQuoteLpTokenInstance.methodsObject[
      'update_operators'
    ]([
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
  mockQuoteLpToken,
  tokensAmount,
}: BuyBaseToken) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);
    const mockQuoteLpTokenInstance = await tezos.wallet.at(mockQuoteLpToken);

    const open_ops = mockQuoteLpTokenInstance.methodsObject['update_operators'](
      [
        {
          add_operator: {
            owner: sender,
            operator: dodoContractAddress,
            token_id: 0,
          },
        },
      ]
    ).toTransferParams();

    const sell_order = marketContract.methodsObject['depositQuoteToken']([
      {
        amount: tokensAmount,
      },
    ]).toTransferParams();

    const close_ops = mockQuoteLpTokenInstance.methodsObject[
      'update_operators'
    ]([
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

export async function withdrawBaseToken({
  tezos,
  dodoContractAddress, // only dodo
  dispatch,
  tokensAmount,
}: BuyBaseToken) {
  try {
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);

    const sell_order =
      marketContract.methodsObject['withdrawBaseToken'](
        tokensAmount
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
}: BuyBaseToken) {
  try {
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);

    const sell_order =
      marketContract.methodsObject['withdrawQuoteToken'](
        tokensAmount
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
}: BuyBaseToken) {
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
}: BuyBaseToken) {
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
