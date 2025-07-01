/* eslint-disable no-useless-catch */
import { MavrykToolkit } from "@mavrykdynamics/taquito";

import { formatRWAPrice, tokensToAtoms } from "~/lib/utils/formaters";

// Orderbook buy & sell for secondary market page

const callMatchOrdersFromProxy = async (contractAddress: string) => {
  try {
    const payload = {
      contractAddress,
      rpcUrl: process.env.RPC_NODE_URL ?? "",
    };
    const nonce = Date.now().toString();
    const secret = process.env.NEXT_PUBLIC_DAPP_HMAC_SECRET;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const payloadData = encoder.encode(JSON.stringify(payload) + nonce);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      payloadData
    );
    const signatureHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    await fetch(process.env.PROXY_URL ?? "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload,
        nonce,
        signature: signatureHex,
      }),
    });
  } catch (e) {
    console.log(e);
  }
};

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

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(buy_order);
    batch = batch.withTransfer(close_ops);

    const batchOp = await batch.send();

    await batchOp.confirmation();

    await callMatchOrdersFromProxy(orderbookContractAddress);
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
}: Omit<OrderbookBuySellParams, "quoteTokenAddress"> & {
  rwaTokenAddress: string;
}) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

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

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(sell_order);
    batch = batch.withTransfer(close_ops);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}
