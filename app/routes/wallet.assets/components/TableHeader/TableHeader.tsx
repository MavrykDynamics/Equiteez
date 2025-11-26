import React from "react";
import { Text } from "~/lib/atoms/Typography/Text";
import styles from "~/routes/wallet.assets/styles.module.css";
import { ActiveSort, SortingDirection } from "~/lib/types/sort";
import SortIcon from "app/icons/wallet/sort.svg?react";
import SortDescIcon from "app/icons/wallet/sortDesc.svg?react";
import SortAscIcon from "app/icons/wallet/sortAsc.svg?react";
import classNames from "clsx";

export function TableHeader({
  handleSort,
  columns,
  activeSort,
}: {
  columns: {
    name: string;
    value: string;

    isSortable: boolean;
    width: string;
  }[];
  activeSort: ActiveSort | null;
  handleSort: (value: string) => void;
}) {
  return (
    <div className="justify-between px-[24px] hidden lg:flex">
      {columns.map((item) => {
        const isActiveDesc =
          item.value === activeSort?.value &&
          activeSort.sort === SortingDirection.DESC;
        const isActiveAsc =
          item.value === activeSort?.value &&
          activeSort.sort === SortingDirection.ASC;
        return (
          <div
            style={{ width: item.width }}
            className={classNames(
              item.isSortable ? "cursor-pointer" : "",
              "flex items-center"
            )}
            key={item.value}
            onClick={() => (item.isSortable ? handleSort(item.value) : null)}
          >
            <Text
              size="tinyBody"
              color="lightBlue"
              className="flex items-center"
            >
              {item.name}
            </Text>
            {item.isSortable &&
              (isActiveDesc ? (
                <SortDescIcon />
              ) : isActiveAsc ? (
                <SortAscIcon />
              ) : (
                <SortIcon />
              ))}
          </div>
        );
      })}
      <div className={styles.emptyDotsBlock} />
    </div>
  );
}
