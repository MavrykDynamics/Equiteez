import { useCallback, useEffect, useState } from "react";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import {
  FreshnessSource,
  useFreshQuery,
  useFreshQueryInvalidation,
} from "~/lib/apis/rwa/freshness";
import {
  fetchPrimaryPurchaseHistory,
  PRIMARY_HISTORY_QUERY_KEY,
} from "~/lib/apis/primaryPurchases/primaryPurchases";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import {
  NotifierChannel,
  NotifierWalletEvent,
} from "~/providers/NotificationsProvider/notifications.const";
import { useNotifierEvent } from "~/providers/NotificationsProvider/hooks/useNotifierEvent";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RButton } from "~/lib/atoms/RButton";
import { OpenOrdersConnectWalletState } from "../OpenOrdersTab/OpenOrdersConnectWalletState";
import Money from "~/lib/atoms/Money";
import {
  getNextSortState,
  type SortState,
} from "~/lib/molecules/RSortableTableHeader";
import { RAssetHistoryTable, type HistorySortKey } from "../RAssetHistoryTable";
import { OpenOrdersEmptyState } from "../OpenOrdersTab/OpenOrdersEmptyState";
import {
  formatOrderDate,
  renderNullableFiatValue,
} from "../OpenOrdersTab/OrderItem";
import styles from "../OrderHistoryTab/styles.module.css";

export function RPurchaseHistoryTab({ asset }: { asset: AssetType }) {
  const { isAuthenticated } = useAuthContext();
  const { userAddress } = useUserContext();
  const invalidateFreshQueries = useFreshQueryInvalidation();
  const canFetch = isAuthenticated && Boolean(userAddress);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState<HistorySortKey>>({
    key: "date",
    direction: "descending",
  });
  const serverSort = sort
    ? `${sort.key}_${sort.direction === "descending" ? "desc" : "asc"}`
    : "date_desc";
  useEffect(() => setPage(1), [userAddress, asset.address]);
  // Share transfer freshness marks with purchase confirmation, including while unmounted.
  const query = useFreshQuery({
    queryKey: [
      "fetchWalletTransferHistory",
      PRIMARY_HISTORY_QUERY_KEY,
      userAddress,
      asset.address,
      page,
      serverSort,
    ],
    queryFn: () =>
      fetchPrimaryPurchaseHistory({
        walletAddress: userAddress ?? "",
        tokenAddress: asset.address,
        page,
        perPage: 10,
        sort: serverSort,
      }),
    enabled: canFetch,
    retry: false,
  });
  useEffect(() => {
    const totalPages = query.data?.total_pages;
    if (totalPages !== undefined && page > Math.max(1, totalPages)) {
      setPage(Math.max(1, totalPages));
    }
  }, [page, query.data?.total_pages]);
  const handlePurchase = useCallback(
    (_frame: unknown, wallet: string) => {
      if (wallet === userAddress) {
        void invalidateFreshQueries("fetchWalletTransferHistory", {
          source: FreshnessSource.Chain,
        });
      }
    },
    [invalidateFreshQueries, userAddress]
  );
  useNotifierEvent(
    NotifierChannel.Wallet,
    NotifierWalletEvent.LaunchpadPurchase,
    handlePurchase
  );

  if (!canFetch)
    return (
      <OpenOrdersConnectWalletState
        title="No Purchase History"
        description="Connect your wallet to view your past purchases."
      />
    );
  if (query.isLoading && !query.data)
    return (
      <section className={styles.state} aria-live="polite">
        <RText color="neutral-600" size="body-sm">
          Loading purchase history...
        </RText>
      </section>
    );
  if (query.isError)
    return (
      <section className={styles.state} aria-live="polite">
        <RText size="body-m" weight="medium">
          Unable to load purchase history
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
            void query.refetch();
          }}
          size="small"
          tone="black"
          variant="secondary"
        >
          Try again
        </RButton>
      </section>
    );
  const items = query.data?.items ?? [];
  if (!items.length) {
    return (
      <OpenOrdersEmptyState
        title="No Purchase History"
        description="Incoming asset transactions will appear here."
      />
    );
  }
  return (
    <>
      {query.data?.truncated ? (
        <RText color="neutral-600" size="body-sm">
          Older transactions may not be included.
        </RText>
      ) : null}
      <RAssetHistoryTable
        sort={sort}
        onSort={(key) => {
          setSort((current) => getNextSortState(current, key));
          setPage(1);
        }}
        isFetching={query.isFetching}
        page={page}
        onPageChange={setPage}
        totalPages={query.data?.total_pages ?? 0}
        paginationLabel="Purchase history pagination"
      >
        {items.map((item) => {
          const [date, time = ""] = formatOrderDate(item.datetime).split(", ");
          return (
            <div className={styles.row} role="row" key={item.id}>
              <div className={styles.cell} role="cell">
                <div className={styles.date}>
                  <RText size="body-sm">{date}</RText>
                  <RText color="neutral-700" size="body-s">
                    {time}
                  </RText>
                </div>
              </div>
              <div className={styles.cell} role="cell">
                <RText size="body-sm">{asset.metadata.symbol}</RText>
              </div>
              <div className={styles.cell} role="cell">
                <RText className={styles.buy} size="body-sm">
                  + Deposit
                </RText>
              </div>
              <div className={styles.cell} role="cell">
                <RText size="body-sm">
                  {renderNullableFiatValue(
                    item.price_per_token,
                    item.currency.toUpperCase()
                  )}
                </RText>
              </div>
              <div className={styles.cell} role="cell">
                <RText size="body-sm">
                  <Money tooltip={false}>{item.amount}</Money>
                </RText>
              </div>
              <div className={styles.cell} role="cell">
                <RText size="body-sm">—</RText>
              </div>
              <div className={styles.cell} role="cell">
                <RText size="body-sm">
                  {renderNullableFiatValue(
                    item.total,
                    item.currency.toUpperCase()
                  )}
                </RText>
              </div>
            </div>
          );
        })}
      </RAssetHistoryTable>
    </>
  );
}
