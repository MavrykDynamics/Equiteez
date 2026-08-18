import { RIcon, type RIconSortDirection } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./RSortableTableHeader.module.css";

export type SortDirection = "ascending" | "descending";

export type SortState<TKey extends string> = {
  direction: SortDirection;
  key: TKey;
} | null;

type TableHeaderProps = {
  direction?: RIconSortDirection;
  label: string;
  onSort?: () => void;
};

export function getNextSortState<TKey extends string>(
  currentSort: SortState<TKey>,
  key: TKey
): Exclude<SortState<TKey>, null> {
  return {
    direction:
      currentSort?.key === key && currentSort.direction === "descending"
        ? "ascending"
        : "descending",
    key,
  };
}

export function TableHeader({
  direction,
  label,
  onSort,
}: TableHeaderProps) {
  return (
    <div>
      {onSort ? (
        <button
          className={styles.button}
          onClick={onSort}
          type="button"
        >
          <RText color="neutral-700" size="body-xs" weight="medium">
            {label}
          </RText>
          <RIcon name="sort" size="small" sortDirection={direction} />
        </button>
      ) : (
        <RText color="neutral-700" size="body-xs" weight="medium">
          {label}
        </RText>
      )}
    </div>
  );
}
