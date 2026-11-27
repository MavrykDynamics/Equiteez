/* eslint-disable no-useless-catch */
import {
  MavrykToolkit,
  OpKind,
  type TransferParams,
} from "@mavrykdynamics/taquito";
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
import { alignQuantityAtomsToTick } from "~/lib/orderbook/orderbookTick";
import type { ContractActionLifecycleCallbacks } from "./actions.type";
import { sendAndConfirmBatch } from "./execution";
import { hasActiveOperator } from "./operators";
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
  quantityTickSizeAtoms?: BigNumber.Value;
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
  isMarketOrder,
  baseTokenDecimals,
  tickSizeAtoms,
  quantityTickSizeAtoms,
  minRwaTokenAmount,
  minQuoteValue,
}: Pick<
  OrderbookBuyParams,
  | "rwaTokenAmount"
  | "pricePerRwaToken"
  | "isMarketOrder"
  | "baseTokenDecimals"
  | "tickSizeAtoms"
  | "quantityTickSizeAtoms"
  | "minRwaTokenAmount"
  | "minQuoteValue"
>) => {
  const amountAtoms = new BigNumber(rwaTokenAmount);
  const priceAtoms = new BigNumber(pricePerRwaToken);

  if (quantityTickSizeAtoms === undefined) {
    throw new Error("Order quantity tick size is required");
  }
  if (
    !alignQuantityAtomsToTick(amountAtoms, quantityTickSizeAtoms).eq(
      amountAtoms
    )
  ) {
    throw new Error(
      "Quantity is not aligned to the orderbook quantity tick size"
    );
  }

  if (!isMarketOrder && tickSizeAtoms !== undefined) {
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

type WalletContract = Awaited<ReturnType<MavrykToolkit["wallet"]["at"]>>;

/**
 * The order, wrapped in a temporary operator grant only when the orderbook
 * has none: an existing (persistent) grant is used as is and never removed.
 */
async function withOperatorGrant({
  tokenContract,
  owner,
  operator,
  tokenId,
  order,
}: {
  tokenContract: WalletContract;
  owner: string;
  operator: string;
  tokenId: string;
  order: TransferParams;
}): Promise<BatchOperationKindType> {
  const hasGrant = await hasActiveOperator(tokenContract, {
    owner,
    operator,
    tokenId,
  });

  if (hasGrant) return [{ kind: OpKind.TRANSACTION, ...order }];

  const grant = { owner, operator, token_id: tokenId };
  const addOperator = tokenContract.methodsObject["update_operators"]([
    { add_operator: grant },
  ]).toTransferParams();
  const removeOperator = tokenContract.methodsObject["update_operators"]([
    { remove_operator: grant },
  ]).toTransferParams();

  return [
    { kind: OpKind.TRANSACTION, ...addOperator },
    { kind: OpKind.TRANSACTION, ...order },
    { kind: OpKind.TRANSACTION, ...removeOperator },
  ];
}

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
      isMarketOrder,
      baseTokenDecimals,
      tickSizeAtoms,
      quantityTickSizeAtoms,
      minRwaTokenAmount,
      minQuoteValue,
    });

    const buyOrder = orderbookContract.methodsObject["placeBuyOrder"]([
      orderPayload,
    ]).toTransferParams();

    return await withOperatorGrant({
      tokenContract: quoteTokenContract,
      owner: sender,
      operator: orderbookContractAddress,
      tokenId: operatorTokenId,
      order: buyOrder,
    });
  } catch (e: unknown) {
    throw e;
  }
}

export async function orderbookBuy(params: OrderbookBuyParams) {
  try {
    const batchArr = await orderbookBuyBatch(params);

    await sendContractBatchOperation(params.tezos, batchArr, {
      onTransactionConfirmed: params.onTransactionConfirmed,
      onTransactionSubmitted: params.onTransactionSubmitted,
      execution: params.execution,
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
  quantityTickSizeAtoms,
  minRwaTokenAmount,
  minQuoteValue,
}: OrderbookSellParams) {
  try {
    assertAddress(orderbookContractAddress, "Orderbook contract address");
    assertAddress(rwaTokenAddress, "RWA token address");

    const sender = await tezos.wallet.pkh();

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
      isMarketOrder,
      baseTokenDecimals,
      tickSizeAtoms,
      quantityTickSizeAtoms,
      minRwaTokenAmount,
      minQuoteValue,
    });

    const sellOrder = orderbookContract.methodsObject["placeSellOrder"]([
      orderPayload,
    ]).toTransferParams();

    return await withOperatorGrant({
      tokenContract: tokenContact,
      owner: sender,
      operator: orderbookContractAddress,
      tokenId: operatorTokenId,
      order: sellOrder,
    });
  } catch (e: unknown) {
    throw e;
  }
}

export async function orderbookSell(params: OrderbookSellParams) {
  try {
    const batchArr = await orderbookSellBatch(params);

    await sendContractBatchOperation(params.tezos, batchArr, {
      onTransactionConfirmed: params.onTransactionConfirmed,
      onTransactionSubmitted: params.onTransactionSubmitted,
      execution: params.execution,
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
  ...callbacks
}: OrderbookCancelOrderParams) {
  const orderbookContract = await tezos.wallet.at(orderbookContractAddress);
  const cancel = orderbookContract.methodsObject
    .cancelOrders([
      {
        orderId: toNatString(orderId, "Order ID"),
        orderType,
      },
    ])
    .toTransferParams();

  await sendAndConfirmBatch(
    tezos,
    [{ kind: OpKind.TRANSACTION, ...cancel }],
    callbacks
  );
}

export async function orderbookProcessRefund({
  tezos,
  orderbookContractAddress,
  orderId,
  orderType,
  ...callbacks
}: OrderbookProcessRefundParams) {
  assertAddress(orderbookContractAddress, "Orderbook contract address");

  const orderbookContract = await tezos.wallet.at(orderbookContractAddress);
  const refund = orderbookContract.methodsObject
    .processRefund([
      {
        orderId: toNatString(orderId, "Order ID"),
        orderType,
      },
    ])
    .toTransferParams();

  await sendAndConfirmBatch(
    tezos,
    [{ kind: OpKind.TRANSACTION, ...refund }],
    callbacks
  );
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
