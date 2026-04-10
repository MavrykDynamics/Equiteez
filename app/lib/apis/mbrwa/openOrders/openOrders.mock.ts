// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import { OrderTypes } from "~/lib/apis/mbrwa/user/userOrders/order.const";
import type { OpenOrder, OpenOrdersQueryData } from "./openOrders.schema";
import { atomsToTokens, tokensToAtoms } from "~/lib/utils/formaters";

const DEFAULT_DEMO_REFERENCE_PRICE = 1;
const DEFAULT_LEVELS_PER_SIDE = 24;
const UPDATED_LEVELS_PER_TICK = 3;
const MIN_ORDER_AMOUNT = 0.25;
const MAX_ORDER_AMOUNT = 42;
const BUY_SIDE_INDEX_OFFSET = 17;
const SELL_SIDE_INDEX_OFFSET = 31;

type CreateMockOpenOrdersParams = {
  baseTokenDecimals: number;
  levelsPerSide?: number;
  quoteTokenDecimals: number;
  referencePrice?: number;
  rwaAddress: string;
  tick: number;
};

type UpdateMockOpenOrdersParams = {
  baseTokenDecimals: number;
  currentOrders: OpenOrdersQueryData;
  quoteTokenDecimals: number;
  rwaAddress: string;
  tick: number;
};

type CreateMockOrdersForSideParams = {
  baseOrderId: number;
  baseTokenDecimals: number;
  levelsPerSide: number;
  midPrice: number;
  priceStep: number;
  quoteTokenDecimals: number;
  rwaAddress: string;
  side: "buy" | "sell";
  tick: number;
};

type CreateMockOrderParams = {
  amount: number;
  baseTokenDecimals: number;
  createdAt: string;
  id: number;
  orderType: OrderTypes.LIMIT_BUY | OrderTypes.LIMIT_SELL;
  price: number;
  quoteTokenDecimals: number;
  rwaAddress: string;
};

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const roundToStep = (value: number, step: number) =>
  Number(new BigNumber(value).div(step).integerValue().multipliedBy(step));

const getUpdatedLevelIndexes = (
  levelsCount: number,
  tick: number,
  offset: number
) => {
  const nextIndexes = new Set<number>();

  for (
    let currentStep = 0;
    currentStep < UPDATED_LEVELS_PER_TICK && nextIndexes.size < levelsCount;
    currentStep += 1
  ) {
    nextIndexes.add((tick * 5 + offset + currentStep * 7) % levelsCount);
  }

  return nextIndexes;
};

const getNextOrderAmount = (
  currentAmount: number,
  levelIndex: number,
  tick: number
) => {
  const wave = Math.sin((tick + 1) * 0.75 + levelIndex * 1.35);
  const nextAmount = currentAmount * (1 + wave * 0.18);

  return clamp(nextAmount, MIN_ORDER_AMOUNT, MAX_ORDER_AMOUNT);
};

const resolvePriceStep = (
  referencePrice: number,
  quoteTokenDecimals: number
) => {
  if (referencePrice >= 100) return 1;
  if (referencePrice >= 10) return 0.1;
  if (referencePrice >= 1) return 0.01;
  if (referencePrice >= 0.1) return 0.001;
  if (referencePrice >= 0.01) return 0.0001;

  return 1 / 10 ** Math.min(quoteTokenDecimals, 5);
};

const createMockOrder = ({
  amount,
  baseTokenDecimals,
  createdAt,
  id,
  orderType,
  price,
  quoteTokenDecimals,
  rwaAddress,
}: CreateMockOrderParams): OpenOrder => {
  const normalizedAmount = new BigNumber(amount).decimalPlaces(
    Math.min(baseTokenDecimals, 4),
    BigNumber.ROUND_HALF_UP
  );
  const normalizedPrice = new BigNumber(price).decimalPlaces(
    Math.min(quoteTokenDecimals, 4),
    BigNumber.ROUND_HALF_UP
  );
  const total = normalizedAmount.multipliedBy(normalizedPrice);
  const unfulfilledAmount = tokensToAtoms(normalizedAmount, baseTokenDecimals);
  const totalQuoteValue = tokensToAtoms(total, quoteTokenDecimals);

  return {
    id,
    orderbook: {
      rwa_token: {
        address: rwaAddress,
      },
    },
    is_canceled: false,
    is_expired: false,
    is_fulfilled: false,
    is_refunded: false,
    order_expiry: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    order_id: id,
    order_type: orderType,
    created_at: createdAt,
    ended_at: null,
    fulfilled_amount: 0,
    orderbook_id: 1,
    price_per_rwa_token: tokensToAtoms(normalizedPrice, quoteTokenDecimals).toNumber(),
    refunded_amount: 0,
    rwa_token_amount: unfulfilledAmount.toNumber(),
    total_paid_out: 0,
    total_usd_value_of_rwa_token_amount: totalQuoteValue.toNumber(),
    unfulfilled_amount: unfulfilledAmount.toNumber(),
  };
};

