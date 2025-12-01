import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { RoundedCard } from "~/lib/atoms/RoundedCard/RoundedCard";
import styles from "./styles.module.css";
import { InputWithIcons } from "~/lib/organisms/InputWithIcons/InputWithIcons";
import { useTransactions } from "~/lib/apis/mbrwa/user/userTransactions/useTransactions";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { Spinner } from "~/lib/atoms/Spinner";
import { ApiPagination } from "~/lib/organisms/Pagination/ApiPagination";
import { useDebounce } from "use-debounce";
import { EmptyState } from "~/routes/wallet/components/EmptyState/EmptyState";
import { TransactionsFilters } from "~/lib/organisms/WalletFilters/TransactionsFilters";
import { WalletTransactionItem } from "~/routes/wallet.transactions/components/TransactionItem/WalletTransactionItem";
const PAGE_LIMIT = 10;
const SEARCH_START_LENGTH = 3;

export default function WalletTransactions() {
  const { userAddress } = useUserContext();

  const [searchValue, setSearchValue] = useState("");
  const [queryParams, setQueryParams] = useState({
    search: "",
    page: 0,
    transactionType: "",
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

  const { transactions, loading, transactionsCount } = useTransactions(
    queryParams.page * PAGE_LIMIT,
    PAGE_LIMIT,
    userAddress,
    queryParams.search,
    queryParams.transactionType || null
  );

  const handleSelectTransactionType = useCallback(
    (value: string) =>
      setQueryParams((prevState) => ({
        ...prevState,
        page: 0,
        transactionType: value,
      })),
    []
  );

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
  }, []);

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[12px]">
        <Heading level="5">Transactions</Heading>
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
          <TransactionsFilters
            applyFilter={handleSelectTransactionType}
            selectedType={queryParams.transactionType}
          />
        </div>
      </div>
      <RoundedCard className={styles.roundedWrapper}>
        <div className="flex flex-col gap-[16px]">
          {loading ? (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
              <Spinner />
            </div>
          ) : transactionsCount ? (
            <div className="flex flex-col">
              {transactions.map((transaction, index) => (
                <WalletTransactionItem
                  addPadding
                  transaction={transaction}
                  key={index}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="You haven’t made any transactions yet"
              description="Your transactions will appear here once you start using the platform."
            />
          )}
        </div>
      </RoundedCard>
      {transactionsCount && (
        <div className="lg:ml-auto">
          <ApiPagination
            setPage={(page) => {
              setQueryParams((prevState) => ({ ...prevState, page }));
            }}
            page={queryParams.page}
            totalPages={Math.ceil(transactionsCount / PAGE_LIMIT)}
            paginatedDataLength={transactions.length}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  );
}
