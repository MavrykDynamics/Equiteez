import { useEffect, useState } from "react";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { useQuery } from "@tanstack/react-query";
import { fetchUserOpenOrders } from "~/lib/apis/mbrwa/orders";
import type { OrderType } from "~/lib/apis/mbrwa/user/userOrders/orders.types";
import { toTokenSlug } from "~/lib/assets";
import {
  OrderIconByType,
  OrderNameByType,
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
    queryFn: () =>
      fetchUserOpenOrders(
        userAddress || "",
        offset,
        limit,
        orderType,
        searchTerm
      ),
  });

  useEffect(() => {
    if (!ordersData.data) return;

    const orders = ordersData.data.orders;
    const count = ordersData.data.total_count;

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

        return {
          ...order,
          orderName,
          isSell,
          tokenMetadata,
          tokenSlug,
          orderIcon,
          assetLink,
        };
      })
    );
  }, [ordersData.data, tokensMetadata]);

  useEffect(() => {
    if (ordersData.error) {
      const err = unknownToError(ordersData.error);
      warning("Error on get user orders data", err.message);
    }
  }, [ordersData.error]);

  return {
    openOrdersCount,
    loading:
      ordersData.isLoading || ordersData.isFetching || ordersData.isPending,
    openOrders,
    refetch: ordersData.refetch,
  };
}
