import { RIcon, type RIconSortDirection } from "~/lib/atoms/RIcon";

import styles from "./RSortableTableHeader.module.css";

type RSortableTableHeaderProps = {
  direction?: RIconSortDirection;
  label: string;
  onSort: () => void;
};

export function RSortableTableHeader({
  direction,
  label,
  onSort,
}: RSortableTableHeaderProps) {
  return (
    <th aria-sort={direction ?? "none"} scope="col">
      <button
        aria-label={`Sort by ${label}`}
        className={styles.button}
        onClick={onSort}
        type="button"
      >
        {label}
        <RIcon name="sort" size="small" sortDirection={direction} />
      </button>
    </th>
  );
}
