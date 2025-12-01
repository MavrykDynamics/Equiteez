import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { RoundedCard } from "~/lib/atoms/RoundedCard/RoundedCard";
import { Text } from "~/lib/atoms/Typography/Text";
import styles from "./styles.module.css";
import { InputWithIcons } from "~/lib/organisms/InputWithIcons/InputWithIcons";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { Spinner } from "~/lib/atoms/Spinner";
import { ApiPagination } from "~/lib/organisms/Pagination/ApiPagination";
import { useDebounce } from "use-debounce";
import { useOrders } from "~/lib/userOrders/useOrders";
import { WalletOrderItem } from "~/routes/wallet.orders/components/OrderItem/OrderItem";
import { EmptyState } from "~/routes/wallet/components/EmptyState/EmptyState";
import { OpenOrdersFilters } from "~/lib/organisms/WalletFilters/OpenOrdersFilters";
import { WalletOrderItemSecondary } from "~/routes/wallet.orders/components/OrderItem/OrderItemSecondary";

const PAGE_LIMIT = 10;
const SEARCH_START_LENGTH = 3;

export default function WalletOrders() {
  const { userAddress } = useUserContext();

  const [searchValue, setSearchValue] = useState("");
  const [queryParams, setQueryParams] = useState({
    search: "",
    page: 0,
    orderType: "",
  });

  const searchTerm = useMemo(() => {
    const term = searchValue.trim().toLowerCase();

    if (term.length < SEARCH_START_LENGTH) return "";

    return term;
  }, [searchValue]);

  const [searchValueDebounced] = useDebounce(searchTerm, 300);

  useEffect(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: searchValueDebounced,
      page: 0,
    }));
  }, [searchValueDebounced]);

  const { openOrders, loading, openOrdersCount, refetch } = useOrders(
    queryParams.page * PAGE_LIMIT,
    PAGE_LIMIT,
    userAddress,
    queryParams.search,
    queryParams.orderType || null
  );

  const handleApplyOrderType = useCallback(
    (orderType: string) =>
      setQueryParams((prevState) => ({
        ...prevState,
        page: 0,
        orderType: orderType,
      })),
    []
  );

  const handleAfterCancelOrder = useCallback(async () => {
    if (queryParams.page !== 0) {
      setQueryParams((prevState) => ({ ...prevState, page: 0 }));
    } else {
      await refetch();
    }
  }, [queryParams.page, refetch]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
  }, []);

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[12px]">
        <Text size="largeBody" weight="semibold">
          Open Orders
        </Text>
        <div className="flex gap-[12px]">
          <div className="flex-1">
            <InputWithIcons
              className="min-h-[48px] bg-[var(--color-neutral-light)]"
              placeholder="Search Assets"
              value={searchValue}
              onChange={onChange}
              showSearchIcon
            />
          </div>
          <OpenOrdersFilters
            applyFilter={handleApplyOrderType}
            selectedType={queryParams.orderType}
          />
        </div>
      </div>
      <RoundedCard className={styles.roundedWrapper}>
        <div className="flex flex-col gap-[16px]">
          {loading ? (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
              <Spinner />
            </div>
          ) : openOrdersCount ? (
            <>
              <div className="hidden lg:flex flex-col">
                <div className={styles.orderRow}>
                  <Text size="tinyBody" color="lightSand" className="p-[8px]">
                    Asset
                  </Text>
                  <Text size="tinyBody" color="lightSand" className="p-[8px]">
                    Type
                  </Text>
                  <Text size="tinyBody" color="lightSand" className="p-[8px]">
                    Price/Token
                  </Text>
                  <Text size="tinyBody" color="lightSand" className="p-[8px]">
                    Amount
                  </Text>
                  <Text size="tinyBody" color="lightSand" className="p-[8px]">
                    Total
                  </Text>
                  <span />
                </div>
                {openOrders.map((order, index) => (
                  <WalletOrderItem
                    order={order}
                    key={index}
                    handleAfterCancelOrder={handleAfterCancelOrder}
                  />
                ))}
              </div>
              <div className="flex flex-col lg:hidden px-[16px]">
                {openOrders.map((order, index) => (
                  <WalletOrderItemSecondary
                    order={order}
                    key={index}
                    handleAfterCancelOrder={handleAfterCancelOrder}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="No open orders"
              description="Create a buy or sell order to see it here."
            />
          )}
        </div>
      </RoundedCard>
      {openOrdersCount && (
        <div className="lg:ml-auto">
          <ApiPagination
            setPage={(page) => {
              setQueryParams((prevState) => ({ ...prevState, page }));
            }}
            page={queryParams.page}
            totalPages={Math.ceil(openOrdersCount / PAGE_LIMIT)}
            paginatedDataLength={openOrders.length}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  );
}
