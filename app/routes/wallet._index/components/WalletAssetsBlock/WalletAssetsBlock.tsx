import styles from "./walletAssetsBlock.module.css";

import { WalletCard } from "./shared/WalletCard";
import { WalletPieChart } from "./WalletPieChart";
import { ROUTES } from "~/consts/routes";
import React, { useCallback } from "react";
import { Text } from "~/lib/atoms/Typography/Text";
import mbgToken from "app/assets/wallet/mbgToken.png";
import mvrkToken from "app/assets/wallet/mvrkToken.png";
import Money from "~/lib/atoms/Money";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import {
  NOT_RWA_ASSETS,
  useUserAssetsContext,
} from "~/providers/UserAssets/userAssets.provider";
import { AssetIcon } from "~/templates/AssetIcon";
import { Spinner } from "~/lib/atoms/Spinner";
import { useOrders } from "~/lib/userOrders/useOrders";
import { WalletOrderItemSecondary } from "~/routes/wallet.orders/components/OrderItem/OrderItemSecondary";
import { ButtonV2 } from "~/lib/atoms/ButtonV2/ButtonV2";
import { useTransactions } from "~/lib/userTransactions/useTransactions";
import { WalletTransactionItem } from "~/routes/wallet.transactions/components/TransactionItem/WalletTransactionItem";
import { Link } from "@remix-run/react";
import { TRADE_MULTIBANK_LINK } from "~/consts/links.const";
import { EmptyState } from "~/routes/wallet/components/EmptyState/EmptyState";
import classNames from "clsx";
import { getAssetLinkByAddress } from "~/routes/wallet.assets/components/AssetItem/AssetActions";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import {Button} from "~/lib/atoms/Button";

const ITEMS_TO_SHOW = 4;

export const WalletAssetsBlock = ({
  mbgBalance,
  mvrkBalance,
}: {
  mbgBalance: number;
  mvrkBalance: number;
}) => {
  const { marketsArr } = useMarketsContext();
  const { userAddress } = useUserContext();

  const { transactions, loading: isLoadingTransactions } = useTransactions(
    0,
    ITEMS_TO_SHOW,
    userAddress,
    "",
    null
  );

  const {
    openOrders,
    loading: isLoadingOrders,
    refetch,
  } = useOrders(0, ITEMS_TO_SHOW, userAddress, "", null);

  const handleAfterCancelOrder = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const { userAssets, loading: isLoadingAssets } = useUserAssetsContext();

  const filteredAssets = userAssets
    .filter(
      (item) =>
        !NOT_RWA_ASSETS.some(
          (not_rwa_asset) => not_rwa_asset === item.token.address
        )
    )
    .slice(0, ITEMS_TO_SHOW);

  return (
    <section className="flex flex-col gap-[16px] lg:gap-[24px]">
      <div className="flex flex-col md:flex-row gap-[16px] lg:gap-[24px] w-full">
        <div className="flex-1">
          <WalletCard
            header="My Assets"
            linkText="View All"
            link={ROUTES.walletAssets}
          >
            {isLoadingAssets ? (
              <div className="w-full h-full py-[19px] lg:min-w-[561px] lg:min-h-[250px] flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="flex gap-[16px] lg:gap-[24px] lg:py-[19px] lg:min-w-[561px] md:min-h-[184px] lg:min-h-[250px]">
                <div className="hidden lg:block">
                  <WalletPieChart userAssets={filteredAssets} />
                </div>
                <div className={styles.divider} />
                <div className="flex flex-col gap-[24px] min-w-full lg:min-w-[296px]">
                  <Text weight="semibold" className="hidden lg:block">
                    Largest Investments
                  </Text>
                  <div className="flex flex-col gap-[12px]">
                    {filteredAssets.length ? (
                      filteredAssets
                        .slice(0, ITEMS_TO_SHOW)
                        .map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-[8px]">
                              <AssetIcon
                                key={item.tokenSlug}
                                size={32}
                                assetSlug={item.tokenSlug}
                                className="w-[32px] h-[32px] rounded overflow-hidden"
                              />
                              <Link
                                to={getAssetLinkByAddress(
                                  marketsArr,
                                  item.token.address
                                )}
                              >
                                <Text
                                  size="smallBody"
                                  weight="bold"
                                  className={classNames(
                                    styles.assetItemText,
                                    "max-w-[110px] truncate"
                                  )}
                                >
                                  {item.token.name}
                                </Text>
                              </Link>
                            </div>
                            <Text size="smallBody" weight="bold">
                              $<Money fiat>{item.available_balance_usd}</Money>
                            </Text>
                          </div>
                        ))
                    ) : (
                      <EmptyState
                        height="167px"
                        title="No assets yet"
                        description="Go to the marketplace to buy your first asset."
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </WalletCard>
        </div>

        <div className="flex-1 lg:w-[368px] lg:min-w-[368px]">
          <WalletCard header="My Token Holdings" linkText="" link="">
            <div className="flex justify-center lg:py-[21px] gap-[16px]">
              <div className="flex flex-col gap-[16px] gap-[8px] lg:gap-[24px] w-full lg:w-[147px] items-center">
                <div className={styles.mvrkTokenImgWrapper}>
                  <img
                    src={mvrkToken}
                    alt="mvrkToken"
                    className={styles.tokenImg}
                  />
                </div>

                <div className=" w-full items-center flex flex-col gap-[12px]">
                  <div className="flex flex-col items-center justify-center gap-[4px]">
                    <Text size="tinyBody" color="lightSand">
                      $MVRK Balance
                    </Text>
                    <Text weight="semibold">
                      $<Money fiat>{mvrkBalance}</Money>
                    </Text>
                  </div>
                  <Link
                    rel="noreferrer"
                    target="_blank"
                    className="w-full flex justify-center"
                    to={TRADE_MULTIBANK_LINK}
                  >
                    <Button
                      variant="outline"
                      className={styles.buyBtn}
                    >
                      Buy
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </WalletCard>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-[16px] lg:gap-[24px] w-full">
        <div className="flex-1">
          <WalletCard
            header="Recent Transactions"
            link={ROUTES.walletTransactions}
            linkText="View All"
          >
            {isLoadingTransactions ? (
              <div className="w-full h-full py-[19px] min-h-[218px] flex items-center justify-center">
                <Spinner />
              </div>
            ) : transactions.length ? (
              <div className="flex flex-col min-h-[256px]">
                {transactions.map((transaction, index) => (
                  <WalletTransactionItem
                    transaction={transaction}
                    key={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                height="256px"
                title="You haven’t made any transactions yet"
                description="Your transactions will appear here once you start using the platform."
              />
            )}
          </WalletCard>
        </div>

        <div className="flex-1">
          <WalletCard
            header="Open Orders"
            link={ROUTES.walletOrders}
            linkText="View All"
          >
            {isLoadingOrders ? (
              <div className="w-full h-full py-[19px] min-h-[218px] flex items-center justify-center">
                <Spinner />
              </div>
            ) : openOrders.length ? (
              <div className="flex flex-col min-h-[256px]">
                {openOrders.map((order, index) => (
                  <WalletOrderItemSecondary
                    order={order}
                    key={index}
                    handleAfterCancelOrder={handleAfterCancelOrder}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                height="256px"
                title="No open orders"
                description="Create a buy or sell order to see it here."
              />
            )}
          </WalletCard>
        </div>
      </div>
    </section>
  );
};
