import { useQuery } from "@tanstack/react-query";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { fetchWalletOpenOrders } from "~/lib/apis/rwa/orders/orders";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { formatDate } from "~/lib/utils/date";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import { OpenOrdersConnectWalletState } from "./OpenOrdersConnectWalletState";
import { OpenOrdersEmptyState } from "./OpenOrdersEmptyState";
import { OpenOrdersLoadingState } from "./OpenOrdersLoadingState";
import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";

type OpenOrdersTabProps = {
  asset: AssetType;
};

function getOrderDetails(side: string) {
  const [orderType = "", orderSide = ""] = side.toLowerCase().split("_");
  const normalizedSide = orderSide || orderType;
  const normalizedType = orderSide ? orderType : "limit";

  return {
    side: normalizedSide
      ? `${normalizedSide[0].toUpperCase()}${normalizedSide.slice(1)}`
      : "NA",
    type: `${normalizedType[0].toUpperCase()}${normalizedType.slice(1)} Order`,
  };
}

function formatOrderDate(date: string) {
  return formatDate(date, true).replace(/^0/, "");
}

export function OpenOrdersTab({ asset }: OpenOrdersTabProps) {
  const { isAuthenticated } = useAuthContext();
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
        <colgroup>
          <col className={styles.assetColumn} />
          <col span={9} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">ASSET</th>
            <th scope="col">PAIR</th>
            <th scope="col">TYPE</th>
            <th scope="col">SIDE</th>
            <th scope="col">PRICE</th>
            <th scope="col">AMOUNT</th>
            <th scope="col">FILLED</th>
            <th scope="col">EXPIRES</th>
            <th scope="col">TOTAL</th>
            <th aria-label="Order actions" scope="col" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const orderDetails = getOrderDetails(order.side);
            const actionIcon = order.can_cancel ? "trash" : "refund";
            const actionLabel = order.can_cancel
              ? `Cancel ${asset.metadata.symbol} order`
              : `Request refund for ${asset.metadata.symbol} order`;

            return (
              <tr key={order.id} className={styles.tableRow}>
                <td data-label="Asset">
                  <RText size="body-sm">
                    {formatOrderDate(order.created_at)}
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
                <td data-label="Filled">
                  <RText size="body-sm">NA</RText>
                </td>
                <td data-label="Expires">
                  <RText size="body-sm">NA</RText>
                </td>
                <td data-label="Total">
                  <RText size="body-sm">
                    <Money fiat>{order.quote_token.total}</Money>{" "}
                    {order.currency.toUpperCase()}
                  </RText>
                </td>
                <td className={styles.actions} data-label="Actions">
                  <button
                    aria-label={actionLabel}
                    className={styles.actionsButton}
                    type="button"
                  >
                    <RIcon name={actionIcon} size="medium" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
