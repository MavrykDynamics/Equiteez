import { TezosToolkit } from '@mavrykdynamics/taquito';
import {
  MarketContractType,
  pickTokenBasedOnMarket,
  stablecoinContract,
} from '~/consts/contracts';

import {
  StatusDispatchType,
  STATUS_CONFIRMING,
  STATUS_ERROR,
  STATUS_IDLE,
  STATUS_SUCCESS,
} from '~/hooks/use-status-flag';
import { formatRWAPrice, RWAToken } from '~/lib/utils/formaters';

import { sleep } from '~/lib/utils/sleep';

// Exchange limit

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

    await sleep(3000);
    dispatch(STATUS_IDLE);
  } catch (e) {
    console.log(e);
    dispatch(STATUS_ERROR);
    await sleep(3000);
    dispatch(STATUS_IDLE);
  }
}

type BuySellParams = {
  tezos: TezosToolkit;
  marketContractAddress: MarketContractType;
  dispatch: StatusDispatchType;
  tokensAmount: number;
  pricePerToken: number;
};

export async function placeBuyOrderAndMatch({
  tezos,
  marketContractAddress,
  dispatch,
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

export async function placeSellOrder({
  tezos,
  marketContractAddress,
  dispatch,
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
