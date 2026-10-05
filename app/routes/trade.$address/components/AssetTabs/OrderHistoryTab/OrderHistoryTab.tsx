import { RAssetHistoryTable, type HistorySortKey } from "../RAssetHistoryTable";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { OrderHistoryItemType } from "~/lib/apis/rwa/orders/orders.types";
import { fetchWalletOrderHistory } from "~/lib/apis/rwa/orders/orders";
import {
  FreshnessSource,
  useFreshQuery,
  useFreshQueryInvalidation,
} from "~/lib/apis/rwa/freshness";
import Money from "~/lib/atoms/Money";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  getNextSortState,
  type SortState,
} from "~/lib/molecules/RSortableTableHeader";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import {
  NotifierChannel,
  NotifierWalletEvent,
} from "~/providers/NotificationsProvider/notifications.const";
import { useNotifierEvent } from "~/providers/NotificationsProvider/hooks/useNotifierEvent";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import {
  formatOrderDate,
  getOrderDetails,
  renderNullableFiatValue,
} from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OrderItem";
import { OpenOrdersConnectWalletState } from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OpenOrdersConnectWalletState";
import { OpenOrdersEmptyState } from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OpenOrdersEmptyState";

import { ROrderStatusBadge } from "./ROrderStatusBadge";
import styles from "./styles.module.css";

const ORDER_HISTORY_PER_PAGE = 10;

type OrderHistoryTabProps = {
  asset: AssetType;
};

type OrderHistoryTableRowProps = {
  assetSymbol: string;
  order: OrderHistoryItemType;
};

function OrderHistoryTableRow({
  assetSymbol,
  order,
}: OrderHistoryTableRowProps) {
  const [date, time = ""] = formatOrderDate(order.datetime).split(", ");
  const orderDetails = getOrderDetails(order.type);
  const isBuy = orderDetails.side.toLowerCase() === "buy";

  return (
    <div className={styles.row} role="row">
      <div className={styles.cell} role="cell">
        <div className={styles.date}>
          <RText size="body-sm">{date}</RText>
          <RText color="neutral-700" size="body-s">
            {time}
          </RText>
        </div>
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">{assetSymbol}</RText>
      </div>
      <div className={styles.cell} role="cell">
        <span className={isBuy ? styles.buy : styles.sell}>
          {isBuy ? "+" : "-"}
          <RText className={styles.typeLabel} size="body-sm">
            {orderDetails.type.replace(" Order", "")} {orderDetails.side}
          </RText>
        </span>
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">
          ${renderNullableFiatValue(order.price_per_token)}
        </RText>
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">
          <Money tooltip={false}>{order.amount}</Money>
        </RText>
      </div>
      <div className={styles.cell} role="cell">
        <ROrderStatusBadge status={order.status} />
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">
          {renderNullableFiatValue(order.quote_token.total, "USDT")}
        </RText>
      </div>
    </div>
  );
}

export function OrderHistoryTab({ asset }: OrderHistoryTabProps) {
  const { isAuthenticated } = useAuthContext();
  const { userAddress } = useUserContext();
  const invalidateFreshQueries = useFreshQueryInvalidation();
  const canFetchOrders = isAuthenticated && Boolean(userAddress);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState<HistorySortKey>>({
    direction: "descending",
    key: "date",
  });

  const serverSort = useMemo(() => {
    if (!sort) return undefined;

    return `${sort.key}_${sort.direction === "descending" ? "desc" : "asc"}`;
  }, [sort]);

  const ordersHistoryQuery = useFreshQuery({
    queryKey: [
      "fetchWalletOrderHistory",
      userAddress,
      asset.address,
      page,
      serverSort,
    ],
    queryFn: () =>
      fetchWalletOrderHistory({
        page,
        perPage: ORDER_HISTORY_PER_PAGE,
        sort: serverSort,
        tokenAddress: asset.address,
        walletAddress: userAddress ?? "",
      }),
    enabled: canFetchOrders,
    placeholderData: (previousData) => previousData,
    retry: false,
  });

  const handleOrderbookOrderUpdated = useCallback(() => {
    void invalidateFreshQueries("fetchWalletOrderHistory", {
      source: FreshnessSource.Orderbook,
    });
  }, [invalidateFreshQueries]);

  useNotifierEvent(
    NotifierChannel.Wallet,
    NotifierWalletEvent.OrderbookOrderUpdated,
    handleOrderbookOrderUpdated
  );

  useEffect(() => {
    const totalPages = ordersHistoryQuery.data?.total_pages ?? 0;

    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [ordersHistoryQuery.data?.total_pages, page]);

  if (!canFetchOrders) {
    return (
      <OpenOrdersConnectWalletState
        title="No Order History"
        description="Connect your wallet to view your past orders."
      />
    );
  }

  if (ordersHistoryQuery.isLoading && !ordersHistoryQuery.data) {
    return (
      <section className={styles.state} aria-live="polite">
        <RText color="neutral-600" size="body-sm">
          Loading order history...
        </RText>
      </section>
    );
  }

  if (ordersHistoryQuery.isError) {
    return (
      <section className={styles.state} aria-live="polite">
        <RText size="body-m" weight="medium">
          Unable to load order history
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

  const handleSort = (key: HistorySortKey) => {
    setSort((currentSort) => getNextSortState(currentSort, key));
    setPage(1);
  };

  const { total = 0, total_pages: totalPages = 0 } =
    ordersHistoryQuery.data ?? {};

  return (
    <RAssetHistoryTable
      sort={sort}
      onSort={handleSort}
      isFetching={ordersHistoryQuery.isFetching}
      page={page}
      onPageChange={setPage}
      totalPages={total ? totalPages : 0}
      paginationLabel="Order history pagination"
    >
      {orders.map((order) => (
        <OrderHistoryTableRow
          assetSymbol={asset.metadata.symbol}
          key={order.id}
          order={order}
        />
      ))}
    </RAssetHistoryTable>
  );
}
