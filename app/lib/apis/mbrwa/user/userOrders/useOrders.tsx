import { useEffect, useState } from "react";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { useQuery } from "@tanstack/react-query";
import {
  fetchUserOpenOrders,
  fetchUserRefundableOrders,
} from "~/lib/apis/mbrwa/orders";
import type { OrderType } from "~/lib/apis/mbrwa/user/userOrders/orders.types";
import { toTokenSlug } from "~/lib/assets";
import {
  OrderIconByType,
  OrderNameByType,
  OrderStatus,
  OrderStatusNames,
  OrderTypes,
} from "~/lib/apis/mbrwa/user/userOrders/order.const";
import { getAssetLinkByAddress } from "~/routes/wallet.assets/components/AssetItem/AssetActions";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { unknownToError } from "~/errors/error";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";

export function useOrders(
  offset: number,
  limit: number,
  userAddress: string | null,
  searchTerm: string,
  orderType: string | null
) {
  const { warning } = useToasterContext();
  const { marketsArr } = useMarketsContext();
  const { tokensMetadata } = useTokensContext();

  const [openOrders, setOpenOrders] = useState<OrderType[]>([]);
  const [openOrdersCount, setOpenOrdersCount] = useState(0);

  const ordersData = useQuery({
    queryKey: [
      "fetchOpenOrders",
      userAddress,
      offset,
      limit,
      orderType,
      searchTerm,
    ],
    retry: false,
    enabled: Boolean(userAddress),
    queryFn: () =>
      fetchUserOpenOrders(
        userAddress || "",
        offset,
        limit,
        orderType,
        searchTerm
      ),
  });

  const refundableOrdersData = useQuery({
    queryKey: [
      "fetchRefundableOrders",
      userAddress,
      offset,
      limit,
      orderType,
      searchTerm,
    ],
    retry: false,
    enabled: Boolean(userAddress),
    queryFn: () =>
      fetchUserRefundableOrders(
        userAddress || "",
        offset,
        limit,
        orderType,
        searchTerm
      ),
  });

  useEffect(() => {
    if (!ordersData.data && !refundableOrdersData.data) return;

    const orders = [
      ...(ordersData.data?.orders ?? []),
      ...(refundableOrdersData.data?.orders ?? []),
    ];
    const count =
      (ordersData.data?.total_count ?? 0) +
      (refundableOrdersData.data?.total_count ?? 0);

    setOpenOrdersCount(count);
    setOpenOrders(
      orders.map((order) => {
        const tokenSlug = String(toTokenSlug(order.token.address, 0));
        const orderName = OrderNameByType[order.order_type];
        const tokenMetadata = tokensMetadata[tokenSlug];
        const orderIcon = OrderIconByType[order.order_type];
        const assetLink = getAssetLinkByAddress(
          marketsArr,
          order.token.address
        );
        const isSell =
          order.order_type === OrderTypes.LIMIT_SELL ||
          order.order_type === OrderTypes.MARKET_SELL;
        const isClosed = Boolean(
          order.is_canceled ||
            order.is_expired ||
            order.is_fulfilled ||
            order.refundable_amount !== undefined
        );
        const refundableAmount =
          order.refundable_amount ??
          Math.max(order.unfulfilled_amount - order.refunded_amount, 0);
        const canRefund =
          refundableAmount > 0 && !order.is_refunded && isClosed;
        const orderStatus = order.is_refunded
          ? OrderStatusNames[OrderStatus.REFUNDED]
          : order.is_canceled
            ? OrderStatusNames[OrderStatus.CANCELED]
            : order.is_expired
              ? OrderStatusNames[OrderStatus.EXPIRED]
              : order.is_fulfilled
                ? OrderStatusNames[OrderStatus.FULFILLED]
                : OrderStatusNames[OrderStatus.ACTIVE];

        return {
          ...order,
          canRefund,
          fulfilledAmount: order.fulfilled_amount,
          orderName,
          orderStatus,
          originalAmount: order.rwa_token_amount,
          refundableAmount,
          refundedAmount: order.refunded_amount,
          remainingAmount: order.unfulfilled_amount,
          isSell,
          tokenMetadata,
          tokenSlug,
          orderIcon,
          assetLink,
        };
      })
    );
  }, [marketsArr, ordersData.data, refundableOrdersData.data, tokensMetadata]);

  useEffect(() => {
    if (ordersData.error) {
      const err = unknownToError(ordersData.error);
      warning("Error on get user orders data", err.message);
    }
  }, [ordersData.error, warning]);

  useEffect(() => {
    if (refundableOrdersData.error) {
      const err = unknownToError(refundableOrdersData.error);
      warning("Error on get refundable orders data", err.message);
    }
  }, [refundableOrdersData.error, warning]);

  return {
    openOrdersCount,
    loading:
      ordersData.isLoading ||
      ordersData.isFetching ||
      ordersData.isPending ||
      refundableOrdersData.isLoading ||
      refundableOrdersData.isFetching ||
      refundableOrdersData.isPending,
    openOrders,
    refetch: async () => {
      await Promise.all([ordersData.refetch(), refundableOrdersData.refetch()]);
    },
  };
}
