import { useCallback, useEffect, useRef, useState } from "react";
import usePrevious from "~/lib/ui/hooks/usePrevious";
import { isAbortError } from "~/errors/error";
import { currentDipdupLvlProxy } from "~/providers/DipdupProvider/utils/observeCurrentIndexerLevel";
import { OperationVariables } from "@apollo/client/index";

/**
 * @param asyncFunction - async function that fetches data
 * @param refetchOptions – options for custom refetch logic
 *    @param refetchOptions -> @blocksDiff - refetch when block difference reaches this value
 *    @param refetchOptions -> @refetchQueryVariables - fn that returns variables if dynamic, or object itself
 */
export const useAsyncWithRefetch = <
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  asyncFunction: (variables?: TVariables) => Promise<TData>,
  refetchOptions?: {
    blocksDiff?: number;
    refetchQueryVariables?: (() => TVariables) | TVariables;
  }
) => {
  const lastUpdatedBlock = useRef<null | number>(null);
  const refetchId = useRef<null | string>(null);
  const isInitialFetchDone = useRef(false);
  const [shouldRunFetch, setShouldRunFetch] = useState(false);
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const { blocksDiff, refetchQueryVariables } = refetchOptions ?? {};

  // Track previous variables to check if they change
  const prevQueryVariables = usePrevious(refetchQueryVariables) as TVariables;
  const currentQueryVariables =
    typeof refetchQueryVariables === "function"
      ? refetchQueryVariables()
      : refetchQueryVariables;

  // Effect to reset `isInitialFetchDone` when variables change
  useEffect(() => {
    if (prevQueryVariables && currentQueryVariables) {
      const isVarsChanged = Object.keys(currentQueryVariables ?? {}).some(
        (key) => currentQueryVariables?.[key] !== prevQueryVariables?.[key]
      );

      if (isVarsChanged) setShouldRunFetch(true);
    }
  }, [currentQueryVariables]);

  // Function to execute async fetch
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await asyncFunction(currentQueryVariables);
      setData(result);
      setShouldRunFetch(false);
      isInitialFetchDone.current = true;
    } catch (e) {
      if (!isAbortError(e)) {
        console.error("useAsyncWithRefetch fetchData callback error:", e);
        setError(e as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, currentQueryVariables]);

  // Initial fetch
  useEffect(() => {
    if (isInitialFetchDone.current && !shouldRunFetch) return;
    fetchData();
  }, [shouldRunFetch, fetchData]);

  // Function to refetch on block level change
  const refetchQuery = useCallback(
    async (newIndexerLevel: number) => {
      if (!isInitialFetchDone.current) return;

      try {
        // If blocksDiff is set, only refetch when the difference is met
        if (typeof blocksDiff === "number") {
          if (lastUpdatedBlock.current === null) {
            lastUpdatedBlock.current = newIndexerLevel;
            return;
          }

          if (newIndexerLevel - lastUpdatedBlock.current >= blocksDiff) {
            await fetchData();
            lastUpdatedBlock.current = newIndexerLevel;
          }

          return;
        }

        await fetchData();
      } catch (e) {
        console.error("refetchQuery callback error in useAsyncWithRefetch:", e);
      }
    },
    [blocksDiff, refetchQueryVariables, fetchData]
  );

  // Subscribe/unsubscribe from indexer level updates
  useEffect(() => {
    if (!refetchId.current) {
      refetchId.current = currentDipdupLvlProxy.registerListener(refetchQuery);
    }

    return () => {
      if (refetchId.current) {
        currentDipdupLvlProxy.removeListener(refetchId.current);
        refetchId.current = null;
      }
    };
  }, [refetchQuery]);

  return { data, loading, error, refetch: fetchData };
};
