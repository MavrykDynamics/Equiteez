import { useQuery } from "@tanstack/react-query";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { fetchWalletOrderHistory } from "~/lib/apis/rwa/orders/orders";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import { OpenOrdersConnectWalletState } from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OpenOrdersConnectWalletState";
import { OpenOrdersEmptyState } from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OpenOrdersEmptyState";
import { OpenOrdersLoadingState } from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OpenOrdersLoadingState";

import { ROrderStatusBadge } from "./ROrderStatusBadge";
import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";
import {
  formatOrderDate,
  getOrderDetails,
} from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OpenOrdersTab";

type OrdersHistoryTabProps = {
  asset: AssetType;
};

export function OrderHistoryTab({ asset }: OrdersHistoryTabProps) {
  const { isAuthenticated } = useAuthContext();
  const { userAddress } = useUserContext();
  const canFetchOrders = isAuthenticated && Boolean(userAddress);

  const ordersHistoryQuery = useQuery({
    queryKey: ["fetchWalletOrdersHistory", userAddress, asset.address],
    queryFn: () =>
      fetchWalletOrderHistory({
        walletAddress: userAddress ?? "",
        tokenAddress: asset.address,
      }),
    enabled: canFetchOrders,
    retry: false,
  });

  if (ordersHistoryQuery.isLoading) {
    return <OpenOrdersLoadingState />;
  }

  if (!canFetchOrders) {
    return (
      <OpenOrdersConnectWalletState
        title="No Order History"
        description="Connect your wallet to view your past orders."
      />
    );
  }

  if (ordersHistoryQuery.isError) {
    return (
      <section className={styles.state} aria-live="polite">
        <RText size="body-m" weight="medium">
          Unable to load orders history
        </RText>
        <RText
          className={styles.stateDescription}
          color="neutral-600"
          size="body-sm"
        >
          Please try again in a moment.
        </RText>
        <RButton
          onClick={() => {
            void ordersHistoryQuery.refetch();
          }}
          size="small"
          tone="black"
          variant="secondary"
        >
          Try again
        </RButton>
      </section>
    );
  }

  const orders = ordersHistoryQuery.data?.items ?? [];

  if (!orders.length) {
    return (
      <OpenOrdersEmptyState
        title="No Orders History"
        description="Your buy and sell orders for this asset will appear here."
      />
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <colgroup>
          <col className={styles.assetColumn} />
          <col span={7} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">ASSET</th>
            <th scope="col">PAIR</th>
            <th scope="col">TYPE</th>
            <th scope="col">SIDE</th>
            <th scope="col">PRICE</th>
            <th scope="col">AMOUNT</th>
            <th scope="col">STATUS</th>
            <th scope="col">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const orderDetails = getOrderDetails(order.type);

            return (
              <tr key={order.id} className={styles.tableRow}>
                <td data-label="Asset">
                  <RText size="body-sm">
                    {formatOrderDate(order.datetime)}
                  </RText>
                </td>
                <td data-label="Pair">
                  <RText size="body-sm">{asset.metadata.symbol}/USDT</RText>
                </td>
                <td data-label="Type">
                  <RText size="body-sm">{orderDetails.type}</RText>
                </td>
                <td data-label="Side">
                  <RText
                    size="body-sm"
                    className={
                      orderDetails.side.toLowerCase() === "buy"
                        ? styles.buySide
                        : styles.sellSide
                    }
                  >
                    {orderDetails.side}
                  </RText>
                </td>
                <td data-label="Price">
                  <RText size="body-sm">
                    <Money fiat>{order.quote_token.price_per_token}</Money>
                  </RText>
                </td>
                <td data-label="Amount">
                  <RText size="body-sm">
                    <Money fiat>{order.amount}</Money>
                  </RText>
                </td>
                <td data-label="Status">
                  <ROrderStatusBadge status={order.status} />
                </td>
                <td data-label="Total">
                  <RText size="body-sm">
                    <Money fiat>{order.quote_token.total}</Money> USDT
                  </RText>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
