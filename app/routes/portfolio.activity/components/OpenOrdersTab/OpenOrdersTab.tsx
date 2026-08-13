import { useQuery } from "@tanstack/react-query";

import { fetchWalletOpenOrders } from "~/lib/apis/rwa/orders/orders";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import { OpenOrdersTableRow } from "./OpenOrdersTableRow";
import styles from "./styles.module.css";

export function OpenOrdersTab() {
  const { assets } = useAssetsContext();
  const { userAddress } = useUserContext();
  const openOrdersQuery = useQuery({
    queryKey: ["fetchWalletOpenOrders", userAddress],
    queryFn: () => fetchWalletOpenOrders({ walletAddress: userAddress ?? "" }),
    enabled: Boolean(userAddress),
    refetchInterval: 7000,
    retry: false,
  });

  if (openOrdersQuery.isLoading) {
    return (
      <div className={styles.state} aria-live="polite">
        <RText color="neutral-600" size="body-sm">
          Loading open orders...
        </RText>
      </div>
    );
  }

  if (openOrdersQuery.isError) {
    return (
      <div className={styles.state} aria-live="polite">
        <RText color="neutral-600" size="body-sm">
          Unable to load open orders.
        </RText>
      </div>
    );
  }

  const orders = openOrdersQuery.data?.items ?? [];

  if (!orders.length) {
    return (
      <div className={styles.state}>
        <RText color="neutral-600" size="body-sm">
          No open orders.
        </RText>
      </div>
    );
  }

  const assetSymbolsByAddress = new Map(
    assets.map((asset) => [asset.address, asset.metadata.symbol])
  );

  return (
    <div className={styles.viewport}>
      <div className={styles.table} role="table">
        <div className={styles.headerRow} role="row">
          <div className={styles.headerCell} role="columnheader">
            <RText color="neutral-600" size="body-xs" weight="medium">
              DATE
            </RText>
          </div>
          <div className={styles.headerCell} role="columnheader">
            <RText color="neutral-600" size="body-xs" weight="medium">
              PAIR
            </RText>
          </div>
          <div className={styles.headerCell} role="columnheader">
            <RText color="neutral-600" size="body-xs" weight="medium">
              TYPE
            </RText>
          </div>
          <div className={styles.headerCell} role="columnheader">
            <RText color="neutral-600" size="body-xs" weight="medium">
              PRICE
            </RText>
          </div>
          <div className={styles.headerCell} role="columnheader">
            <RText color="neutral-600" size="body-xs" weight="medium">
              AMOUNT
            </RText>
          </div>
          <div className={styles.headerCell} role="columnheader">
            <RText color="neutral-600" size="body-xs" weight="medium">
              FILLED
            </RText>
          </div>
          <div className={styles.headerCell} role="columnheader">
            <RText color="neutral-600" size="body-xs" weight="medium">
              EXPIRES
            </RText>
          </div>
          <div className={styles.headerCell} role="columnheader">
            <RText color="neutral-600" size="body-xs" weight="medium">
              TOTAL
            </RText>
          </div>
          <div aria-label="Order actions" className={styles.headerCell} role="columnheader" />
        </div>

        <div role="rowgroup">
          {orders.map((order) => (
            <OpenOrdersTableRow
              assetSymbol={assetSymbolsByAddress.get(order.token_address) ?? order.currency}
              key={order.id}
              order={order}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
