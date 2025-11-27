import { useMemo, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint, @typescript-eslint/no-explicit-any
export const usePagination = <T extends any>(
  data: T[],
  volume: number = 10
) => {
  /** All pages in total. */
  const totalPages = useMemo(
    () => Math.ceil(data.length / volume),
    [volume, data.length]
  );

  const [page, setPage] = useState(0);
  /** Data representing one single page. */
  const slicedData = useMemo(
    () => data.slice(page * volume, page * volume + volume),
    [data, page, volume]
  );

  return { data: slicedData, page, totalPages, setPage };
};
