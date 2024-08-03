/* eslint-disable no-useless-catch */
import { TezosToolkit } from '@mavrykdynamics/taquito';
import {
  MarketContractType,
  pickTokenBasedOnMarket,
  stablecoinContract,
} from '~/consts/contracts';

import { formatRWAPrice, RWAToken } from '~/lib/utils/formaters';

// Exchange limit

type BuySellParams = {
  tezos: TezosToolkit;
  marketContractAddress: MarketContractType;
  tokensAmount: number;
  pricePerToken: number;
};

export async function placeBuyOrderAndMatch({
  tezos,
  marketContractAddress,
  tokensAmount,
  pricePerToken,
}: BuySellParams) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(marketContractAddress);

    const tokenContract = await tezos.wallet.at(stablecoinContract);

    const orderType = 'BUY';
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

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

export async function placeSellOrder({
  tezos,
  marketContractAddress,
  tokensAmount,
  pricePerToken,
}: BuySellParams) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(marketContractAddress);
    const rwaTokenContract = await tezos.wallet.at(
      pickTokenBasedOnMarket[marketContractAddress]
    );

    const orderType = 'SELL';
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

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}
