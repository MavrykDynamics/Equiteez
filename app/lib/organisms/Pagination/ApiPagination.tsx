import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Text } from "~/lib/atoms/Typography/Text";
import Money from "~/lib/atoms/Money";
import ArrowLeft from "app/icons/chevron-left.svg?react";
import ArrowRight from "app/icons/chevron-right.svg?react";
import styles from "./styles.module.css";

type Props = {
  totalPages: number;
  page: number;
  setPage: (v: number) => void;
  paginatedDataLength: number;
  isLoading: boolean;
};

export function ApiPagination(props: Props) {
  const { totalPages, page, paginatedDataLength, setPage, isLoading } = props;

  const [pageError, setPageError] = useState(false);
  const [pageInput, setPageInput] = useState("");

  const pageToShow = useMemo(
    () => (paginatedDataLength === 0 ? 1 : page + 1),
    [page, paginatedDataLength]
  );

  useEffect(() => {
    setPageInput(String(page + 1));
    if (page >= 0 && page < totalPages) {
      setPageError(false);
    }
  }, [page, setPage, totalPages, paginatedDataLength]);

  const handlePageInput = (val: string) => {
    if (val.startsWith("-")) val = val.slice(1);
    val = val.slice(0, totalPages.toString().length);

    const numberPage = Number(val);

    if (numberPage >= 0 && numberPage <= totalPages) {
      setPageError(false);
    } else {
      setPageError(true);
    }

    setPageInput(val);
  };

  const handleBlurInput = () => {
    if (!pageError) setPage(Number(pageInput) - 1);
  };

  return (
    <div className="w-full lg:w-auto flex gap-8 items-center justify-between lg:justify-center">
      <button
        onClick={() => {
          if (page > 0) setPage(page - 1);
        }}
        disabled={page <= 0 || pageToShow === 0 || isLoading}
        className={styles.paginationBtn}
      >
        <ArrowLeft className="stroke-current w-4 h-4" />
      </button>

      <div className="flex items-center gap-2">
        <input
          name="pageNumber"
          type="text"
          disabled={isLoading}
          onBlur={handleBlurInput}
          size={page.toString().length}
          value={pageInput}
          onChange={(e) => handlePageInput(e.target.value)}
          className={clsx(
            styles.paginationInput,
            pageError && styles.paginationInputError
          )}
        ></input>
        <Text size="smallBody">
          of <Money tooltip={false}>{totalPages || 1}</Money>
        </Text>
      </div>

      <button
        onClick={() => {
          if (page <= totalPages) setPage(page + 1);
        }}
        disabled={page >= totalPages - 1 || isLoading}
        className={styles.paginationBtn}
      >
        <ArrowRight className="stroke-current w-4 h-4"></ArrowRight>
      </button>
    </div>
  );
}