const createMockOrdersForSide = ({
  baseOrderId,
  baseTokenDecimals,
  levelsPerSide,
  midPrice,
  priceStep,
  quoteTokenDecimals,
  rwaAddress,
  side,
  tick,
}: CreateMockOrdersForSideParams) => {
  const orders = Array.from({ length: levelsPerSide }, (_, index) => {
    const levelOffset = (index + 1) * priceStep;
    const levelPrice =
      side === "buy"
        ? Math.max(priceStep, midPrice - levelOffset)
        : midPrice + levelOffset;
    const price = roundToStep(levelPrice, priceStep);
    const amount = randomBetween(4, 24) + (levelsPerSide - index) * 0.25;
    const createdAt = new Date(
      Date.now() - (levelsPerSide - index + tick) * 1000 * 15
    ).toISOString();

    return createMockOrder({
      amount,
      baseTokenDecimals,
      createdAt,
      id: baseOrderId + index,
      orderType:
        side === "buy" ? OrderTypes.LIMIT_BUY : OrderTypes.LIMIT_SELL,
      price,
      quoteTokenDecimals,
      rwaAddress,
    });
  });

  return side === "buy"
    ? orders.sort(
        (left, right) => right.price_per_rwa_token - left.price_per_rwa_token
      )
    : orders.sort(
        (left, right) => left.price_per_rwa_token - right.price_per_rwa_token
      );
};

const updateMockOrdersForSide = ({
  baseTokenDecimals,
  orders,
  quoteTokenDecimals,
  rwaAddress,
  side,
  tick,
}: {
  baseTokenDecimals: number;
  orders: OpenOrder[];
  quoteTokenDecimals: number;
  rwaAddress: string;
  side: "buy" | "sell";
  tick: number;
}) => {
  if (orders.length === 0) return orders;

  const nextOrders = [...orders];
  const updatedLevelIndexes = getUpdatedLevelIndexes(
    orders.length,
    tick,
    side === "buy" ? BUY_SIDE_INDEX_OFFSET : SELL_SIDE_INDEX_OFFSET
  );

  updatedLevelIndexes.forEach((levelIndex) => {
    const currentOrder = orders[levelIndex];
    const currentAmount = atomsToTokens(
      currentOrder.unfulfilled_amount,
      baseTokenDecimals
    ).toNumber();
    const currentPrice = atomsToTokens(
      currentOrder.price_per_rwa_token,
      quoteTokenDecimals
    ).toNumber();
    const nextAmount = getNextOrderAmount(currentAmount, levelIndex, tick);

    if (Number(nextAmount.toFixed(4)) === Number(currentAmount.toFixed(4))) {
      return;
    }

    nextOrders[levelIndex] = createMockOrder({
      amount: nextAmount,
      baseTokenDecimals,
      createdAt: currentOrder.created_at,
      id: currentOrder.id,
      orderType:
        side === "buy" ? OrderTypes.LIMIT_BUY : OrderTypes.LIMIT_SELL,
      price: currentPrice,
      quoteTokenDecimals,
      rwaAddress,
    });
  });

  return nextOrders;
};

export const createMockOpenOrders = ({
  baseTokenDecimals,
  levelsPerSide = DEFAULT_LEVELS_PER_SIDE,
  quoteTokenDecimals,
  referencePrice = DEFAULT_DEMO_REFERENCE_PRICE,
  rwaAddress,
  tick,
}: CreateMockOpenOrdersParams): OpenOrdersQueryData => {
  const referencePriceStep = resolvePriceStep(referencePrice, quoteTokenDecimals);
  const nextMidPrice = clamp(
    referencePrice + randomBetween(-1, 1) * referencePriceStep * 2,
    referencePriceStep,
    Math.max(referencePrice * 2, referencePriceStep * 10)
  );
  const priceStep = resolvePriceStep(nextMidPrice, quoteTokenDecimals);

  return {
    buyOrders: createMockOrdersForSide({
      baseOrderId: tick * 1000,
      baseTokenDecimals,
      levelsPerSide,
      midPrice: nextMidPrice,
      priceStep,
      quoteTokenDecimals,
      rwaAddress,
      side: "buy",
      tick,
    }),
    sellOrders: createMockOrdersForSide({
      baseOrderId: tick * 1000 + 500,
      baseTokenDecimals,
      levelsPerSide,
      midPrice: nextMidPrice,
      priceStep,
      quoteTokenDecimals,
      rwaAddress,
      side: "sell",
      tick,
    }),
  };
};

export const updateMockOpenOrders = ({
  baseTokenDecimals,
  currentOrders,
  quoteTokenDecimals,
  rwaAddress,
  tick,
}: UpdateMockOpenOrdersParams): OpenOrdersQueryData => ({
  buyOrders: updateMockOrdersForSide({
    baseTokenDecimals,
    orders: currentOrders.buyOrders,
    quoteTokenDecimals,
    rwaAddress,
    side: "buy",
    tick,
  }),
  sellOrders: updateMockOrdersForSide({
    baseTokenDecimals,
    orders: currentOrders.sellOrders,
    quoteTokenDecimals,
    rwaAddress,
    side: "sell",
    tick,
  }),
});
