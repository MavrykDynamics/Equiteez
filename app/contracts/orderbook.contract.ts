/* eslint-disable no-useless-catch */
import { MavrykToolkit, OpKind } from "@mavrykdynamics/taquito";
import BigNumber from "bignumber.js";
import {
  getEstimationBatchResult,
  sendContractBatchOperation,
} from "~/errors/helpers/estimateAction.helper";

import {
  decimalScale,
  toNatString,
  toPositiveNatString,
} from "~/lib/utils/formaters";
import type { ContractActionLifecycleCallbacks } from "./actions.type";
import { BatchOperationKindType } from "./types";

export type OrderbookBuyParams = {
  tezos: MavrykToolkit;
  orderbookContractAddress: string;
  quoteTokenAddress: string;
  quoteTokenId: BigNumber.Value;
  rwaTokenAmount: BigNumber.Value;
  pricePerRwaToken: BigNumber.Value;
  currency: string;
  orderExpiry: string | null;
  isMarketOrder: boolean;
  baseTokenDecimals?: number;
  tickSizeAtoms?: BigNumber.Value;
  minRwaTokenAmount?: BigNumber.Value;
  minQuoteValue?: BigNumber.Value;
} & ContractActionLifecycleCallbacks;

type OrderbookCancelOrderParams = {
  tezos: MavrykToolkit;
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

const assertCurrency = (value: string) => {
  if (!value || typeof value !== "string" || !value.trim()) {
    throw new Error("Order currency key is required");
  }
};

const assertOrderExpiry = (value: string | null) => {
  if (value === null) return;

  const parsed = Date.parse(value);

  if (!Number.isFinite(parsed)) {
    throw new Error("Order expiry must be null or a valid timestamp");
  }
};

const buildOrderPayload = ({
  rwaTokenAmount,
  pricePerRwaToken,
  currency,
  orderExpiry,
  isMarketOrder,
}: Pick<
  OrderbookBuyParams,
  | "rwaTokenAmount"
  | "pricePerRwaToken"
  | "currency"
  | "orderExpiry"
  | "isMarketOrder"
>) => {
  assertCurrency(currency);
  assertOrderExpiry(orderExpiry);

  return {
    rwaTokenAmount: toPositiveNatString(rwaTokenAmount, "RWA token amount"),
    pricePerRwaToken: toPositiveNatString(
      pricePerRwaToken,
      "Price per RWA token"
    ),
    currency: currency.trim(),
    orderExpiry,
    isMarketOrder,
  };
};

const validateOrderRules = ({
  rwaTokenAmount,
  pricePerRwaToken,
  baseTokenDecimals,
  tickSizeAtoms,
  minRwaTokenAmount,
  minQuoteValue,
}: Pick<
  OrderbookBuyParams,
  | "rwaTokenAmount"
  | "pricePerRwaToken"
  | "baseTokenDecimals"
  | "tickSizeAtoms"
  | "minRwaTokenAmount"
  | "minQuoteValue"
>) => {
  const amountAtoms = new BigNumber(rwaTokenAmount);
  const priceAtoms = new BigNumber(pricePerRwaToken);

  if (tickSizeAtoms !== undefined) {
    const tickSize = new BigNumber(tickSizeAtoms);

    if (
      tickSize.isFinite() &&
      tickSize.isInteger() &&
      tickSize.gt(0) &&
      !priceAtoms.mod(tickSize).isZero()
    ) {
      throw new Error("Price is not aligned to the orderbook tick size");
    }
  }

  if (minRwaTokenAmount !== undefined) {
    const minAmount = new BigNumber(minRwaTokenAmount);

    if (minAmount.isFinite() && minAmount.gt(0) && amountAtoms.lt(minAmount)) {
      throw new Error("Order amount is below the orderbook minimum");
    }
  }

  if (minQuoteValue !== undefined && baseTokenDecimals !== undefined) {
    const minValue = new BigNumber(minQuoteValue);
    const quoteValue = amountAtoms
      .times(priceAtoms)
      .div(decimalScale(baseTokenDecimals))
      .integerValue(BigNumber.ROUND_DOWN);

    if (minValue.isFinite() && minValue.gt(0) && quoteValue.lt(minValue)) {
      throw new Error("Order quote value is below the orderbook minimum");
    }
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
    });
    validateOrderRules({
      rwaTokenAmount,
      pricePerRwaToken,
      baseTokenDecimals,
      tickSizeAtoms,
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

export async function orderbookBuy(params: OrderbookBuyParams) {
  try {
    const batchArr = await orderbookBuyBatch(params);

    await sendContractBatchOperation(params.tezos, batchArr, {
      onTransactionSubmitted: params.onTransactionSubmitted,
    });
  } catch (e: unknown) {
    throw e;
  }
}

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
    });
    validateOrderRules({
      rwaTokenAmount,
      pricePerRwaToken,
      baseTokenDecimals,
      tickSizeAtoms,
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

export async function orderbookSell(params: OrderbookSellParams) {
  try {
    const batchArr = await orderbookSellBatch(params);

    await sendContractBatchOperation(params.tezos, batchArr, {
      onTransactionSubmitted: params.onTransactionSubmitted,
    });
  } catch (e: unknown) {
    throw e;
  }
}

export async function orderbookCancelOrder({
  tezos,
  orderbookContractAddress,
  orderId,
  orderType,
  onTransactionSubmitted,
}: OrderbookCancelOrderParams) {
  try {
    const orderbookContract = await tezos.wallet.at(orderbookContractAddress);

    const rwaOrderbookOperation = await orderbookContract.methodsObject
      .cancelOrders([
        {
          orderId: toNatString(orderId, "Order ID"),
          orderType,
        },
      ])
      .send();
    onTransactionSubmitted?.();
    await rwaOrderbookOperation.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

export async function orderbookProcessRefund({
  tezos,
  orderbookContractAddress,
  orderId,
  orderType,
  onTransactionSubmitted,
}: OrderbookProcessRefundParams) {
  try {
    assertAddress(orderbookContractAddress, "Orderbook contract address");

    const orderbookContract = await tezos.wallet.at(orderbookContractAddress);

    const rwaOrderbookOperation = await orderbookContract.methodsObject
      .processRefund([
        {
          orderId: toNatString(orderId, "Order ID"),
          orderType,
        },
      ])
      .send();
    onTransactionSubmitted?.();
    await rwaOrderbookOperation.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

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
