/* eslint-disable no-useless-catch */
import { MavrykToolkit } from "@mavrykdynamics/taquito";

import { formatRWAPrice, tokensToAtoms } from "~/lib/utils/formaters";

type OrderbookBuySellParams = {
  tezos: MavrykToolkit;
  orderbookContractAddress: string;
  quoteTokenAddress: string;
  tokensAmount: number;
  pricePerToken: number;
  decimals: number;
  quoteTokenDecimals: number;
  isAdmin?: boolean;
};

export async function orderbookBuy({
  tezos,
  orderbookContractAddress,
  quoteTokenAddress,
  tokensAmount,
  pricePerToken,
  decimals,
  quoteTokenDecimals,
  isAdmin,
}: OrderbookBuySellParams) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const orderbookContract = await tezos.wallet.at(orderbookContractAddress);
    const quoteTokenContract = await tezos.wallet.at(quoteTokenAddress);

    const rwaTokenAmount = tokensToAtoms(tokensAmount, decimals).toNumber();
    const pricePerRwaToken = formatRWAPrice(pricePerToken, quoteTokenDecimals);

    const currency = "USDT";
    const orderExpiry = null; // handle if needed

    // OPEN OPERATORS
    const open_ops = quoteTokenContract.methodsObject["update_operators"]([
      {
        add_operator: {
          owner: sender,
          operator: orderbookContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(open_ops);

    // PREPARE BUY ORDERS
    const buy_orders = [];

    const numOrders = isAdmin ? 10 : 1;

    for (let i = 0; i < numOrders; i++) {
      buy_orders.push({
        rwaTokenAmount,
        pricePerRwaToken,
        currency,
        orderExpiry,
      });
    }

    const buy_order_op =
      orderbookContract.methodsObject["placeBuyOrder"](
        buy_orders
      ).toTransferParams();
    batch = batch.withTransfer(buy_order_op);

    // CLOSE OPERATORS
    const close_ops = quoteTokenContract.methodsObject["update_operators"]([
      {
        remove_operator: {
          owner: sender,
          operator: orderbookContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(close_ops);

    // SEND BATCH
    const batchOp = await batch.send();
    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

export async function orderbookSell({
  tezos,
  orderbookContractAddress,
  rwaTokenAddress,
  tokensAmount,
  pricePerToken,
  decimals,
  quoteTokenDecimals,
  isAdmin,
}: Omit<OrderbookBuySellParams, "quoteTokenAddress"> & {
  rwaTokenAddress: string;
  isAdmin: boolean;
}) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const orderbookContract = await tezos.wallet.at(orderbookContractAddress);
    const tokenContract = await tezos.wallet.at(rwaTokenAddress);

    const rwaTokenAmount = tokensToAtoms(tokensAmount, decimals).toNumber();
    const pricePerRwaToken = formatRWAPrice(pricePerToken, quoteTokenDecimals);
    const currency = "USDT";
    const orderExpiry = null;

    // OPEN OPERATOR
    const open_ops = tokenContract.methodsObject["update_operators"]([
      {
        add_operator: {
          owner: sender,
          operator: orderbookContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(open_ops);

    // PREPARE SELL ORDERS
    const sell_orders = [];
    const numOrders = isAdmin ? 10 : 1;

    for (let i = 0; i < numOrders; i++) {
      sell_orders.push({
        rwaTokenAmount,
        pricePerRwaToken,
        currency,
        orderExpiry,
      });
    }

    const sell_order_op =
      orderbookContract.methodsObject["placeSellOrder"](
        sell_orders
      ).toTransferParams();
    batch = batch.withTransfer(sell_order_op);

    // CLOSE OPERATOR
    const close_ops = tokenContract.methodsObject["update_operators"]([
      {
        remove_operator: {
          owner: sender,
          operator: orderbookContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(close_ops);

    // SEND BATCH
    const batchOp = await batch.send();
    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}
