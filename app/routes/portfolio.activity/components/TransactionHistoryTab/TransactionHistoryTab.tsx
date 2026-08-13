import { useQuery } from "@tanstack/react-query";

import { fetchWalletOrderHistory } from "~/lib/apis/rwa/orders/orders";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import { TransactionHistoryTableRow } from "./TransactionHistoryTableRow";
import styles from "./styles.module.css";

export function TransactionHistoryTab() {
  const { assets } = useAssetsContext();
  const { userAddress } = useUserContext();
  const transactionHistoryQuery = useQuery({
    queryKey: ["fetchWalletOrderHistory", userAddress],
    queryFn: () =>
      fetchWalletOrderHistory({ walletAddress: userAddress ?? "" }),
    enabled: Boolean(userAddress),
    retry: false,
  });

  if (transactionHistoryQuery.isLoading) {
    return (
      <div className={styles.state} aria-live="polite">
        <RText color="neutral-600" size="body-sm">
          Loading transaction history...
        </RText>
      </div>
    );
  }

  if (transactionHistoryQuery.isError) {
    return (
      <div className={styles.state} aria-live="polite">
        <RText color="neutral-600" size="body-sm">
          Unable to load transaction history.
        </RText>
      </div>
    );
  }

  const transactions = transactionHistoryQuery.data?.items ?? [];

  if (!transactions.length) {
    return (
      <div className={styles.state}>
        <RText color="neutral-600" size="body-sm">
          No transaction history.
        </RText>
      </div>
    );
  }

  const assetsByAddress = new Map(
    assets.map((asset) => [asset.address, asset])
  );

  return (
    <div className={styles.viewport}>
      <div className={styles.table} role="table">
        <div className={styles.headerRow} role="row">
          {[
            "DATE",
            "ASSET",
            "TYPE",
            "AMOUNT",
            "INTERACTION",
            "TX HASH",
            "STATUS",
          ].map((label) => (
            <div className={styles.headerCell} key={label} role="columnheader">
              <RText color="neutral-600" size="body-xs" weight="medium">
                {label}
              </RText>
            </div>
          ))}
        </div>

        <div role="rowgroup">
          {transactions.map((transaction) => (
            <TransactionHistoryTableRow
              asset={assetsByAddress.get(transaction.token_address)}
              key={transaction.id}
              transaction={transaction}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
