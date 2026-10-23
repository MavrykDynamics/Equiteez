import type {
  AssetRefundsScan,
  RefundItemType,
  RefundOrderRef,
  RefundPart,
  RefundTokenTotal,
} from "~/lib/apis/rwa/refunds/refunds.types";

export const REFUND_PART_MAX_ORDERS = 10;

export class RefundsScanError extends Error {}

type TraversedRefunds = {
  items: RefundItemType[];
  isRealtime: boolean;
  level: number;
};

const getOrderKey = (item: RefundItemType) =>
  `${item.orderbook_address}|${item.order_type}|${item.order_id}`;

const getTokenKey = (tokenAddress: string, tokenId: string) =>
  `${tokenAddress}|${tokenId}`;

const toUnits = (value: string) => {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
};

const isEligibleItem = (item: RefundItemType) => {
  if (item.availability !== "eligible" || !item.refund) return false;

  const units = toUnits(item.refund.amount_units);

  return units !== null && units > 0n;
};

const dedupeItems = (items: RefundItemType[]) => {
  const itemsByKey = new Map<string, RefundItemType>();

  items.forEach((item) => {
    const key = getOrderKey(item);
    const existing = itemsByKey.get(key);

    if (existing && JSON.stringify(existing) !== JSON.stringify(item)) {
      throw new RefundsScanError("Refund data changed during scan");
    }

    itemsByKey.set(key, item);
  });

  return [...itemsByKey.values()];
};

const compareOrders = (first: RefundOrderRef, second: RefundOrderRef) => {
  if (first.orderType !== second.orderType) {
    return first.orderType === "BUY" ? -1 : 1;
  }

  const difference = BigInt(first.orderId) - BigInt(second.orderId);

  return difference === 0n ? 0 : difference < 0n ? -1 : 1;
};

const buildTotals = (items: RefundItemType[]) => {
  const totalsByToken = new Map<string, RefundTokenTotal>();

  items.forEach(({ refund }) => {
    if (!refund) return;

    const key = getTokenKey(refund.token_address, refund.token_id);
    const existing = totalsByToken.get(key);
    const amountUnits = BigInt(refund.amount_units);

    if (!existing) {
      totalsByToken.set(key, {
        tokenAddress: refund.token_address,
        tokenId: refund.token_id,
        symbol: refund.symbol,
        decimals: refund.decimals,
        amountUnits,
      });
      return;
    }

    if (
      existing.decimals !== refund.decimals ||
      existing.symbol !== refund.symbol
    ) {
      throw new RefundsScanError("Refund token metadata is inconsistent");
    }

    existing.amountUnits += amountUnits;
  });

  return [...totalsByToken.values()];
};

const buildParts = (items: RefundItemType[]) => {
  const ordersByBook = new Map<string, RefundOrderRef[]>();

  items.forEach((item) => {
    const orders = ordersByBook.get(item.orderbook_address) ?? [];

    orders.push({ orderId: item.order_id, orderType: item.order_type });
    ordersByBook.set(item.orderbook_address, orders);
  });

  return [...ordersByBook.keys()].sort().flatMap((orderbookAddress) => {
    const orders = [...(ordersByBook.get(orderbookAddress) ?? [])].sort(
      compareOrders
    );
    const parts: RefundPart[] = [];

    for (let i = 0; i < orders.length; i += REFUND_PART_MAX_ORDERS) {
      parts.push({
        orderbookAddress,
        orders: orders.slice(i, i + REFUND_PART_MAX_ORDERS),
      });
    }

    return parts;
  });
};

export const buildAssetRefundsScan = ({
  items,
  isRealtime,
  level,
}: TraversedRefunds): AssetRefundsScan => {
  const uniqueItems = dedupeItems(items);
  const eligibleItems = uniqueItems.filter(isEligibleItem);

  return {
    eligibleCount: eligibleItems.length,
    blockedCount: uniqueItems.length - eligibleItems.length,
    isRealtime,
    level,
    totals: buildTotals(eligibleItems),
    parts: buildParts(eligibleItems),
  };
};

/** Exact decimal formatting of integer token units. */
export const formatRefundUnits = (
  amountUnits: bigint,
  decimals: number | null
) => {
  if (decimals === null || decimals <= 0) return amountUnits.toString();

  const raw = amountUnits.toString().padStart(decimals + 1, "0");
  const integerPart = raw.slice(0, -decimals);
  const fractionPart = raw.slice(-decimals).replace(/0+$/, "");

  return fractionPart ? `${integerPart}.${fractionPart}` : integerPart;
};
