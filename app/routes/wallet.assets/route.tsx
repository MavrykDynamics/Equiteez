import React, { useCallback, useMemo, useState } from "react";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { RoundedCard } from "~/lib/atoms/RoundedCard/RoundedCard";
import { Text } from "~/lib/atoms/Typography/Text";
import { InputWithIcons } from "~/lib/organisms/InputWithIcons/InputWithIcons";
import { FormCheckbox } from "~/lib/molecules/FormCheckBox";
import { Spinner } from "~/lib/atoms/Spinner";
import { ApiPagination } from "~/lib/organisms/Pagination/ApiPagination";
import { usePagination } from "~/hooks/usePagination";
import { WalletAssetItem } from "~/routes/wallet.assets/components/AssetItem/AssetItem";
import { ActiveSort, SortingDirection } from "~/lib/types/sort";
import { TableHeader } from "~/routes/wallet.assets/components/TableHeader/TableHeader";
import { EmptyState } from "~/routes/wallet/components/EmptyState/EmptyState";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import styles from "./styles.module.css";
import { useUserAssetsContext } from "~/providers/UserAssets/userAssets.provider";

const PAGE_LIMIT = 10;
const SEARCH_START_LENGTH = 3;
const LOW_BALANCE_VALUE = 2;

export default function WalletAssets() {
  const { userAddress } = useUserContext();
  const [searchValue, setSearchValue] = useState("");
  const [isHideLowBalance, setIsHideLowBalance] = useState(false);
  const [activeSort, setActiveSort] = useState<ActiveSort | null>(null);

  const { userAssets, fixedAssets, loading } = useUserAssetsContext();

  const handleSort = (value: string) => {
    setActiveSort((prev) => {
      if (prev?.value === value) {
        const newSort =
          prev.sort === SortingDirection.ASC
            ? SortingDirection.DESC
            : SortingDirection.ASC;

        return {
          ...prev,
          sort: newSort,
        };
      }

      return {
        value,
        sort: SortingDirection.DESC,
      };
    });
  };

  const sortedItems = useMemo(() => {
    return [...fixedAssets, ...userAssets].sort((a, b) => {
      if (!activeSort) return 0;

      const valueA = a[activeSort.value as keyof typeof a];
      const valueB = b[activeSort.value as keyof typeof b];

      if (typeof valueA === "number" && typeof valueB === "number") {
        return activeSort.sort === SortingDirection.ASC
          ? valueA - valueB
          : valueB - valueA;
      }
      if (typeof valueA === "string" && typeof valueB === "string") {
        return activeSort.sort === SortingDirection.ASC
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return 0;
    });
  }, [fixedAssets, userAssets, activeSort]);

  const filteredList = useMemo(
    () =>
      sortedItems.filter((item) => {
        if (isHideLowBalance && item.available_balance_usd < LOW_BALANCE_VALUE)
          return false;

        const searchTerm = searchValue.trim().toLowerCase();

        if (!searchTerm || searchTerm.length < SEARCH_START_LENGTH) return true;

        const searchSymbol = item.token.symbol.toLowerCase().trim();
        const searchName = item.token.name.toLowerCase().trim();
        const searchSlug = item.tokenSlug.toLowerCase().trim();

        return (
          searchSymbol.includes(searchTerm) ||
          searchName.includes(searchTerm) ||
          searchSlug.includes(searchTerm)
        );
      }),
    [isHideLowBalance, searchValue, sortedItems]
  );

  const { data, page, setPage, totalPages } = usePagination(
    filteredList,
    PAGE_LIMIT
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
      setPage(0);
    },
    [setPage]
  );

  const columns = useMemo(
    () => [
      {
        name: "Asset",
        value: "asset",
        isSortable: false,
        width: "220px",
      },
      {
        name: "Market",
        value: "market",
        isSortable: true,
        width: "100px",
      },
      {
        name: "Price/token",
        value: "token_price",
        isSortable: true,
        width: "130px",
      },
      {
        name: "Avl Balance",
        value: "available_balance_usd",
        isSortable: true,
        width: "130px",
      },
      {
        name: "In Orders",
        value: "in_orders_usd",
        isSortable: true,
        width: "130px",
      },
      {
        name: "Total",
        value: "total_balance_usd",
        isSortable: true,
        width: "130px",
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-[16px]">
      <RoundedCard className={styles.roundedWrapper}>
        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[12px] px-[16px] lg:px-[24px]">
            <div className="flex justify-between">
              <Heading level="5">Assets</Heading>
              <FormCheckbox
                labelClassName="items-center"
                onChange={(checked) => setIsHideLowBalance(checked)}
                checked={isHideLowBalance}
                label={
                  <Text size="smallBody" weight="semibold" color="lightSand">
                    Hide Low Balances
                  </Text>
                }
              />
            </div>

            <div className="w-full">
              <InputWithIcons
                className="min-h-[48px]"
                placeholder="Search Assets"
                value={searchValue}
                onChange={onChange}
                showSearchIcon
              />
            </div>
          </div>
          {loading ? (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
              <Spinner />
            </div>
          ) : data.length && userAddress ? (
            <div className="flex flex-col">
              <TableHeader
                handleSort={handleSort}
                activeSort={activeSort}
                columns={columns}
              />
              {data.map((asset, index) => (
                <WalletAssetItem asset={asset} key={index} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No assets yet"
              description="Go to the marketplace to buy your first asset."
            />
          )}
        </div>
      </RoundedCard>
      {data.length && (
        <div className="lg:ml-auto">
          <ApiPagination
            setPage={setPage}
            page={page}
            totalPages={totalPages}
            paginatedDataLength={data.length}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  );
}
