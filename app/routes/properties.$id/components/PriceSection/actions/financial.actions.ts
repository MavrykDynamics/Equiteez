import { TezosToolkit } from '@mavrykdynamics/taquito';
import {
  faucetContract,
  MarketContractType,
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

const OCEAN_TOKEN_ADDRESS = 'KT1J9HnaBnjxgxDCaQcFMKnpQCzhiYaHyAFX';

export async function matchOrders(
  tezos: TezosToolkit,
  marketContractAddress: MarketContractType,
  dispatch: StatusDispatchType
) {
  try {
    let batch = tezos.wallet.batch([]);
    const marketContract = await tezos.wallet.at(marketContractAddress);
    // The BUY order price needs to be higher than the SELL order price. E.g.:
    // Case 1) Buyer A wants to buy 1 token at $10, Seller B wants to sell 1 token at $5 -> there's a match,
    // Seller B sells one token to Buyer A at $5
    // Case 2) Buyer A wants to buy 1 token at $5, Seller B wants to sell 1 token at $10 -> there's no match and nothing changes
    const match_orders =
      marketContract.methodsObject['matchOrders'](1).toTransferParams();

    // TODO  for prod / real data it can be a cronjob or automated call to the match order entrypoint every x seconds or minutes
    // (or if a match is present, then call it etc)
    // batch = batch.withTransfer(match_orders);
    batch = batch.withTransfer(match_orders);

    dispatch(STATUS_CONFIRMING);
    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e) {
    console.log(e);
    dispatch(STATUS_ERROR);
    await sleep(3000);
    dispatch(STATUS_IDLE);
  }
}

export async function buy(
  tezos: TezosToolkit,
  marketContractAddress: MarketContractType,
  dispatch: StatusDispatchType
) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(marketContractAddress);

    const tokenContract = await tezos.wallet.at(stablecoinContract);

    // for now default values, they will be taken from input or predefined values
    const orderType = 'BUY';
    const rwaTokenAmount = RWAToken(1);
    const pricePerRwaToken = 2000000; // $2
    const currency = 'USDT';
    const orderExpiry = null;

    const open_ops = tokenContract.methodsObject['update_operators']([
      {
        add_operator: {
          owner: sender,
          operator: marketContractAddress,
          token_id: 0,
        },
      },
      // to avoid undefined values
    ]).toTransferParams();

    const buy_order = marketContract.methodsObject['placeBuyOrder']([
      {
        orderType: orderType,
        rwaTokenAmount: rwaTokenAmount,
        pricePerRwaToken: pricePerRwaToken,
        currency: currency,
        orderExpiry: orderExpiry,
      },
    ]).toTransferParams();

    const close_ops = tokenContract.methodsObject['update_operators']([
      {
        remove_operator: {
          owner: sender,
          operator: marketContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const match_orders =
      marketContract.methodsObject['matchOrders'](1).toTransferParams();

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(buy_order);
    batch = batch.withTransfer(close_ops);
    batch = batch.withTransfer(match_orders);

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
  marketContractAddress: MarketContractType,
  dispatch: StatusDispatchType
) {
  try {
    console.log('Sell action ...');
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(marketContractAddress);
    const rwaTokenContract = await tezos.wallet.at(OCEAN_TOKEN_ADDRESS);

    const orderType = 'SELL';
    const rwaTokenAmount = RWAToken(1);
    const pricePerRwaToken = 1000000; // $1
    const currency = 'USDT';
    const orderExpiry = null;

    const open_ops = rwaTokenContract.methodsObject['update_operators']([
      {
        add_operator: {
          owner: sender,
          operator: marketContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const sell_order = marketContract.methodsObject['placeSellOrder']([
      {
        orderType: orderType,
        rwaTokenAmount: rwaTokenAmount,
        pricePerRwaToken: pricePerRwaToken,
        currency: currency,
        orderExpiry: orderExpiry,
      },
    ]).toTransferParams();

    const close_ops = rwaTokenContract.methodsObject['update_operators']([
      {
        remove_operator: {
          owner: sender,
          operator: marketContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(sell_order);
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

// simple example of wallet contract transaction
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
