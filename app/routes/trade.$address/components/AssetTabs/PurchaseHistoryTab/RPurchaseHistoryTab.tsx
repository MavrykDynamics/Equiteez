import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MavrykToolkit } from "@mavrykdynamics/taquito";
import { BigNumber } from "bignumber.js";
import { getPrimaryDeployment } from "~/contracts/primaryPurchase.config";
import { basenetNetRpcnode } from "~/consts/rpcNodes";
import { USDT_BRIDGE } from "~/consts/usdtBridge";
import { MavrykChainId } from "~/lib/mavryk/types";
import { fetchGetOperationsByHash } from "~/lib/apis/tzkt";
import {
  fetchPrimaryPurchaseHistory,
  PRIMARY_HISTORY_QUERY_KEY,
} from "~/lib/apis/primaryPurchases/primaryPurchases";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import {
  NotifierChannel,
  NotifierWalletEvent,
} from "~/providers/NotificationsProvider/notifications.const";
import { useNotifierEvent } from "~/providers/NotificationsProvider/hooks/useNotifierEvent";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RButton } from "~/lib/atoms/RButton";
import Money from "~/lib/atoms/Money";
import {
  getNextSortState,
  type SortState,
} from "~/lib/molecules/RSortableTableHeader";
import { OpenOrdersConnectWalletState } from "../OpenOrdersTab/OpenOrdersConnectWalletState";
import { OpenOrdersEmptyState } from "../OpenOrdersTab/OpenOrdersEmptyState";
import { formatOrderDate } from "../OpenOrdersTab/OrderItem";
import { ROrderStatusBadge } from "../OrderHistoryTab/ROrderStatusBadge";
import { RAssetHistoryTable, type HistorySortKey } from "../RAssetHistoryTable";
import styles from "../OrderHistoryTab/styles.module.css";

const PER_PAGE = 10;

export function RPurchaseHistoryTab({ asset }: { asset: AssetType }) {
  const { isAuthenticated } = useAuthContext();
  const { userAddress } = useUserContext();
  const { dapp } = useWalletContext();
  const tezos = useMemo(
    () => dapp?.tezos() ?? new MavrykToolkit(basenetNetRpcnode),
    [dapp]
  );
  const queryClient = useQueryClient();
  const canFetch = isAuthenticated && Boolean(userAddress);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState<HistorySortKey>>({
    key: "date",
    direction: "descending",
  });
  const query = useQuery({
    queryKey: [
      PRIMARY_HISTORY_QUERY_KEY,
      tezos.rpc.getRpcUrl(),
      userAddress,
      asset.address,
    ],
    enabled: canFetch,
    retry: false,
    refetchInterval: 15_000,
    queryFn: async () => {
      const { launchpad } = getPrimaryDeployment(tezos);
      if (asset.metadata.decimals !== 6)
        throw new Error("Unsupported primary asset decimals.");
      try {
        return await fetchPrimaryPurchaseHistory({
          chainId: MavrykChainId.Basenet,
          wallet: userAddress!,
          assetAddress: asset.address,
          launchpad,
          paymentAddress: USDT_BRIDGE.destinationToken.address,
          paymentTokenId: USDT_BRIDGE.destinationToken.id,
          loadOperation: (hash) =>
            queryClient.fetchQuery({
              queryKey: [
                "primary-purchase-operation",
                MavrykChainId.Basenet,
                hash,
              ],
              queryFn: () =>
                fetchGetOperationsByHash(MavrykChainId.Basenet, hash),
              staleTime: Infinity,
            }),
        });
      } catch (error) {
        // A partially indexed operation must be fetched again on retry.
        await queryClient.invalidateQueries({
          queryKey: ["primary-purchase-operation", MavrykChainId.Basenet],
          refetchType: "none",
        });
        throw error;
      }
    },
  });
  const { refetch } = query;
  const handlePurchase = useCallback(
    (_frame: unknown, wallet: string) => {
      if (wallet === userAddress) void refetch();
    },
    [refetch, userAddress]
  );
  useNotifierEvent(
    NotifierChannel.Wallet,
    NotifierWalletEvent.LaunchpadPurchase,
    handlePurchase
  );

  const sortedItems = useMemo(
    () =>
      [...(query.data ?? [])].sort((a, b) => {
        const key = sort?.key ?? "date";
        const comparison =
          key === "date"
            ? a.datetime.localeCompare(b.datetime)
            : (new BigNumber(a[key]).comparedTo(b[key]) ?? 0);
        const direction = sort?.direction === "ascending" ? 1 : -1;
        return direction * (comparison || a.id - b.id);
      }),
    [query.data, sort]
  );
  const totalPages = Math.ceil(sortedItems.length / PER_PAGE);
  const currentPage = Math.min(page, Math.max(1, totalPages));

  if (!canFetch)
    return (
      <OpenOrdersConnectWalletState
        title="No Purchase History"
        description="Connect your wallet to view your past purchases."
      />
    );
  if (query.isPending)
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
  if (!sortedItems.length)
    return (
      <OpenOrdersEmptyState
        title="No Purchase History"
        description="Your purchases for this asset will appear here."
      />
    );

  return (
    <RAssetHistoryTable
      sort={sort}
      onSort={(key) => {
        setSort((current) => getNextSortState(current, key));
        setPage(1);
      }}
      isFetching={query.isFetching}
      page={currentPage}
      onPageChange={setPage}
      totalPages={totalPages}
      paginationLabel="Purchase history pagination"
    >
      {sortedItems
        .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
        .map((item) => {
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
                <span className={styles.buy}>
                  +
                  <RText className={styles.typeLabel} size="body-sm">
                    Purchase
                  </RText>
                </span>
              </div>
              <div className={styles.cell} role="cell">
                <RText size="body-sm">
                  <Money>{item.price}</Money> wUSDT
                </RText>
              </div>
              <div className={styles.cell} role="cell">
                <RText size="body-sm">
                  <Money tooltip={false}>{item.amount}</Money>
                </RText>
              </div>
              <div className={styles.cell} role="cell">
                <ROrderStatusBadge status="confirmed" />
              </div>
              <div className={styles.cell} role="cell">
                <RText size="body-sm">
                  <Money>{item.total}</Money> wUSDT
                </RText>
              </div>
            </div>
          );
        })}
    </RAssetHistoryTable>
  );
}
