import { TezosToolkit } from '@mavrykdynamics/taquito';
import { NewMarketType, stablecoinContract } from '~/consts/contracts';

import {
  StatusDispatchType,
  STATUS_CONFIRMING,
  STATUS_ERROR,
  STATUS_IDLE,
  STATUS_SUCCESS,
} from '~/hooks/use-status-flag';
import { formatRWAPrice, RWAToken } from '~/lib/utils/formaters';

import { sleep } from '~/lib/utils/sleep';

// Orderbook buy & sell fir main market page ?

type OrderbookBuySellParams = {
  tezos: TezosToolkit;
  marketContractAddress: NewMarketType;
  dispatch: StatusDispatchType;
  tokensAmount: number;
  pricePerToken: number;
};

export async function orderbookBuy({
  tezos,
  marketContractAddress,
  dispatch,
  tokensAmount,
  pricePerToken,
}: OrderbookBuySellParams) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(marketContractAddress);

    const tokenContract = await tezos.wallet.at(stablecoinContract);

    const rwaTokenAmount = RWAToken(tokensAmount); // 1000000 = 1 token
    const pricePerRwaToken = formatRWAPrice(pricePerToken); // 990000,  $0.99$
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

    dispatch(STATUS_SUCCESS);

    await sleep(3000);
    dispatch(STATUS_IDLE);
  } catch (e: unknown) {
    console.log(e);
    dispatch(STATUS_ERROR);
    await sleep(3000);
    dispatch(STATUS_IDLE);
  }
}

export async function orderbookSell({
  tezos,
  marketContractAddress,
  dispatch,
  tokensAmount,
  pricePerToken,
}: OrderbookBuySellParams) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(marketContractAddress);
    const rwaTokenContract = await tezos.wallet.at(stablecoinContract);

    const rwaTokenAmount = RWAToken(tokensAmount); // 1000000 = 1 token
    const pricePerRwaToken = formatRWAPrice(pricePerToken);
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
