/* eslint-disable no-useless-catch */
import { MavrykToolkit } from "@mavrykdynamics/taquito";

import { formatRWAPrice, tokensToAtoms } from "~/lib/utils/formaters";

// Orderbook buy & sell for secondary market page

type OrderbookBuySellParams = {
  tezos: MavrykToolkit;
  orderbookContractAddress: string;
  quoteTokenAddress: string;
  tokensAmount: number;
  pricePerToken: number;
  decimals: number;
  quoteTokenDecimals: number;
};

export async function orderbookBuy({
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
    let batch = tezos.wallet.batch([]);

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
          operator: quoteTokenAddress,
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
          operator: quoteTokenAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const match_orders =
      orderbookContract.methodsObject["matchOrders"](1).toTransferParams();

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

export async function orderbookSell({
  tezos,
  orderbookContractAddress,
  quoteTokenAddress,
  tokensAmount,
  pricePerToken,
  decimals,
  quoteTokenDecimals,
}: OrderbookBuySellParams & { rwaTokenAddress: string }) {
  try {
    debugger;
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const orderbookContract = await tezos.wallet.at(orderbookContractAddress);
    const tokenContact = await tezos.wallet.at(quoteTokenAddress);

    const rwaTokenAmount = tokensToAtoms(tokensAmount, decimals).toNumber();
    const pricePerRwaToken = formatRWAPrice(pricePerToken, quoteTokenDecimals);
    const currency = "USDT";
    const orderExpiry = null;

    const open_ops = tokenContact.methodsObject["update_operators"]([
      {
        add_operator: {
          owner: sender,
          operator: quoteTokenAddress,
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
          operator: quoteTokenAddress,
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
