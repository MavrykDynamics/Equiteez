import { useQuery } from "@tanstack/react-query";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { fetchWalletOpenOrders } from "~/lib/apis/rwa/orders/orders";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import { OpenOrdersConnectWalletState } from "./OpenOrdersConnectWalletState";
import { OpenOrdersEmptyState } from "./OpenOrdersEmptyState";
import { OpenOrdersLoadingState } from "./OpenOrdersLoadingState";
import { OrderItem } from "./OrderItem";
import styles from "./styles.module.css";

type OpenOrdersTabProps = {
  asset: AssetType;
};

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
    refetchInterval: 7000,
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
          {orders.map((order) => (
            <OrderItem
              key={order.id}
              assetSymbol={asset.metadata.symbol}
              onAfterAction={openOrdersQuery.refetch}
              order={order}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
