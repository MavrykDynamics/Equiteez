import { assertNoStoredRelayLock } from "~/lib/relay/relay.storage";
/* eslint-disable no-useless-catch */
import { MavrykToolkit, OpKind } from "@mavrykdynamics/taquito";
import type { BigNumber } from "bignumber.js";
import {
  getEstimationBatchResult,
  sendContractBatchOperation,
} from "~/errors/helpers/estimateAction.helper";

import { toNatString } from "~/lib/utils/formaters";
import { buildOrderPayload, type OrderPayloadParams } from "./orderbookPayload";
import type { ContractActionLifecycleCallbacks } from "./actions.type";
import { verifyDirectOrderFee } from "./directOrderFee";
import { BatchOperationKindType } from "./types";

export type OrderbookBuyParams = {
  tezos: MavrykToolkit;
  beforeSubmit?: () => void | Promise<void>;
  orderbookContractAddress: string;
  quoteTokenAddress: string;
  quoteTokenId: BigNumber.Value;
} & OrderPayloadParams &
  ContractActionLifecycleCallbacks;

type OrderbookCancelOrderParams = {
  tezos: MavrykToolkit;
  beforeSubmit?: () => void | Promise<void>;
  orderbookContractAddress: string;
  orderId: BigNumber.Value;
  orderType: string;
} & ContractActionLifecycleCallbacks;

type OrderbookProcessRefundParams = OrderbookCancelOrderParams;

export type OrderbookSellParams = Omit<
  OrderbookBuyParams,
  "quoteTokenAddress" | "quoteTokenId"
> & {
  rwaTokenAddress: string;
  rwaTokenId: BigNumber.Value;
};

const assertAddress = (value: string, label: string) => {
  if (!value || typeof value !== "string") {
    throw new Error(`${label} is required`);
  }
};

