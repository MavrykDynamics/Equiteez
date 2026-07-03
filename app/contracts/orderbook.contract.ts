/* eslint-disable no-useless-catch */
import { MavrykToolkit, OpKind } from "@mavrykdynamics/taquito";
import {
  getEstimationBatchResult,
  sendContractBatchOperation,
} from "~/errors/helpers/estimateAction.helper";

import { formatRWAPrice, tokensToAtoms } from "~/lib/utils/formaters";
import { BatchOperationKindType } from "./types";

type OrderbookBuySellParams = {
  tezos: MavrykToolkit;
  orderbookContractAddress: string;
  quoteTokenAddress: string;
  tokensAmount: number;
  pricePerToken: number;
  decimals: number;
  quoteTokenDecimals: number;
};

type OrderbookCancelOrderParams = {
  tezos: MavrykToolkit;
  orderbookContractAddress: string;
  orderId: number;
  orderType: string;
};

export async function orderbookBuyBatch({
  tezos,
  orderbookContractAddress,
  quoteTokenAddress,
  tokensAmount,
  pricePerToken,
  decimals,
  quoteTokenDecimals,
}: OrderbookBuySellParams) {
  try {
    const sender = await tezos.wallet.pkh();
    const batch: BatchOperationKindType = [];

    const orderbookContract = await tezos.wallet.at(orderbookContractAddress);
    const quoteTokenContract = await tezos.wallet.at(quoteTokenAddress);

    const rwaTokenAmount = tokensToAtoms(tokensAmount, decimals).toNumber();
    const pricePerRwaToken = formatRWAPrice(pricePerToken, quoteTokenDecimals);
    const currency = "USDT";
    const orderExpiry = null;

    const open_ops = quoteTokenContract.methodsObject["update_operators"]([
      {
        add_operator: {
          owner: sender,
          operator: orderbookContractAddress,
          token_id: 0,
        },
      },
      // to avoid undefined values
    ]).toTransferParams();

    const buy_order = orderbookContract.methodsObject["placeBuyOrder"]([
      {
        rwaTokenAmount,
        pricePerRwaToken,
        currency: currency,
        orderExpiry: orderExpiry,
      },
    ]).toTransferParams();

    const close_ops = quoteTokenContract.methodsObject["update_operators"]([
      {
        remove_operator: {
          owner: sender,
          operator: orderbookContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch.push({ kind: OpKind.TRANSACTION, ...open_ops });
    batch.push({ kind: OpKind.TRANSACTION, ...buy_order });
    batch.push({ kind: OpKind.TRANSACTION, ...close_ops });

    return batch;
  } catch (e: unknown) {
    throw e;
  }
}

export async function orderbookBuy(params: OrderbookBuySellParams) {
  try {
    const batchArr = await orderbookBuyBatch(params);

    await sendContractBatchOperation(params.tezos, batchArr);
  } catch (e: unknown) {
    throw e;
  }
}

type OrderbookSellParams = Omit<OrderbookBuySellParams, "quoteTokenAddress"> & {
  rwaTokenAddress: string;
};

export async function orderbookSellBatch({
  tezos,
  orderbookContractAddress,
  rwaTokenAddress,
  tokensAmount,
  pricePerToken,
  decimals,
  quoteTokenDecimals,
}: OrderbookSellParams) {
  try {
    const sender = await tezos.wallet.pkh();
    const batch: BatchOperationKindType = [];

    const orderbookContract = await tezos.wallet.at(orderbookContractAddress);
    const tokenContact = await tezos.wallet.at(rwaTokenAddress);

    const rwaTokenAmount = tokensToAtoms(tokensAmount, decimals).toNumber();
    const pricePerRwaToken = formatRWAPrice(pricePerToken, quoteTokenDecimals);
    const currency = "USDT";
    const orderExpiry = null;

    const open_ops = tokenContact.methodsObject["update_operators"]([
      {
        add_operator: {
          owner: sender,
          operator: orderbookContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const sell_order = orderbookContract.methodsObject["placeSellOrder"]([
      {
        rwaTokenAmount,
        pricePerRwaToken,
        currency: currency,
        orderExpiry: orderExpiry,
      },
    ]).toTransferParams();

    const close_ops = tokenContact.methodsObject["update_operators"]([
      {
        remove_operator: {
          owner: sender,
          operator: orderbookContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch.push({ kind: OpKind.TRANSACTION, ...open_ops });
    batch.push({ kind: OpKind.TRANSACTION, ...sell_order });
    batch.push({ kind: OpKind.TRANSACTION, ...close_ops });

    return batch;
  } catch (e: unknown) {
    throw e;
  }
}

export async function orderbookSell(params: OrderbookSellParams) {
  try {
    const batchArr = await orderbookSellBatch(params);

    await sendContractBatchOperation(params.tezos, batchArr);
  } catch (e: unknown) {
    throw e;
  }
}

export async function orderbookCancelOrder({
  tezos,
  orderbookContractAddress,
  orderId,
  orderType,
}: OrderbookCancelOrderParams) {
  try {
    const orderbookContract = await tezos.wallet.at(orderbookContractAddress);

    const rwaOrderbookOperation = await orderbookContract.methodsObject
      .cancelOrders([
        {
          orderId,
          orderType,
        },
      ])
      .send();
    await rwaOrderbookOperation.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

// Estimation functions

export async function orderbookBuyEstimation(params: OrderbookBuySellParams) {
  try {
    const batchArr = await orderbookBuyBatch(params);

    return await getEstimationBatchResult(params.tezos, batchArr);
  } catch (e: unknown) {
    throw e;
  }
}

export async function orderbookSellEstimation(params: OrderbookSellParams) {
  try {
    const batchArr = await orderbookSellBatch(params);

    return await getEstimationBatchResult(params.tezos, batchArr);
  } catch (e: unknown) {
    throw e;
  }
}
