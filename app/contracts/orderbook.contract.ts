import { TezosToolkit } from '@mavrykdynamics/taquito';
import { OrderbookMarketType, stablecoinContract } from '~/consts/contracts';

import {
  StatusDispatchType,
  STATUS_CONFIRMING,
  STATUS_ERROR,
  STATUS_IDLE,
  STATUS_SUCCESS,
} from '~/lib/ui/use-status-flag';
import { formatRWAPrice, tokensToAtoms } from '~/lib/utils/formaters';

import { sleep } from '~/lib/utils/sleep';

// Orderbook buy & sell for secondary market page

type OrderbookBuySellParams = {
  tezos: TezosToolkit;
  marketContractAddress: OrderbookMarketType;
  dispatch: StatusDispatchType;
  tokensAmount: number;
  pricePerToken: number;
  decimals: number;
};

export async function orderbookBuy({
  tezos,
  marketContractAddress,
  dispatch,
  tokensAmount,
  pricePerToken,
  decimals,
}: OrderbookBuySellParams) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(marketContractAddress);

    const tokenContract = await tezos.wallet.at(stablecoinContract);

    const rwaTokenAmount = tokensToAtoms(tokensAmount, decimals).toNumber();
    const pricePerRwaToken = formatRWAPrice(pricePerToken, decimals);
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
        rwaTokenAmount,
        pricePerRwaToken,
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
  rwaTokenAddress,
  dispatch,
  tokensAmount,
  pricePerToken,
  decimals,
}: OrderbookBuySellParams & { rwaTokenAddress: string }) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(marketContractAddress);
    const tokenContact = await tezos.wallet.at(rwaTokenAddress);

    const rwaTokenAmount = tokensToAtoms(tokensAmount, decimals).toNumber();
    const pricePerRwaToken = formatRWAPrice(pricePerToken, decimals);
    const currency = 'USDT';
    const orderExpiry = null;

    const open_ops = tokenContact.methodsObject['update_operators']([
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
        rwaTokenAmount,
        pricePerRwaToken,
        currency: currency,
        orderExpiry: orderExpiry,
      },
    ]).toTransferParams();

    const close_ops = tokenContact.methodsObject['update_operators']([
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