export async function orderbookBuyBatch({
  tezos,
  orderbookContractAddress,
  quoteTokenAddress,
  quoteTokenId,
  rwaTokenAmount,
  pricePerRwaToken,
  currency,
  orderExpiry,
  isMarketOrder,
  baseTokenDecimals,
  tickSizeAtoms,
  quantityTickSizeAtoms,
  minRwaTokenAmount,
  minQuoteValue,
}: OrderbookBuyParams) {
  try {
    assertAddress(orderbookContractAddress, "Orderbook contract address");
    assertAddress(quoteTokenAddress, "Quote token address");

    const sender = await tezos.wallet.pkh();
    const batch: BatchOperationKindType = [];

    const orderbookContract = await tezos.wallet.at(orderbookContractAddress);
    const quoteTokenContract = await tezos.wallet.at(quoteTokenAddress);
    const operatorTokenId = toNatString(quoteTokenId, "Quote token ID");
    const orderPayload = buildOrderPayload({
      rwaTokenAmount,
      pricePerRwaToken,
      currency,
      orderExpiry,
      isMarketOrder,
      baseTokenDecimals,
      tickSizeAtoms,
      quantityTickSizeAtoms,
      minRwaTokenAmount,
      minQuoteValue,
    });

    const open_ops = quoteTokenContract.methodsObject["update_operators"]([
      {
        add_operator: {
          owner: sender,
          operator: orderbookContractAddress,
          token_id: operatorTokenId,
        },
      },
      // to avoid undefined values
    ]).toTransferParams();

    const buy_order = orderbookContract.methodsObject["placeBuyOrder"]([
      orderPayload,
    ]).toTransferParams();

    const close_ops = quoteTokenContract.methodsObject["update_operators"]([
      {
        remove_operator: {
          owner: sender,
          operator: orderbookContractAddress,
          token_id: operatorTokenId,
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

export const orderbookBuy = (params: OrderbookBuyParams) =>
  sendDirectOrder(params, orderbookBuyBatch);

export async function orderbookSellBatch({
  tezos,
  orderbookContractAddress,
  rwaTokenAddress,
  rwaTokenId,
  rwaTokenAmount,
  pricePerRwaToken,
  currency,
  orderExpiry,
  isMarketOrder,
  baseTokenDecimals,
  tickSizeAtoms,
  quantityTickSizeAtoms,
  minRwaTokenAmount,
  minQuoteValue,
}: OrderbookSellParams) {
  try {
    assertAddress(orderbookContractAddress, "Orderbook contract address");
    assertAddress(rwaTokenAddress, "RWA token address");

    const sender = await tezos.wallet.pkh();
    const batch: BatchOperationKindType = [];

    const orderbookContract = await tezos.wallet.at(orderbookContractAddress);
    const tokenContact = await tezos.wallet.at(rwaTokenAddress);
    const operatorTokenId = toNatString(rwaTokenId, "RWA token ID");
    const orderPayload = buildOrderPayload({
      rwaTokenAmount,
      pricePerRwaToken,
      currency,
      orderExpiry,
      isMarketOrder,
      baseTokenDecimals,
      tickSizeAtoms,
      quantityTickSizeAtoms,
      minRwaTokenAmount,
      minQuoteValue,
    });

    const open_ops = tokenContact.methodsObject["update_operators"]([
      {
        add_operator: {
          owner: sender,
          operator: orderbookContractAddress,
          token_id: operatorTokenId,
        },
      },
    ]).toTransferParams();

    const sell_order = orderbookContract.methodsObject["placeSellOrder"]([
      orderPayload,
    ]).toTransferParams();

    const close_ops = tokenContact.methodsObject["update_operators"]([
      {
        remove_operator: {
          owner: sender,
          operator: orderbookContractAddress,
          token_id: operatorTokenId,
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

export const orderbookSell = (params: OrderbookSellParams) =>
  sendDirectOrder(params, orderbookSellBatch);

async function buildOrderManagementBatch(
  {
    tezos,
    orderbookContractAddress,
    orderId,
    orderType,
  }: OrderbookCancelOrderParams,
  entrypoint: "cancelOrders" | "processRefund"
): Promise<BatchOperationKindType> {
  assertAddress(orderbookContractAddress, "Orderbook contract address");
  if (orderType !== "BUY" && orderType !== "SELL")
    throw new Error("Invalid order type");
  const contract = await tezos.wallet.at(orderbookContractAddress);
  const transfer = contract.methodsObject[entrypoint]([
    {
      orderId: toNatString(orderId, "Order ID"),
      orderType,
    },
  ]).toTransferParams();
  return [{ kind: OpKind.TRANSACTION, ...transfer }];
}
export const orderbookCancelBatch = (params: OrderbookCancelOrderParams) =>
  buildOrderManagementBatch(params, "cancelOrders");
export const orderbookRefundBatch = (params: OrderbookProcessRefundParams) =>
  buildOrderManagementBatch(params, "processRefund");
async function sendDirectOrder<
  P extends {
    tezos: MavrykToolkit;
    beforeSubmit?: () => void | Promise<void>;
  } & ContractActionLifecycleCallbacks,
>(params: P, builder: (params: P) => Promise<BatchOperationKindType>) {
  const relayApiUrl =
    typeof window !== "undefined"
      ? (await import("~/lib/apis/rwa/config")).rwaApiUrl
      : null;
  const wallet = await params.tezos.wallet.pkh();
  const chain = await params.tezos.rpc.getChainId();
  const batch = await builder(params);
  await verifyDirectOrderFee(
    params.tezos,
    batch,
    wallet,
    chain,
    params.beforeSubmit
  );
  if (typeof window !== "undefined") {
    assertNoStoredRelayLock(
      window.localStorage,
      JSON.stringify([
        1,
        "basenet",
        params.tezos.rpc.getRpcUrl(),
        chain,
        relayApiUrl,
        wallet,
      ]),
      batch.map((item) => item.to)
    );
  }
  await sendContractBatchOperation(params.tezos, batch, params);
}
export const orderbookCancelOrder = (params: OrderbookCancelOrderParams) =>
  sendDirectOrder(params, orderbookCancelBatch);
export const orderbookProcessRefund = (params: OrderbookProcessRefundParams) =>
  sendDirectOrder(params, orderbookRefundBatch);

// Estimation functions

export async function orderbookBuyEstimation(params: OrderbookBuyParams) {
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
