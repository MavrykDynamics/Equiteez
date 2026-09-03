import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { OrderHistoryItemType } from "~/lib/apis/rwa/orders/orders.types";
import { fetchWalletOrderHistory } from "~/lib/apis/rwa/orders/orders";
import Money from "~/lib/atoms/Money";
import { RButton } from "~/lib/atoms/RButton";
import { Spinner } from "~/lib/atoms/Spinner";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RPagination } from "~/lib/molecules/RPagination";
import {
  getNextSortState,
  TableHeader,
  type SortState,
} from "~/lib/molecules/RSortableTableHeader";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
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
import buyIcon from "./ROrderHistoryBuyIcon.svg";
import sellIcon from "./ROrderHistorySellIcon.svg";

const ORDER_HISTORY_PER_PAGE = 10;

type ServerSortKey = "amount" | "date" | "price";

type HeaderConfig = {
  label: string;
  sortKey?: ServerSortKey;
};

const headers: HeaderConfig[] = [
  { label: "DATE", sortKey: "date" },
  { label: "ASSET" },
  { label: "TYPE" },
  { label: "PRICE", sortKey: "price" },
  { label: "AMOUNT", sortKey: "amount" },
  { label: "STATUS" },
  { label: "TOTAL" },
];

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
  const canFetchOrders = isAuthenticated && Boolean(userAddress);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState<ServerSortKey>>({
    direction: "descending",
    key: "date",
  });

  const serverSort = useMemo(() => {
    if (!sort) return undefined;

    return `${sort.key}_${sort.direction === "descending" ? "desc" : "asc"}`;
  }, [sort]);

  const ordersHistoryQuery = useQuery({
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

  const handleSort = (key: ServerSortKey) => {
    setSort((currentSort) => getNextSortState(currentSort, key));
    setPage(1);
  };

  const { total = 0, total_pages: totalPages = 0 } =
    ordersHistoryQuery.data ?? {};

  return (
    <div className={styles.content}>
      <div className={styles.viewport}>
        {ordersHistoryQuery.isFetching ? (
          <div
            className={styles.loadingOverlay}
            role="status"
            aria-live="polite"
          >
            <Spinner size={32} />
          </div>
        ) : null}
        <div className={styles.table} role="table">
          <div className={styles.headerRow} role="row">
            {headers.map((header) => (
              <div
                className={styles.headerCell}
                key={header.label}
                role="columnheader"
              >
                <TableHeader
                  direction={
                    sort?.key === header.sortKey ? sort?.direction : undefined
                  }
                  label={header.label}
                  onSort={
                    header.sortKey
                      ? () => handleSort(header.sortKey as ServerSortKey)
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
          <div role="rowgroup">
            {orders.map((order) => (
              <OrderHistoryTableRow
                assetSymbol={asset.metadata.symbol}
                key={order.id}
                order={order}
              />
            ))}
          </div>
        </div>
      </div>
      {total && totalPages > 0 ? (
        <div className={styles.paginationFooter}>
          <RPagination
            ariaLabel="Order history pagination"
            currentPage={page}
            isLoading={ordersHistoryQuery.isFetching}
            onPageChange={setPage}
            totalPages={totalPages}
          />
        </div>
      ) : null}
    </div>
  );
}
