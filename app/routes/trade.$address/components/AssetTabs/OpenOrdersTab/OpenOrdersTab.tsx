import { useQuery } from "@tanstack/react-query";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { fetchWalletOpenOrders } from "~/lib/apis/rwa/orders/orders";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import { formatDate } from "~/lib/utils/date";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import { OpenOrdersConnectWalletState } from "./OpenOrdersConnectWalletState";
import { OpenOrdersEmptyState } from "./OpenOrdersEmptyState";
import { OpenOrdersLoadingState } from "./OpenOrdersLoadingState";
import styles from "./styles.module.css";

type OpenOrdersTabProps = {
  asset: AssetType;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(value);
}

function formatPrice(value: number, currency: string) {
  const formattedValue = formatNumber(value);

  return currency.toUpperCase() === "USD"
    ? `$${formattedValue}`
    : `${formattedValue} ${currency.toUpperCase()}`;
}

export function OpenOrdersTab({ asset }: OpenOrdersTabProps) {
  const { isAuthenticated, isAuthLoading } = useAuthContext();
  const { userAddress } = useUserContext();
  const canFetchOrders = isAuthenticated && Boolean(userAddress);

  const openOrdersQuery = useQuery({
    queryKey: ["fetchWalletOpenOrders", userAddress, asset.address],
    queryFn: () =>
      fetchWalletOpenOrders({
        walletAddress: userAddress ?? "",
        tokenAddress: asset.address,
      }),
    enabled: canFetchOrders,
    retry: false,
  });

  if (openOrdersQuery.isLoading) {
    return <OpenOrdersLoadingState />;
  }

  if (!canFetchOrders) {
    return <OpenOrdersConnectWalletState />;
  }

  if (openOrdersQuery.isError) {
    return (
      <section className={styles.state} aria-live="polite">
        <RText size="body-m" weight="medium">
          Unable to load open orders
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
            void openOrdersQuery.refetch();
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

  const orders = openOrdersQuery.data?.items ?? [];

  if (!orders.length) {
    return <OpenOrdersEmptyState />;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Side</th>
            <th scope="col">Price / token</th>
            <th scope="col">Amount</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td data-label="Date">{formatDate(order.created_at, true)}</td>
              <td data-label="Side">
                <span
                  className={
                    order.side.toLowerCase() === "buy"
                      ? styles.buySide
                      : styles.sellSide
                  }
                >
                  {order.side}
                </span>
              </td>
              <td data-label="Price / token">
                {formatPrice(order.price_per_token, order.currency)}
              </td>
              <td data-label="Amount">
                {formatNumber(order.amount)} {asset.metadata.symbol}
              </td>
              <td data-label="Total">
                {formatPrice(order.total, order.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
