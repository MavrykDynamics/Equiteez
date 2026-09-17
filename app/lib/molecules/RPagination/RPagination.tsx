import clsx from "clsx";

import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./RPagination.module.css";

type RPaginationProps = {
  /** Label announced to assistive technology for the pagination control. */
  ariaLabel?: string;
  className?: string;
  /** One-based page number returned by the API. */
  currentPage: number;
  /** Disables navigation while the next API page is loading. */
  isLoading?: boolean;
  /** Receives the next one-based page number to request from the API. */
  onPageChange: (page: number) => void;
  /** Total page count returned by the API. */
  totalPages: number;
};

type PaginationItem = number | "ellipsis";

function getPaginationItems(
  currentPage: number,
  totalPages: number
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const middleStart = Math.max(2, Math.min(currentPage, totalPages - 3));
  const middleEnd = Math.min(totalPages - 1, middleStart + 2);
  const visiblePages = [1];

  for (let page = middleStart; page <= middleEnd; page += 1) {
    visiblePages.push(page);
  }

  visiblePages.push(totalPages);

  return visiblePages.reduce<PaginationItem[]>((items, page, index) => {
    const previousPage = visiblePages[index - 1];

    if (previousPage && page - previousPage > 1) {
      items.push("ellipsis");
    }

    items.push(page);

    return items;
  }, []);
}

export function RPagination({
  ariaLabel = "Pagination",
  className,
  currentPage,
  isLoading = false,
  onPageChange,
  totalPages,
}: RPaginationProps) {
  const safeTotalPages = Math.max(1, Math.floor(totalPages));
  const safeCurrentPage = Math.min(
    Math.max(1, Math.floor(currentPage)),
    safeTotalPages
  );

  if (safeTotalPages === 1) return null;

  const paginationItems = getPaginationItems(safeCurrentPage, safeTotalPages);
  const isPreviousDisabled = isLoading || safeCurrentPage === 1;
  const isNextDisabled = isLoading || safeCurrentPage === safeTotalPages;

  return (
    <nav aria-label={ariaLabel} className={clsx(styles.pagination, className)}>
      <button
        aria-label="Previous page"
        className={styles.navigationButton}
        disabled={isPreviousDisabled}
        onClick={() => onPageChange(safeCurrentPage - 1)}
        type="button"
      >
        <RIcon aria-hidden="true" name="arrow-short-left" size="small" />
      </button>
      {paginationItems.map((item, index) =>
        item === "ellipsis" ? (
          <span
            aria-hidden="true"
            className={styles.ellipsis}
            key={`ellipsis-${index}`}
          >
            <RText size="body-sm" weight="medium">
              ...
            </RText>
          </span>
        ) : (
          <button
            aria-current={item === safeCurrentPage ? "page" : undefined}
            className={clsx(
              styles.pageButton,
              item === safeCurrentPage && styles.currentPage
            )}
            disabled={isLoading}
            key={item}
            onClick={() => onPageChange(item)}
            type="button"
          >
            <RText size="body-sm" weight="medium">
              {item}
            </RText>
          </button>
        )
      )}
      <button
        aria-label="Next page"
        className={styles.navigationButton}
        disabled={isNextDisabled}
        onClick={() => onPageChange(safeCurrentPage + 1)}
        type="button"
      >
        <RIcon aria-hidden="true" name="arrow-short-right" size="small" />
      </button>
    </nav>
  );
}
