import { TezosToolkit } from '@mavrykdynamics/taquito';
import {
  faucetContract,
  MakketContractType,
  stablecoinContract,
} from '~/consts/contracts';

import {
  StatusDispatchType,
  STATUS_CONFIRMING,
  STATUS_ERROR,
  STATUS_IDLE,
  STATUS_SUCCESS,
} from '~/hooks/use-status-flag';
import { RWAToken } from '~/utils/formaters';

import { sleep } from '~/utils/sleep';

export async function buy(
  tezos: TezosToolkit,
  marketContractAddress: MakketContractType,
  dispatch: StatusDispatchType
) {
  try {
    console.log('Buy action ...');
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const market = await tezos.wallet.at(marketContractAddress);
    const token = await tezos.wallet.at(stablecoinContract);

    const orderType = 'BUY';
    const rwaTokenAmount = RWAToken(10);
    const pricePerRwaToken = 1000000; // $1
    const currency = 'USDC';
    const orderExpiry = null;

    const open_ops = token.methodsObject['update_operators']([
      {
        add_operator: {
          owner: sender,
          operator: marketContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const buy_order = market.methodsObject['placeBuyOrder']([
      {
        orderType: orderType,
        rwaTokenAmount: rwaTokenAmount,
        pricePerRwaToken: pricePerRwaToken,
        currency: currency,
        orderExpiry: orderExpiry,
      },
    ]).toTransferParams();

    const close_ops = token.methodsObject['update_operators']([
      {
        remove_operator: {
          owner: sender,
          operator: marketContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(buy_order);
    batch = batch.withTransfer(close_ops);

    console.log('Batch');
    console.log(batch);

    const batchOp = await batch.send();

    dispatch(STATUS_CONFIRMING);

    await batchOp.confirmation();

    await sleep(3000);
    dispatch(STATUS_IDLE);
  } catch (e: unknown) {
    console.log(e);
    dispatch(STATUS_ERROR);
    await sleep(3000);
    dispatch(STATUS_IDLE);
  }
}

export async function sell(
  tezos: TezosToolkit,
  marketContractAddress: MakketContractType,
  dispatch: StatusDispatchType
) {
  try {
    console.log('Sell action ...');
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const market = await tezos.wallet.at(marketContractAddress);
    const token = await tezos.wallet.at(stablecoinContract);

    const orderType = 'SELL';
    const rwaTokenAmount = RWAToken(10);
    const pricePerRwaToken = 1000000; // $1
    const currency = 'USDC';
    const orderExpiry = null;

    const open_ops = token.methodsObject['update_operators']([
      {
        add_operator: {
          owner: sender,
          operator: marketContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const buy_order = market.methodsObject['placeSellOrder']([
      {
        orderType: orderType,
        rwaTokenAmount: rwaTokenAmount,
        pricePerRwaToken: pricePerRwaToken,
        currency: currency,
        orderExpiry: orderExpiry,
      },
    ]).toTransferParams();

    const close_ops = token.methodsObject['update_operators']([
      {
        remove_operator: {
          owner: sender,
          operator: marketContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(buy_order);
    batch = batch.withTransfer(close_ops);

    console.log('Batch');
    console.log(batch);

    const batchOp = await batch.send();

    dispatch(STATUS_CONFIRMING);

    await batchOp.confirmation();

    await sleep(3000);
    dispatch(STATUS_IDLE);
  } catch (e: unknown) {
    dispatch(STATUS_ERROR);
    await sleep(3000);
    dispatch(STATUS_IDLE);
    throw e;
  }
}

export async function defaultContractAction(
  tezos: TezosToolkit,
  dispatch: StatusDispatchType
) {
  try {
    let batch = tezos.wallet.batch([]);

    const faucet = await tezos.wallet.at(faucetContract);

    const action = faucet.methodsObject['default']().toTransferParams();

    batch = batch.withTransfer(action);

    console.log('Batch');
    console.log(batch);

    const batchOp = await batch.send();

    dispatch(STATUS_CONFIRMING);

    await batchOp.confirmation();

    dispatch(STATUS_SUCCESS);

    await sleep(3000);
    dispatch(STATUS_IDLE);
  } catch (e: unknown) {
    console.log(e);
    dispatch(STATUS_ERROR);
  }
}
